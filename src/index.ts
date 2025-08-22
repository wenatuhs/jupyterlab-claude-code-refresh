import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IDocumentManager } from '@jupyterlab/docmanager';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { showDialog, showErrorMessage, Dialog } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { Contents } from '@jupyterlab/services';
import { Signal } from '@lumino/signaling';

/**
 * Interface for plugin settings
 */
type LogLevel = 'none' | 'info' | 'debug';

interface ISettings {
  enabled: boolean;
  refreshDelay: number;
  showNotifications: boolean;
  logLevel: LogLevel;
  conflictResolution: 'ask' | 'keepLocal' | 'useExternal';
  showWelcomeBanner: boolean;
}

/**
 * Claude Code Auto-Refresh Extension
 *
 * Automatically refreshes notebooks when they are modified externally by Claude Code
 */
class ClaudeCodeAutoRefresh {
  private _app: JupyterFrontEnd;
  private _contentsManager: Contents.IManager;
  private _settings: ISettings;
  private _settingsRegistry: ISettingRegistry | null = null;
  private _refreshTimers: Map<string, number> = new Map();
  private _showNotifications: boolean;
  private _debugTimer: number | null = null;
  private _lastSeenFiles: Map<string, number> = new Map(); // path -> last modified time
  private _lastUserSaves: Map<string, number> = new Map(); // track user-initiated saves
  private _activeConflictDialogs: Map<string, any> = new Map(); // track open dialogs per file
  private _activeNotifications: Map<string, any> = new Map(); // track open notifications per file
  private _hasShownWelcome = false;

  constructor(app: JupyterFrontEnd, contentsManager: Contents.IManager) {
    this._app = app;
    this._contentsManager = contentsManager;
    this._showNotifications = true;
    this._settings = {
      enabled: true,
      refreshDelay: 500,
      showNotifications: false,
      logLevel: 'none',
      conflictResolution: 'ask',
      showWelcomeBanner: true
    };
  }

  /**
   * Initialize the auto-refresh functionality
   */
  public initialize(): void {
    if (!this._settings.enabled) {
      this._logInfo('Extension disabled in settings');
      return;
    }

    // Listen for file changes from the contents manager
    this._contentsManager.fileChanged.connect(this._onFileChanged, this);

    // Track user-initiated saves by monitoring notebook context saves
    this._setupSaveTracking();

    // Log initial state
    this._logInfo('Extension initialized and file watching enabled');
    this._logDebug('Contents manager:', this._contentsManager);

    // Log currently open notebooks
    const openNotebooks = this._getOpenNotebooks();
    this._logDebug(
      'Currently open notebooks:',
      openNotebooks.map(nb => nb.context.path)
    );

    // Set up polling for file changes (always enabled as fallback)
    this._startPolling();

    // Show welcome banner if enabled in settings
    // Note: localStorage is only used when settings are unavailable
    const shouldShowWelcome =
      this._settings.showWelcomeBanner && !this._hasShownWelcome;

    if (shouldShowWelcome) {
      this._showWelcomeBanner();
    }
  }

  /**
   * Logging helper with levels
   */
  private _log(level: LogLevel, message: string, data?: any): void {
    const currentLevel = this._settings.logLevel;

    // Determine if we should log based on level hierarchy: debug > info > none
    const shouldLog =
      currentLevel === 'debug' || (currentLevel === 'info' && level === 'info');

    if (shouldLog) {
      const prefix = `Claude Code Auto-Refresh [${level.toUpperCase()}]:`;
      if (data) {
        console.log(prefix, message, data);
      } else {
        console.log(prefix, message);
      }
    }
  }

  /**
   * Info-level logging (shown when logLevel is 'info' or 'debug')
   */
  private _logInfo(message: string, data?: any): void {
    this._log('info', message, data);
  }

  /**
   * Debug-level logging (only shown when logLevel is 'debug')
   */
  private _logDebug(message: string, data?: any): void {
    this._log('debug', message, data);
  }

