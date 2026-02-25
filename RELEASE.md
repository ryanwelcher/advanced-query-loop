# Release Process

## 1. Bump the version number

Update the version string in **three places**:

- `index.php` — `Version: X.X.X`
- `package.json` — `"version": "X.X.X"`
- `readme.txt` — `Stable tag: X.X.X`

## 2. Update the changelog

Add a new entry at the top of the `== Changelog ==` section in `readme.txt`:

```
= X.X.X =
* Description of change.
```

## 3. Run linting

```bash
npm run format
npm run lint:php
```

Fix any issues before proceeding.

## 4. Commit and push to `trunk`

```bash
git add .
git commit -m "Release X.X.X"
git push origin trunk
```

Pushing to `trunk` triggers the Release Drafter GitHub Action, which auto-drafts release notes from merged PR labels (`enhancement`, `bug`, `fix`).

## 5. Build the release artifact

```bash
npm run release
```

This runs three steps in sequence:

1. `composer run build` — strips dev PHP dependencies and optimizes the autoloader
2. `npm run build` — compiles production JS/TS
3. `npm run plugin-zip` — creates the distributable ZIP

The ZIP includes only the files listed in the `files` field of `package.json`: `build/`, `index.php`, `readme.txt`, `includes/`, `vendor/autoload.php`, and `vendor/composer`.

## 6. Publish the GitHub Release

1. Go to GitHub → Releases and find the draft created by Release Drafter
2. Set the tag to `X.X.X` (matching `readme.txt`'s `Stable tag`)
3. Attach the generated ZIP as a release asset
4. Publish

## 7. Deploy to WordPress.org

Upload the ZIP (or use SVN) to the WordPress.org plugin repository, updating the `trunk` and `tags/X.X.X` directories.
