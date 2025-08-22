# Publishing Guide - JupyterLab Claude Code Auto-Refresh Extension

This guide provides step-by-step instructions for publishing the extension to both npm and PyPI registries.

## Prerequisites

Before publishing, ensure you have:

1. **Accounts**: npm and PyPI accounts with appropriate permissions
2. **Authentication**: Configured authentication tokens for both registries
3. **Environment**: Conda environment activated (`source /usr/local/anaconda3/bin/activate llm`)
4. **Clean state**: All changes committed and working directory clean

## Pre-Publishing Checklist

- [ ] All tests passing (`jlpm test` if applicable)
- [ ] Linting clean (`jlpm lint`)
- [ ] Production build successful (`jlpm build:prod`)
- [ ] Extension installs and works correctly (`pip install -e .`)
- [ ] Version number updated in `package.json` (if needed)
- [ ] CHANGELOG.md updated with new version notes
- [ ] All changes committed to git

## Publishing to npm

### 1. Prepare npm Package

```bash
# Ensure clean state
jlpm clean:all
jlpm build:prod

# Verify package contents
npm pack --dry-run
```

### 2. Publish to npm

```bash
# Login to npm (if not already logged in)
npm login

# Publish the package
npm publish

# Verify publication
npm view jupyterlab-claude-code-refresh
```

### 3. Tag the Release

```bash
# Create git tag
git tag v0.1.0
git push origin v0.1.0
```

## Publishing to PyPI

### 1. Build Python Package

```bash
# Clean previous builds
rm -rf dist/ build/ *.egg-info/

# Build the package
python -m build
```

### 2. Verify Package

```bash
# Check package contents
python -m tarfile -l dist/*.tar.gz
python -m zipfile -l dist/*.whl

# Test installation from built package
pip install dist/*.whl
```

### 3. Upload to PyPI

```bash
# Install twine if not already installed
pip install twine

# Upload to PyPI (remove --repository-url for production)
twine upload dist/*

# For test PyPI first (recommended):
# twine upload --repository-url https://test.pypi.org/legacy/ dist/*
```

## Version Management

### Updating Version Numbers

1. **Update package.json**: Change version field
2. **Auto-sync**: pyproject.toml will automatically sync via hatch-nodejs-version
3. **Verify sync**: Check that both files show same version

```bash
# Check versions match
node -p "require('./package.json').version"
python -c "import jupyterlab_claude_code_refresh; print(jupyterlab_claude_code_refresh.__version__)"
```

### Version Numbering Strategy

- **Major (x.0.0)**: Breaking changes
- **Minor (0.x.0)**: New features, backward compatible
- **Patch (0.0.x)**: Bug fixes, backward compatible

## Complete Release Workflow

Here's the complete workflow for releasing a new version:

```bash
# 1. Activate environment
source /usr/local/anaconda3/bin/activate llm

# 2. Update version in package.json (e.g., to 0.2.0)
# (Manual edit required)

# 3. Update CHANGELOG.md with new version notes
# (Manual edit required)

# 4. Clean and build
jlpm clean:all
jlpm lint
jlpm build:prod

# 5. Test installation
pip install -e .
jupyter labextension list

# 6. Commit changes
git add .
git commit -m "Release v0.2.0"
git push

# 7. Publish to npm
npm login
npm publish

# 8. Build and publish to PyPI
rm -rf dist/ build/ *.egg-info/
python -m build
twine upload dist/*

# 9. Create git tag
git tag v0.2.0
git push origin v0.2.0

# 10. Verify publications
npm view jupyterlab-claude-code-refresh
pip index versions jupyterlab-claude-code-refresh
```

## Troubleshooting

### Common Issues

1. **Build failures**: Check TypeScript compilation errors
2. **Missing files**: Verify `files` field in package.json includes all needed files
3. **Version conflicts**: Ensure package.json and pyproject.toml versions match
4. **Authentication**: Check npm and PyPI tokens are valid

### Rollback Procedure

If you need to unpublish a problematic version:

```bash
# npm (within 24 hours only)
npm unpublish jupyterlab-claude-code-refresh@0.x.x

# PyPI (contact PyPI support - unpublishing is restricted)
# Generally not possible, publish a patch version instead
```

## Registry Links

- **npm**: https://www.npmjs.com/package/jupyterlab-claude-code-refresh
- **PyPI**: https://pypi.org/project/jupyterlab-claude-code-refresh/
- **GitHub**: https://github.com/wenatuhs/jupyterlab-claude-code-refresh

## Notes

- **Automated CI/CD**: Consider setting up GitHub Actions for automated publishing
- **Pre-release testing**: Use npm's `--tag beta` and PyPI's test instance for pre-release testing
- **Documentation**: Keep README.md updated with installation instructions
- **Support**: Monitor GitHub issues for user feedback and bug reports

---

*This guide ensures consistent, reliable releases of the JupyterLab Claude Code Auto-Refresh extension.*