  /**
   * Set the settings registry (needed for updating settings)
   */
  public setSettingsRegistry(settingsRegistry: ISettingRegistry | null): void {
    this._settingsRegistry = settingsRegistry;
  }

  /**
   * Update plugin settings
   */
  public updateSettings(settings: Partial<ISettings>): void {
    this._settings = { ...this._settings, ...settings };
    this._logDebug('Settings updated', this._settings);
  }

  /**
   * Show welcome banner with usage tips
   */
  private async _showWelcomeBanner(): Promise<void> {
    this._hasShownWelcome = true;

    const welcomeMessage = `Your notebook will now automatically refresh when Claude Code modifies it.

💡 Key tip: Save your work before asking Claude Code to modify open notebooks for the best experience.

Configure in Settings → Claude Code Auto-Refresh`;

    const result = await showDialog({
      title: '🚀 Claude Code Auto-Refresh Enabled',
      body: welcomeMessage,
      buttons: [
        Dialog.createButton({ label: 'Got it!', className: 'jp-mod-accept' }),
        Dialog.createButton({
          label: "Don't show again",
          className: 'jp-mod-reject'
        })
      ]
    });

    if (result.button.label === "Don't show again") {
      // Disable welcome banner permanently by updating settings and persisting to storage
      await this._disableWelcomeBanner();
    }
  }

  /**
   * Disable welcome banner permanently
   */
  private async _disableWelcomeBanner(): Promise<void> {
    // Update local settings immediately
    this.updateSettings({ showWelcomeBanner: false });

    try {
      // Try to persist to JupyterLab settings registry
      if (this._settingsRegistry) {
        const settings = await this._settingsRegistry.load(
          'jupyterlab-claude-code-refresh:plugin'
        );
        await settings.set('showWelcomeBanner', false);
        this._logInfo('Welcome banner disabled in JupyterLab settings');
      } else {
        this._logInfo(
          'Settings registry not available, banner disabled for current session only'
        );
      }
    } catch (error) {
      this._logInfo(
        'Could not persist welcome banner setting to registry:',
        error
      );
    }
  }

  /**
   * Start polling for file changes
   */
  private _startPolling(): void {
    this._logDebug('Starting file polling');

    this._debugTimer = window.setInterval(() => {
      this._checkFilesForChanges();
    }, this._settings.refreshDelay * 2); // Poll at 2x refresh delay interval
  }

  /**
   * Check open notebook files for changes (polling-based fallback)
   */
  private async _checkFilesForChanges(): Promise<void> {
    // Check if auto-refresh is enabled
    if (!this._settings.enabled) {
      this._logDebug('Auto-refresh disabled, skipping polling check');
      return;
    }

    try {
      const openNotebooks = this._getOpenNotebooks();

      this._logDebug('Polling check - open notebooks:', openNotebooks.length);

      for (const notebook of openNotebooks) {
        const path = notebook.context.path;

        this._logDebug('Checking file for changes:', path);

        // Get file info from contents manager
        const fileModel = await this._contentsManager.get(path, {
          content: false
        });
        const lastModified = new Date(fileModel.last_modified).getTime();

        // Check if file was modified since we last saw it
        const lastSeen = this._lastSeenFiles.get(path);
        const lastUserSave = this._lastUserSaves.get(path) || 0;

        if (lastSeen && lastModified > lastSeen) {
          // Check if this was a user-initiated save (within last 2 seconds)
          const isUserSave = lastModified - lastUserSave < 2000;

          if (!isUserSave) {
            this._logInfo('External change detected', {
              path,
              lastModified: new Date(lastModified)
            });

            this._handleExternalChange(notebook.context);
          } else {
            this._logDebug('Ignoring user-initiated save for:', path);
          }
        }

        // Update last seen time
        this._lastSeenFiles.set(path, lastModified);
      }
    } catch (error) {
      this._logInfo('Error during polling check', error);
    }
  }

