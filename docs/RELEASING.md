# Release Workflow

This project uses [Release Please](https://github.com/googleapis/release-please) for automated
releases and npm Trusted Publishing (OIDC) for secure package publishing.

## How It Works

```
Push to main → Release Please creates PR → Merge PR → GitHub Release → npm Publish
     │                    │                     │              │              │
     └─ Conventional      └─ Changelog          └─ Tag         └─ Triggers    └─ OIDC auth
        Commits              generated             created        publish.yml     (no tokens!)
```

## Conventional Commits

Use conventional commit messages to trigger releases:

```
feat: add new feature        → minor bump (0.1.0 → 0.2.0)
fix: fix a bug               → patch bump (0.1.0 → 0.1.1)
feat!: breaking change       → major bump (0.1.0 → 1.0.0)
docs: update readme          → no release
chore: update deps           → no release
refactor: restructure code   → no release
```

### Scoping to Packages

Use scopes to target specific packages:

```
feat(pythonlib): add new itertools function
fix(python2ts): fix parser edge case
feat(pythonlib)!: breaking API change
```

## Release Process

1. **Push commits to main** with conventional commit messages
2. **Release Please creates a PR** with:
   - Version bump in package.json
   - Updated CHANGELOG.md
   - Release notes
3. **Review and merge** the Release Please PR
4. **GitHub Release is created** automatically
5. **Publish workflow triggers** and publishes to npm

## Manual Publishing

For manual publishing (e.g., first publish or testing):

```bash
# Build packages
pnpm build

# Publish pythonlib first (no dependencies)
cd packages/pythonlib
npm publish --access public

# Then publish python2ts (depends on pythonlib)
cd ../python2ts
npm publish --access public
```

## Workflow Dispatch

You can manually trigger the publish workflow from GitHub Actions:

1. Go to Actions → Publish
2. Click "Run workflow"
3. Select package: `pythonlib`, `python2ts`, or `both`
4. Enable dry-run to test without publishing

## Setup Requirements

### GitHub Secrets

- `RELEASE_PLEASE_TOKEN`: GitHub PAT with `repo` scope

### npm Trusted Publishing

Configure for each package on npmjs.com:

1. Go to package → Settings → Publishing access
2. Add trusted publisher:
   - Repository owner: `sebastian-software`
   - Repository name: `python2ts`
   - Workflow filename: `publish.yml`

## Troubleshooting

### Release Please not creating PRs

1. Check commit messages follow conventional format
2. Verify PAT has `repo` scope
3. Look for stuck PRs with `autorelease: pending` label

### npm publish 404 error

1. Ensure Node.js 24+ (npm v11+ for OIDC)
2. Verify `repository` field in package.json
3. Check trusted publisher config matches workflow filename exactly

### Publishing order

pythonlib must be published before python2ts because python2ts depends on it. The publish workflow
handles this automatically.
