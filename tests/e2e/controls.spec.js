import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Advanced Query Loop', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		for ( let i = 1; i < 11; i++ ) {
			await requestUtils.createPost( {
				title: `Post ${ i }`,
				status: 'publish',
			} );
		}
	} );

	test.beforeEach( async ( { admin, editor } ) => {
		// Create a new post before each test
		await admin.createNewPost();

		// Insert a block
		await editor.insertBlock( {
			name: 'core/query',
			attributes: { namespace: 'advanced-query-loop' },
		} );

		await editor.canvas
			.getByRole( 'document', { name: 'Block: Advanced Query Loop' } )
			.getByRole( 'button', { name: 'Start blank' } )
			.click();

		await editor.canvas
			.getByRole( 'document', { name: 'Block: Advanced Query Loop' } )
			.getByRole( 'list', { name: 'Block variations' } )
			.getByRole( 'button', { name: 'Title & Date' } )
			.click();
	} );

	test( 'should have Advanced Query Settings panel', async ( {
		editor,
		page,
	} ) => {
		// Open the block settings sidebar
		await editor.openDocumentSettingsSidebar();

		// Test that the controls are visible
		expect(
			await page.locator( 'button:has-text("Advanced Query Settings")' )
		).toBeVisible();
	} );

	test( 'should only display Post Order By when inheriting the query', async ( {
		page,
	} ) => {
		await page
			.locator( 'role=region[name="Editor settings"i]' )
			.getByLabel( 'Inherit query from template' )
			.click();

		expect( await page.getByLabel( 'Post Order By' ) ).toBeVisible();
	} );
} );
