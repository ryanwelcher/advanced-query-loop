# Exclude Current Post E2E Tests

This test suite covers the "Exclude current" behaviour of an Advanced Query Loop block.

As of WordPress 7.1, core's Query Loop block owns the **Exclude current** toggle (`query.excludeCurrent`). AQL no longer renders its own toggle on sites with core support and instead migrates the legacy `exclude_current` query key to `excludeCurrent` the next time a block is edited. The legacy AQL toggle only renders (in the "AQL: Extensions" panel) on sites where `core/query` does not register `excludeCurrent`.

## Test Coverage

### ✅ Core toggle on an AQL block

1. **Initial state** - The core toggle is visible and unchecked, `excludeCurrent` is `null` and no legacy key is present
2. **Toggle on** - Stores `excludeCurrent: true`
3. **Toggle off** - Stores `excludeCurrent: false`
4. **No legacy UI** - The AQL "Exclude Current Post" toggle and the "AQL: Extensions" panel are absent

### ✅ Legacy migration

1. **`exclude_current: true`** becomes `excludeCurrent: true` and the legacy key is removed; core's toggle shows checked
2. **`exclude_current: <post ID>`** (what older versions stored) becomes `excludeCurrent: true`
3. **`exclude_current: false`** is dropped without enabling `excludeCurrent`

### ✅ Frontend rendering

1. **Excluded** - The current post is absent from the block's results while other posts remain
2. **Not excluded** - The current post is present when the toggle is left off
3. **Toggled on then off** - The current post is present

## Running the Tests

```bash
# Run all exclude current post tests
npm run test:e2e -- tests/exclude-current-post.spec.ts

# Run with UI
npm run test:e2e:ui -- tests/exclude-current-post.spec.ts
```

## Future Test Additions

### Templates
Core hides its toggle and clears `excludeCurrent` on non-singular templates (archive, search, home when the front page shows posts), so AQL no longer needs its own disabled state. A Site Editor test confirming the toggle is absent on an archive template would be useful once Site Editor navigation is reliable in Playground.

### Legacy sites
The legacy AQL toggle is gated on `core/query` not registering `excludeCurrent`. Covering it needs a Playground blueprint pinned to WordPress 7.0 or earlier without the Gutenberg plugin.

## Notes

- Tests use WordPress Playground via `@wp-playground/cli` for isolated testing
- Each test gets a fresh WordPress instance
- The `insertAQL` utility handles block insertion and variation selection
- Migration tests insert the block with a full `query` attribute because the object attribute replaces core's default wholesale
