# Claude Code Auto-Refresh

[![Github Actions Status](https://github.com/zhezhang77/jupyterlab-claude-code-refresh/workflows/Build/badge.svg)](https://github.com/zhezhang77/jupyterlab-claude-code-refresh/actions/workflows/build.yml)

A JupyterLab extension that automatically refreshes notebooks when they are modified externally by Claude Code.

## Problem

When using Claude Code within JupyterLab's built-in terminal, Claude Code can modify your open notebooks perfectly. However, you need to manually refresh the notebook to see the changes because JupyterLab doesn't automatically detect external file modifications.

## Solution

This extension solves that problem by automatically refreshing notebooks when external changes are detected:

- **File Watching**: Monitors file system changes for notebook files (.ipynb)
- **Smart Detection**: Identifies when changes were made externally (not by JupyterLab itself)  
- **Auto-Refresh**: Automatically refreshes the notebook view from disk
- **Conflict Resolution**: Handles cases where you have unsaved changes

## Features

- ✅ Automatically detects external modifications to open notebooks
- ✅ Refreshes notebook content from disk without losing your place
- ✅ Intelligent conflict resolution when you have unsaved changes
- ✅ Configurable refresh delays and logging levels
- ✅ Optional notifications when notebooks are refreshed
- ✅ Can be enabled/disabled through JupyterLab settings
- ✅ Works seamlessly with Claude Code terminal workflow

## Requirements

- JupyterLab >= 4.0.0

## Installation

### From Source (Development)

1. Clone or download this repository
2. Install dependencies:
   ```bash
   jlpm install
   ```
3. Build the extension:
   ```bash
   jlpm build:prod
   ```
4. Install in JupyterLab:
   ```bash
   jupyter labextension develop . --overwrite
   ```

## Usage

1. Install and enable the extension
2. Open a notebook in JupyterLab
3. Use Claude Code in the terminal to modify the notebook
4. The notebook will automatically refresh to show Claude Code's changes!

## Configuration

Access settings through JupyterLab's Settings menu > Settings Editor > Claude Code Auto-Refresh:

- **Enable Auto-Refresh**: Toggle the extension on/off (default: true)
- **Refresh Delay**: Delay in milliseconds before refreshing (default: 500ms)
- **Show Notifications**: Display notifications when notebooks are refreshed (default: true)

## How It Works

1. **File System Monitoring**: The extension listens to JupyterLab's `Contents.IManager.fileChanged` signal
2. **Smart Filtering**: Only processes 'save' events for notebook files (.ipynb)
3. **External Change Detection**: Checks if the notebook is currently "clean" (no unsaved changes), indicating external modification
4. **Batched Refresh**: Uses a configurable delay to batch rapid changes
5. **Content Refresh**: Calls the notebook context's `revert()` method to reload from disk

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab-claude-code-refresh
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the myextension directory
# Install package in development mode
pip install -e "."
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall myextension
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `myextension` within that folder.

### Testing the extension

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro/) for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