  /**
   * Handle file change events
   */
  private _onFileChanged(
    sender: Contents.IManager,
    change: Contents.IChangedArgs
  ): void {
    // Check if auto-refresh is enabled
    if (!this._settings.enabled) {
      this._logDebug('Auto-refresh disabled, ignoring file change event');
      return;
    }

    this._logDebug('File change event detected', {
      type: change.type,
      oldValue: change.oldValue,
      newValue: change.newValue,
      timestamp: new Date().toISOString()
    });

    // Log ALL change types for debugging
    if (change.newValue && change.newValue.path) {
      this._logDebug('File path changed:', change.newValue.path);
    }

    // Process different types of events
    if (change.type === 'save' && change.newValue) {
      this._handleSaveEvent(change.newValue as Contents.IModel);
    } else if (change.type === 'rename' && change.newValue) {
      this._handleRenameEvent(
        change.oldValue as Contents.IModel | null,
        change.newValue as Contents.IModel
      );
    } else {
      this._logDebug('Ignoring change type:', change.type);
    }
  }

  /**
   * Handle external changes with conflict resolution
   */
  private async _handleExternalChange(
    context: DocumentRegistry.IContext<any>
  ): Promise<void> {
    // Check if auto-refresh is enabled
    if (!this._settings.enabled) {
      this._logDebug(
        'Auto-refresh disabled, ignoring external change for:',
        context.path
      );
      return;
    }

    const path = context.path;

    // Check if notebook has unsaved changes
    if (context.model.dirty) {
      // Handle conflict based on user settings
      switch (this._settings.conflictResolution) {
        case 'ask':
          await this._showConflictDialog(context);
          break;
        case 'keepLocal':
          this._logInfo('Keeping local changes, ignoring external change');
          if (this._settings.showNotifications) {
            void showDialog({
              title: 'External Change Detected',
              body: `${path
                .split('/')
                .pop()} was modified externally, but keeping your local changes.`,
              buttons: [Dialog.okButton()]
            });
          }
          break;
        case 'useExternal':
          this._logInfo('Using external changes, discarding local changes');
          this._scheduleRefresh(context);
          break;
      }
    } else {
      // No local changes, safe to refresh
      this._scheduleRefresh(context);
    }
  }

  /**
   * Show conflict resolution dialog (with deduplication)
   */
  private async _showConflictDialog(
    context: DocumentRegistry.IContext<any>
  ): Promise<void> {
    const path = context.path;

    // Check if there's already an active dialog for this file
    if (this._activeConflictDialogs.has(path)) {
      this._logDebug('Conflict dialog already active for:', path);
      return;
    }

    // Mark dialog as active
    this._activeConflictDialogs.set(path, true);

    try {
      const fileName = path.split('/').pop();
      const result = await showDialog({
        title: 'Notebook Modified Externally',
        body: `${fileName} has been modified by an external program (possibly Claude Code). You have unsaved changes. What would you like to do?`,
        buttons: [
          Dialog.createButton({
            label: 'Keep My Changes',
            className: 'jp-mod-accept'
          }),
          Dialog.createButton({
            label: 'Use External Changes',
            className: 'jp-mod-warn'
          }),
          Dialog.createButton({ label: 'Cancel', className: 'jp-mod-reject' })
        ]
      });

      if (result.button.label === 'Use External Changes') {
        this._scheduleRefresh(context);
      } else if (result.button.label === 'Keep My Changes') {
        // Do nothing, keep local changes
        this._logDebug('User chose to keep local changes');
      }
    } finally {
      // Always remove the dialog from active list when done
      this._activeConflictDialogs.delete(path);
    }
  }

  /**
   * Setup tracking of user-initiated saves
   */
  private _setupSaveTracking(): void {
    // Initialize file tracking for existing notebooks
    const notebooks = this._getOpenNotebooks();
    notebooks.forEach(({ context }) => {
      this._contentsManager
        .get(context.path, { content: false })
        .then(fileModel => {
          this._lastSeenFiles.set(
            context.path,
            new Date(fileModel.last_modified).getTime()
          );
        })
        .catch(error =>
          this._logDebug('Error initializing file tracking:', error)
        );
    });
  }

