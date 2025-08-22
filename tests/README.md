# Test Files

This directory contains test files for the Claude Code Auto-Refresh extension.

## Files

- `test_notebook_modifications.py` - Python script to simulate different external notebook modification patterns for testing the extension's detection capabilities
- `test.ipynb` - Sample Jupyter notebook for testing the auto-refresh functionality

## Usage

To test the extension's functionality:

1. Open the test notebook in JupyterLab
2. Run the Python test script to simulate external modifications:
   ```bash
   python tests/test_notebook_modifications.py tests/test.ipynb
   ```
3. Observe that the notebook automatically refreshes in JupyterLab

These test files help verify that the extension properly detects and responds to external changes made by Claude Code or other tools.
