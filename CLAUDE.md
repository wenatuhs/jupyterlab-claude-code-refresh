# CLAUDE.md - JupyterLab Claude Code Auto-Refresh Extension

This file provides guidance to Claude Code when working with this JupyterLab extension.

## 🎯 PROJECT STATUS: PUBLISHED TO PyPI! 🚀

The Claude Code Auto-Refresh extension is **live on PyPI** and available for installation worldwide!

## 📋 COMPLETED WORK

### ✅ Core Functionality (100% Complete)

- **Auto-refresh detection**: Monitors external changes to open notebooks (.ipynb files)
- **Smart conflict resolution**: Handles cases with unsaved changes (ask/keepLocal/useExternal)
- **Dual detection system**: File events + polling fallback for reliable detection
- **Deduplication**: Prevents notification/dialog spam during rapid changes
- **User-initiated save tracking**: Distinguishes external vs user changes

### ✅ Settings & UX (100% Complete)

- **Comprehensive settings**: Enable/disable, refresh delay, log levels, notifications, conflict resolution
- **Professional settings layout**: Main options first, advanced options at bottom
- **Welcome banner**: Concise with "Don't show again" functionality that persists properly
- **Log levels**: none/info/debug with proper hierarchy (defaults to 'none' - no console spam)
- **Default behaviors**: Sensible defaults (no notifications, no logging by default)

### ✅ Code Quality (100% Complete)

- **Clean TypeScript**: ESLint/Prettier compliant, proper error handling
- **Removed unused code**: Eliminated template files, unused dependencies, commented code
- **Proper dependencies**: Only required packages, correct peer dependencies
- **Professional structure**: Organized tests/, clean build artifacts

### ✅ Repository & Git (100% Complete)

- **Git initialized**: Clean commit history starting with comprehensive initial commit
- **Proper .gitignore**: Excludes build artifacts, includes source files
- **Documentation**: Updated README, organized test files with instructions
- **Package metadata**: Correct URLs, author info, license (BSD-3-Clause)

### ✅ Testing & Quality (100% Complete)

- **Test suite**: Python script simulating external modifications (tests/test_notebook_modifications.py)
- **Verification**: Extension builds, installs, and functions correctly
- **Production build**: Clean webpack build, properly deployed schemas
- **Lint passing**: All code quality checks pass

## 🔄 CURRENT ENVIRONMENT

**Working Directory**: `/Users/zhezhang/Projects/jupyterlab-ext-claude-code/jupyterlab-claude-code-refresh/`
**Conda Environment**: `llm` (activate with: `source /usr/local/anaconda3/bin/activate llm`)
**Extension Status**: Installed and verified working in JupyterLab 4.4.6

## ✅ ALL TASKS COMPLETED! 

### 🎉 Recent Accomplishments (2025-08-22)

1. **✅ Icon Updated**: Changed to refresh icon (`ui-components:refresh`) in settings
2. **✅ Production Build**: Clean build with all artifacts properly included
3. **✅ Publishing Guide**: Created comprehensive PUBLISHING.md with step-by-step instructions
4. **✅ Published to PyPI**: Package is now live and available for installation!

### 📦 Installation Methods

Users can now install the extension in two ways:

```bash
# Method 1: Direct pip install
pip install jupyterlab-claude-code-refresh

# Method 2: Via JupyterLab Extension Manager
# Search for "claude code refresh" in the Extension Manager UI
```

### 🔗 Package Links

- **PyPI**: https://pypi.org/project/jupyterlab-claude-code-refresh/
- **GitHub**: https://github.com/wenatuhs/jupyterlab-claude-code-refresh
- **npm**: (Optional - not yet published, PyPI is sufficient for JupyterLab v4+)

## 🛠 KEY COMMANDS

```bash
# Activate environment
source /usr/local/anaconda3/bin/activate llm

# Development
jlpm install                    # Install dependencies
jlpm build                     # Development build
jlpm build:prod               # Production build
jlpm lint                     # Fix linting issues
jlpm clean:all               # Clean all artifacts

# Installation
pip install -e .              # Install extension
jupyter labextension list     # Verify installation

# Testing
python tests/test_notebook_modifications.py tests/test.ipynb
```

## 🏗 ARCHITECTURE SUMMARY

```
📁 jupyterlab-claude-code-refresh/
├── 📁 src/                          # TypeScript source
│   └── index.ts                     # Main extension class (~730 lines)
├── 📁 schema/                       # Settings schema
│   └── plugin.json                  # Settings configuration
├── 📁 style/                        # CSS styling
├── 📁 tests/                        # Test files
│   ├── README.md                    # Test documentation
│   ├── test.ipynb                   # Sample notebook
│   └── test_notebook_modifications.py # Test script
├── 📁 jupyterlab_claude_code_refresh/ # Python package
├── package.json                     # npm package config
├── pyproject.toml                   # Python package config
└── README.md                        # Project documentation
```

## 🧠 TECHNICAL DETAILS

### Core Classes & Methods

- **`ClaudeCodeAutoRefresh`**: Main extension class
- **Key methods**: `_checkFilesForChanges()`, `_handleExternalChange()`, `_scheduleRefresh()`
- **Detection strategy**: Contents.IManager.fileChanged + polling fallback
- **Settings**: Full ISettingRegistry integration with schema validation

### Key Features Implemented

- **Enabled/disabled toggle**: Respects settings throughout operation
- **Conflict resolution**: 3 modes (ask/keepLocal/useExternal) with dialogs
- **Notification deduplication**: Prevents spam during frequent changes
- **User save tracking**: 2-second window to ignore user-initiated saves
- **Welcome banner**: localStorage + settings registry persistence
- **Logging system**: 3-level hierarchy (none/info/debug) with structured messages

## 🚀 FUTURE ENHANCEMENTS (Optional)

1. **npm Publishing** - While not required for JupyterLab v4+, npm publishing could increase visibility
2. **GitHub Actions CI/CD** - Automate testing and releases
3. **Feature Additions** - Based on user feedback from PyPI installations
4. **Icon Customization** - Add GitHub repository social preview for better Extension Manager display

The extension is **published and available** for users worldwide!

## 💡 USAGE PATTERN

This extension solves the problem where Claude Code can modify notebooks perfectly via the terminal, but JupyterLab doesn't auto-refresh to show the changes. Users can now seamlessly use Claude Code in JupyterLab terminals with automatic notebook refreshing.

---

_Extension successfully published to PyPI on 2025-08-22 and available for worldwide installation!_
