# E2E Tests for Advanced Query Loop

This directory contains end-to-end tests for the Advanced Query Loop plugin using Playwright.

## Setup

The tests use WordPress Playground to create isolated test environments. No local WordPress installation is required.

## Running Tests

### Run all e2e tests
```bash
npm run test:e2e
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run a specific test file
```bash
npx playwright test tests/e2e/tests/post-selection.spec.ts --config=tests/e2e/playwright.config.ts
```

### Run tests in debug mode
```bash
npx playwright test --debug --config=tests/e2e/playwright.config.ts
```

## Test Structure

### Blueprints (`_blueprints/`)
Blueprint JSON files define the WordPress environment setup for tests:
- `e2e-blueprint.json` - Base blueprint that activates the plugin
- `post-selection-e2e-blueprint.json` - Creates 150 test posts for post selection tests

### Test Files (`tests/e2e/tests/`)
- `basic.spec.ts` - Basic plugin functionality tests
- `additional-post-types.spec.ts` - Multiple post type tests
- `pagination-toggle.spec.ts` - Pagination control tests
- `post-selection.spec.ts` - Post include/exclude controls with large content sets

### Fixtures (`aql-fixtures.ts`)
Custom Playwright fixtures that provide:
- `playground` - WordPress Playground instance
- `editor` - WordPress block editor utilities
- `admin` - WordPress admin utilities
- `selectors` - Custom selectors for AQL

### Utilities (`utils.ts`)
Helper functions for common test operations:
- `insertAQL()` - Inserts an Advanced Query Loop block

## Writing New Tests

1. Create a new `.spec.ts` file in `tests/e2e/tests/`
2. Import test fixtures: `import { test, expect } from '../aql-fixtures';`
3. Import utilities: `import { insertAQL } from '../utils';`
4. Follow the existing test patterns

Example:
```typescript
import { test, expect } from '../aql-fixtures';
import { insertAQL } from '../utils';

test.describe( 'My Feature Tests', () => {
    test.beforeEach( async ( { page, editor, playground, admin } ) => {
        await playground.init( { page, editor } );
        await admin.visitAdminPage( 'post-new.php' );
        await editor.setPreferences( 'core/edit-post', {
            welcomeGuide: false,
            fullscreenMode: false,
        } );
        await insertAQL( { editor, page } );
    } );

    test.afterEach( async ( { playground } ) => {
        await playground.cleanUp();
    } );

    test( 'should do something', async ( { page, editor } ) => {
        // Your test code here
    } );
} );
```

## Creating Custom Blueprints

If your tests need specific content or configuration:

1. Create a new blueprint JSON file in `_blueprints/`
2. Use the `runPHP` step to execute PHP code for content creation
3. Reference it in your test: `new Playground( '_blueprints/your-blueprint.json' )`

Example blueprint with posts:
```json
{
    "$schema": "https://playground.wordpress.net/blueprint-schema.json",
    "steps": [
        {
            "step": "activatePlugin",
            "pluginPath": "/wordpress/wp-content/plugins/advanced-query-loop/index.php"
        },
        {
            "step": "runPHP",
            "code": "<?php\\nfor ( $i = 1; $i <= 100; $i++ ) {\\n\\twp_insert_post( array(\\n\\t\\t'post_title' => 'Test Post ' . $i,\\n\\t\\t'post_status' => 'publish'\\n\\t) );\\n}\\n?>"
        }
    ]
}
```

## Troubleshooting

### Tests are slow
- Reduce the number of posts created in blueprints
- Run tests in parallel with `--workers` flag (be careful with Playground instances)

### Tests fail intermittently
- Increase timeout values: `await page.waitForTimeout( 1000 );`
- Use `{ timeout: 10000 }` option on assertions
- Check if elements need to be scrolled into view

### Playground cleanup issues
- Ensure `playground.cleanUp()` is called in `afterEach`
- Check that no other processes are using port 8889
- Restart your terminal if ports remain occupied

## CI/CD

Tests run automatically on pull requests. Check the Actions tab on GitHub for results.
