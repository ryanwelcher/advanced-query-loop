# E2E Tests for Advanced Query Loop

End-to-end tests for the Advanced Query Loop plugin using Playwright and WordPress Playground.

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure wp-env is running (for local WordPress instance):
   ```bash
   npm run wp-env start
   ```

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests with UI

For interactive debugging:

```bash
npm run test:e2e:ui
```

### Run Specific Test File

```bash
npx playwright test tests/e2e/tests/post-order-by-id.spec.ts
```

### Run in Headed Mode

To see the browser:

```bash
npx playwright test --headed --config=tests/e2e/playwright.config.ts
```

## Test Structure

### Fixtures (`aql-fixtures.ts`)

Custom Playwright fixtures that provide:
- `playground` - WordPress Playground instance
- `editor` - WordPress editor utilities
- `admin` - WordPress admin utilities
- `pageUtils` - Page interaction utilities
- `selectors` - Custom selectors for AQL components

### Utilities (`utils.ts`)

Helper functions for common operations:
- `insertAQL()` - Inserts an AQL block and selects the Title & Date variation

### Test Files

#### `basic.spec.ts`
Basic functionality tests to ensure AQL block can be inserted and variation selected.

#### `pagination-toggle.spec.ts`
Tests for the pagination disable/enable functionality.

#### `additional-post-types.spec.ts`
Tests for selecting multiple post types in queries.

#### `post-order-by-id.spec.ts` ⭐ NEW
Comprehensive tests for the Post ID ordering functionality:

1. **Control Visibility** - Verifies the Post Order By control is visible and has the Post ID option
2. **Attribute Updates** - Confirms selecting Post ID updates block attributes to 'ID' (uppercase)
3. **Frontend Ordering** - Validates posts are ordered by ID on the frontend (not by date)
4. **Descending Order** - Tests descending Post ID ordering works correctly
5. **Editor Preview** - Checks the editor preview shows correct ID ordering
6. **Order Switching** - Verifies switching from Date to Post ID changes the order

## Test Data

### Blueprint Setup (`_blueprints/e2e-blueprint.json`)

The e2e blueprint automatically creates 10 test posts with:
- IDs embedded in titles (e.g., "Test Post - ID: 101")
- Varied publish dates throughout 2024
- Ensures date order ≠ ID order for proper testing

This data allows tests to verify that Post ID ordering works correctly and differs from date ordering.

## Key Testing Scenarios

### The Post ID Ordering Bug

**Issue:** When "Post Order By" is set to "Post ID", it works in the editor but fails on the frontend, falling back to date ordering.

**Root Cause:**
- REST API (editor) normalizes lowercase `'id'` → uppercase `'ID'`
- WP_Query (frontend) is case-sensitive and requires `'ID'`

**Fix:** The `OrderBy` trait normalizes the value on the backend.

**Tests Verify:**
1. ✅ Editor preview uses correct ordering (REST API)
2. ✅ Frontend rendering uses correct ordering (WP_Query)
3. ✅ Ordering by ID differs from ordering by date
4. ✅ Both ascending and descending work correctly

## Debugging Tests

### View Test Trace

After a test failure:

```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

### Debug Specific Test

```bash
npx playwright test --debug tests/e2e/tests/post-order-by-id.spec.ts
```

### Screenshots on Failure

Screenshots are automatically captured on test failure in `test-results/`.

## Writing New Tests

### Basic Test Template

```typescript
import { test, expect } from '../aql-fixtures';
import { insertAQL } from '../utils';

test.describe( 'My Test Suite', () => {
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

	test( 'My test case', async ( { page, editor } ) => {
		// Test code here
	} );
} );
```

### Accessing Block Attributes

```typescript
const blocks = await editor.getBlocks();
const query = blocks[ 0 ].attributes.query;
expect( query.orderBy ).toEqual( 'ID' );
```

### Interacting with Controls

```typescript
// Select from dropdown
await page.getByLabel( 'Post Order By' ).selectOption( 'ID' );

// Click checkbox
await page.getByRole( 'checkbox', { name: 'Ascending Order' } ).check();

// Get text content
const titles = await page.locator( '.wp-block-post-title' ).allTextContents();
```

## CI/CD Integration

Tests are configured for CI with:
- Automatic retries (2 attempts)
- Single worker (sequential execution)
- Trace on first retry
- Line reporter for clean output

## Troubleshooting

### Tests Timing Out

Increase timeout in individual tests:
```typescript
test( 'My test', async ( { page } ) => {
	// Test code
}, 60000 ); // 60 second timeout
```

### Playground Not Starting

Ensure wp-env is running:
```bash
npm run wp-env stop
npm run wp-env start
```

### Port Conflicts

The base URL is configured for `http://127.0.0.1:8889/`. If this port is in use, update `playwright.config.ts`.

## Further Reading

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [WordPress Playground](https://wordpress.github.io/wordpress-playground/)
- [@wordpress/e2e-test-utils-playwright](https://www.npmjs.com/package/@wordpress/e2e-test-utils-playwright)
