# CLAUDE.md - JupyterLab Claude Code Auto-Refresh Extension

This file provides guidance to Claude Code when working with this JupyterLab extension.

## 🎯 PROJECT STATUS: PRODUCTION-READY ✅

The Claude Code Auto-Refresh extension is **fully functional** and **ready for publication**. All core functionality has been implemented and tested.

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

## 📝 REMAINING TASKS (3 items)

### 🎨 1. Add Claude-like Icon (High Priority)
- **Goal**: Create a professional icon for the extension
- **Current**: Using default JupyterLab settings icon  
- **Need**: Design/find suitable icon representing Claude + auto-refresh concept
- **Implementation**: Update `schema/plugin.json` icon references

### 📦 2. Prepare Official Build for Publication (High Priority)  
- **Goal**: Create final production build ready for npm/PyPI
- **Current**: Development build working perfectly
- **Tasks**:
  - Final version bump if needed (currently 0.1.0)
  - Clean production build with `jlpm build:prod`
  - Verify all files included in package
  - Test installation from built package

### 📚 3. Create Publishing Guide (Medium Priority)
- **Goal**: Document publication process for npm and PyPI
- **Need**: Step-by-step instructions for:
  - Building release packages
  - Publishing to npm registry
  - Publishing to PyPI
  - Version management
  - Release workflow

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

## 🚀 NEXT SESSION PRIORITIES

1. **Icon Design/Selection** - Make the extension visually professional
2. **Final Production Build** - Ensure publication-ready package
3. **Publishing Documentation** - Enable easy distribution

The extension is **ready for users** and works excellently with Claude Code's notebook modification capabilities. The remaining tasks are polish and distribution-focused.

## 💡 USAGE PATTERN

This extension solves the problem where Claude Code can modify notebooks perfectly via the terminal, but JupyterLab doesn't auto-refresh to show the changes. Users can now seamlessly use Claude Code in JupyterLab terminals with automatic notebook refreshing.

---
*Extension is production-ready and fully functional as of this context window.*