  /**
   * Track user-initiated saves
   */
  private _trackUserSave(path: string): void {
    this._lastUserSaves.set(path, Date.now());
  }

  /**
   * Handle save events
   */
  private _handleSaveEvent(fileModel: Contents.IModel): void {
    const { path, type } = fileModel;

    this._logDebug('Save event for file:', { path, type });

    if (!path || type !== 'notebook' || !path.endsWith('.ipynb')) {
      return;
    }

    // Track this as a potential user save
    this._trackUserSave(path);

    // Check if the notebook is currently open
    const openNotebooks = this._getOpenNotebooks();
    const openNotebook = openNotebooks.find(nb => nb.context.path === path);

    if (!openNotebook) {
      this._logDebug('Notebook not currently open:', path);
      return;
    }

    this._logDebug('Processing notebook save event:', path);

    // Don't auto-refresh for user-initiated saves detected via file events
    // The polling mechanism will handle external changes more accurately
  }

  /**
   * Handle rename events
   */
  private _handleRenameEvent(
    oldModel: Contents.IModel | null,
    newModel: Contents.IModel
  ): void {
    this._logDebug('Rename event', {
      oldPath: oldModel?.path,
      newPath: newModel.path
    });
    // Handle notebook renames if needed in the future
  }


  /**
   * Schedule a refresh for the given notebook context
   */
  private _scheduleRefresh(context: DocumentRegistry.IContext<any>): void {
    const path = context.path;

    // Clear any existing timer for this file
    const existingTimer = this._refreshTimers.get(path);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    // Schedule the refresh with a delay to batch rapid changes
    const timer = window.setTimeout(() => {
      this._refreshNotebook(context);
      this._refreshTimers.delete(path);
    }, this._settings.refreshDelay);

    this._refreshTimers.set(path, timer);
  }

  /**
   * Refresh the notebook from disk
   */
  private async _refreshNotebook(
    context: DocumentRegistry.IContext<any>
  ): Promise<void> {
    try {
      this._logInfo('Refreshing notebook', context.path);

      // Use the context's revert method to reload from disk
      await context.revert();

      if (this._settings.showNotifications && this._showNotifications) {
        await this._showRefreshNotification(context.path);
      }

      this._logInfo('Successfully refreshed', context.path);
    } catch (error) {
      this._logInfo('Error refreshing notebook', error);

      showErrorMessage(
        'Error Refreshing Notebook',
        `Could not refresh ${context.path.split('/').pop()}: ${error}`
      );
    }
  }

  /**
   * Show refresh notification with deduplication
   */
  private async _showRefreshNotification(path: string): Promise<void> {
    const fileName = path.split('/').pop();

    // Check if there's already an active notification for this file
    if (this._activeNotifications.has(path)) {
      this._logDebug('Refresh notification already active for:', path);
      return;
    }

    // Mark notification as active
    this._activeNotifications.set(path, true);

    try {
      await showDialog({
        title: 'Notebook Refreshed',
        body: `${fileName} has been refreshed from disk`,
        buttons: [Dialog.okButton()]
      });
    } finally {
      // Always remove the notification from active list when done
      this._activeNotifications.delete(path);
    }
  }

