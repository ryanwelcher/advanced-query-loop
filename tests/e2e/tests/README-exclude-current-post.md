# Exclude Current Post E2E Tests

This test suite covers the "Exclude Current Post" control functionality in the Advanced Query Loop block.

## Test Coverage

### ✅ Tests for Regular Posts

1. **Initial state** - Verifies the control is visible and unchecked by default
2. **Toggle on** - Verifies toggling the control on stores `true` in block attributes
3. **Toggle off** - Verifies toggling the control off stores `false` in block attributes
4. **Not disabled** - Verifies the control is enabled in regular posts

## Running the Tests

```bash
# Run all exclude current post tests
npm run test:e2e -- tests/exclude-current-post.spec.ts

# Run with UI
npm run test:e2e:ui -- tests/exclude-current-post.spec.ts
```

## Future Test Additions

The following test scenarios were planned but require additional setup/configuration:

### Templates
- Should be disabled in archive template
- Should be disabled in search template
- Should be disabled in home/front-page templates (when show_on_front is 'posts')
- Should be enabled in single template
- Should work in single template and store boolean value

### Synced Patterns
- Should be visible and functional in a synced pattern
- Synced pattern with exclude current should work when inserted in a post

These tests require:
- Proper theme configuration in the test environment
- Site Editor navigation that works reliably with Playground
- Pattern creation workflow that's compatible with the test environment

## Test Structure

All tests follow the same pattern:
1. Initialize Playground with blueprint
2. Visit post editor
3. Insert AQL block with custom query
4. Interact with "Exclude Current Post" control
5. Assert expected behavior
6. Clean up Playground instance

## Notes

- Tests use WordPress Playground via `@wp-playground/cli` for isolated testing
- Each test gets a fresh WordPress instance
- The `insertAQL` utility handles block insertion and variation selection
- Tests verify both UI state and block attributes
