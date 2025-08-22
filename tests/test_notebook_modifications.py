#!/usr/bin/env python3
"""
Test script to simulate different ways of modifying Jupyter notebooks externally.
This helps debug why the auto-refresh extension isn't detecting Claude Code's changes.
"""

import json
import time
import sys
import os
from pathlib import Path

def test_simple_file_write(notebook_path):
    """Test 1: Simple file write (like a text editor)"""
    print(f"Test 1: Simple file write to {notebook_path}")
    
    simple_notebook = {
        "cells": [
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# This cell was added by simple file write\n",
                    "print('Hello from simple file write!')"
                ]
            }
        ],
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python",
                "version": "3.8.0"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }
    
    with open(notebook_path, 'w') as f:
        json.dump(simple_notebook, f, indent=2)
    
    print(f"✓ Modified {notebook_path} with simple write")
    time.sleep(1)

def test_nbformat_modification(notebook_path):
    """Test 2: Using nbformat library (like Claude Code likely does)"""
    try:
        import nbformat
        print(f"Test 2: NBFormat modification to {notebook_path}")
        
        # Create a new notebook
        nb = nbformat.v4.new_notebook()
        
        # Add a code cell
        code_cell = nbformat.v4.new_code_cell(
            source="# This cell was added by nbformat\nprint('Hello from nbformat!')"
        )
        nb.cells.append(code_cell)
        
        # Add a markdown cell
        markdown_cell = nbformat.v4.new_markdown_cell(
            source="## NBFormat Test\nThis was added using the nbformat library."
        )
        nb.cells.append(markdown_cell)
        
        # Write the notebook
        with open(notebook_path, 'w') as f:
            nbformat.write(nb, f)
            
        print(f"✓ Modified {notebook_path} with nbformat")
        
    except ImportError:
        print("⚠ nbformat not available, installing...")
        os.system("pip install nbformat")
        test_nbformat_modification(notebook_path)
    
    time.sleep(1)

def test_atomic_write(notebook_path):
    """Test 3: Atomic write (write to temp file, then move)"""
    print(f"Test 3: Atomic write to {notebook_path}")
    
    temp_path = str(notebook_path) + ".tmp"
    
    notebook_content = {
        "cells": [
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# This cell was added by atomic write\n",
                    "print('Hello from atomic write!')"
                ]
            }
        ],
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python",
                "version": "3.8.0"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }
    
    # Write to temp file first
    with open(temp_path, 'w') as f:
        json.dump(notebook_content, f, indent=2)
    
    # Then move to final location
    os.rename(temp_path, notebook_path)
    
    print(f"✓ Modified {notebook_path} with atomic write")
    time.sleep(1)

def test_incremental_modification(notebook_path):
    """Test 4: Incremental modification (read, modify, write)"""
    print(f"Test 4: Incremental modification to {notebook_path}")
    
    # Read existing notebook if it exists
    if os.path.exists(notebook_path):
        with open(notebook_path, 'r') as f:
            notebook = json.load(f)
    else:
        notebook = {
            "cells": [],
            "metadata": {
                "kernelspec": {
                    "display_name": "Python 3",
                    "language": "python",
                    "name": "python3"
                },
                "language_info": {
                    "name": "python",
                    "version": "3.8.0"
                }
            },
            "nbformat": 4,
            "nbformat_minor": 4
        }
    
    # Add a new cell
    new_cell = {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "# This cell was added by incremental modification\n",
            f"print('Hello from incremental modification at {time.time()}!')"
        ]
    }
    notebook["cells"].append(new_cell)
    
    # Write back
    with open(notebook_path, 'w') as f:
        json.dump(notebook, f, indent=2)
    
    print(f"✓ Modified {notebook_path} with incremental modification")
    time.sleep(1)

def main():
    if len(sys.argv) != 2:
        print("Usage: python test_notebook_modifications.py <notebook_path>")
        print("Example: python test_notebook_modifications.py test.ipynb")
        sys.exit(1)
    
    notebook_path = Path(sys.argv[1])
    
    print(f"Testing different notebook modification methods on: {notebook_path}")
    print("=" * 60)
    
    # Ensure parent directory exists
    notebook_path.parent.mkdir(parents=True, exist_ok=True)
    
    print("Starting tests in 3 seconds... (open JupyterLab console to watch for extension messages)")
    time.sleep(3)
    
    try:
        test_simple_file_write(notebook_path)
        test_nbformat_modification(notebook_path)
        test_atomic_write(notebook_path)
        test_incremental_modification(notebook_path)
        
        print("\n" + "=" * 60)
        print("All tests completed!")
        print("Check JupyterLab console for extension messages like:")
        print("- 'Claude Code Auto-Refresh: File change detected'")
        print("- 'Claude Code Auto-Refresh: Notebook file changed'")
        print("- 'Claude Code Auto-Refresh: Found open notebook, scheduling refresh'")
        
    except Exception as e:
        print(f"Error during testing: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()