  /**
   * Get all currently open notebook contexts
   */
  private _getOpenNotebooks(): Array<{
    context: DocumentRegistry.IContext<any>;
    widget: any;
  }> {
    const notebooks: Array<{
      context: DocumentRegistry.IContext<any>;
      widget: any;
    }> = [];

    try {
      // Iterate through all open documents using the shell
      const shell = this._app.shell;
      const widgets = Array.from(shell.widgets('main'));

      this._logDebug('Total widgets in main area:', widgets.length);

      widgets.forEach((widget: any, index: number) => {
        this._logDebug(`Widget ${index}:`, {
          id: widget.id,
          title: widget.title?.label,
          hasContext: !!widget.context,
          contextPath: widget.context?.path,
          modelType: widget.context?.model?.type,
          widgetClassName: widget.constructor?.name
        });

        // Try multiple ways to detect if this is a notebook
        const isNotebook =
          // Original check
          (widget.context &&
            widget.context.model &&
            widget.context.model.type === 'notebook') ||
          // Check by file extension
          (widget.context &&
            widget.context.path &&
            widget.context.path.endsWith('.ipynb')) ||
          // Check by widget class name
          (widget.constructor &&
            widget.constructor.name &&
            widget.constructor.name.includes('Notebook'));

        if (isNotebook) {
          notebooks.push({
            context: widget.context,
            widget: widget
          });
          this._logDebug('Found notebook widget:', widget.context.path);
        }
      });

      this._logDebug('Total notebook widgets found:', notebooks.length);
    } catch (error) {
      this._logInfo('Error getting open notebooks:', error);
    }

    return notebooks;
  }

  /**
   * Dispose of the auto-refresh functionality
   */
  public dispose(): void {
    // Clear all pending timers
    this._refreshTimers.forEach(timer => window.clearTimeout(timer));
    this._refreshTimers.clear();

    // Clear debug timer
    if (this._debugTimer) {
      window.clearInterval(this._debugTimer);
      this._debugTimer = null;
    }

    // Clear active dialogs and notifications
    this._activeConflictDialogs.clear();
    this._activeNotifications.clear();

    // Disconnect file change signal
    Signal.disconnectAll(this);

    this._logInfo('Disposed');
  }
}

/**
 * Initialization data for the Claude Code Auto-Refresh extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-claude-code-refresh:plugin',
  description: 'Auto-refresh notebooks when modified by Claude Code',
  autoStart: true,
  requires: [IDocumentManager],
  optional: [ISettingRegistry],
  activate: async (
    app: JupyterFrontEnd,
    docManager: IDocumentManager,
    settingRegistry: ISettingRegistry | null
  ) => {
    console.log('Claude Code Auto-Refresh extension is activated!');

    // Create the auto-refresh instance
    const autoRefresh = new ClaudeCodeAutoRefresh(
      app,
      app.serviceManager.contents
    );

    // Set the settings registry reference
    autoRefresh.setSettingsRegistry(settingRegistry);

    // Load settings if available
    if (settingRegistry) {
      try {
        const settings = await settingRegistry.load(plugin.id);
        const pluginSettings: ISettings = {
          enabled: settings.get('enabled').composite as boolean,
          refreshDelay: settings.get('refreshDelay').composite as number,
          showNotifications: settings.get('showNotifications')
            .composite as boolean,
          logLevel: settings.get('logLevel').composite as LogLevel,
          conflictResolution: settings.get('conflictResolution').composite as
            | 'ask'
            | 'keepLocal'
            | 'useExternal',
          showWelcomeBanner: settings.get('showWelcomeBanner')
            .composite as boolean
        };

        autoRefresh.updateSettings(pluginSettings);

        // Listen for settings changes
        settings.changed.connect(() => {
          const newSettings: ISettings = {
            enabled: settings.get('enabled').composite as boolean,
            refreshDelay: settings.get('refreshDelay').composite as number,
            showNotifications: settings.get('showNotifications')
              .composite as boolean,
            logLevel: settings.get('logLevel').composite as LogLevel,
            conflictResolution: settings.get('conflictResolution').composite as
              | 'ask'
              | 'keepLocal'
              | 'useExternal',
            showWelcomeBanner: settings.get('showWelcomeBanner')
              .composite as boolean
          };
          autoRefresh.updateSettings(newSettings);
        });
      } catch (error) {
        console.warn(
          'Claude Code Auto-Refresh: Could not load settings',
          error
        );
      }
    }

    // Initialize the auto-refresh functionality
    autoRefresh.initialize();

    // Clean up when the application shuts down
    app.restored.then(() => {
      window.addEventListener('beforeunload', () => {
        autoRefresh.dispose();
      });
    });
  }
};

export default plugin;
