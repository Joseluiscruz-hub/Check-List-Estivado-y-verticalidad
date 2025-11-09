# GitHub Pages Deployment Workflow Notes

## Required Repository Settings

For the GitHub Pages deployment workflow to function correctly, ensure the following settings are configured:

### Workflow Permissions

Navigate to **Settings → Actions → General → Workflow permissions** and ensure one of the following:

1. **Recommended**: Set to "Read and write permissions" to allow `GITHUB_TOKEN` to push to branches
2. **Alternative**: If using restricted permissions, configure a Personal Access Token (PAT):
   - Create a PAT with `repo` scope
   - Add it as a repository secret named `GH_PAGES_PAT`
   - Update the workflow to use: `https://x-access-token:${{ secrets.GH_PAGES_PAT }}@github.com/<owner>/<repo>.git`

### Branch Protection

If the `gh-pages` branch has protection rules enabled:

- Navigate to **Settings → Branches → Branch protection rules**
- For the `gh-pages` branch, ensure "Allow GitHub Actions" is enabled
- Alternatively, exclude GitHub Actions bot from required status checks

### Permissions in Workflow

The workflow now includes explicit permissions:
```yaml
permissions:
  contents: write  # Required to push commits
  pages: write     # Required for GitHub Pages deployment
```

## Troubleshooting

If you encounter a 403 error during deployment:

1. Verify workflow permissions are set to "Read and write"
2. Check that branch protection rules allow pushes from GitHub Actions
3. Ensure the repository has GitHub Pages enabled
4. Consider using a PAT if organizational policies restrict `GITHUB_TOKEN`

## References

- Failed run that prompted these changes: [Run #19178232170](https://github.com/Joseluiscruz-hub/Check-List-Estivado-y-verticalidad/actions/runs/19178232170/job/54828968985#step:6:263)
- Commit ref: c1efd9c010c669722440c588ddc2becad99eb759
