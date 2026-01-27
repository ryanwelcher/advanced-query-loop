/**
 * Import our custom test fixtures.
 */
import { test, expect } from '../aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from '../utils';
import { Playground } from '../Playground';

/**
 * Tests for post selection controls (include and exclude posts).
 * These tests verify that the search functionality works correctly
 * on sites with large numbers of posts.
 */
test.describe( 'Post Selection Controls with Large Content', () => {
	// Use a custom playground instance with many posts
	let customPlayground: Playground;

	test.beforeEach( async ( { page, editor, admin } ) => {
		// Initialize with the blueprint that creates 150 posts
		customPlayground = new Playground(
			'_blueprints/post-selection-e2e-blueprint.json'
		);
		await customPlayground.init( { page, editor } );

		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		await insertAQL( { editor, page } );
	} );

	test.afterEach( async () => {
		await customPlayground.cleanUp();
	} );

	test( 'Exclude Posts control is visible', async ( { page } ) => {
		await expect(
			page.getByLabel( 'Posts to Exclude' )
		).toBeVisible();
	} );

	test( 'Include Posts control is visible', async ( { page } ) => {
		// Scroll to Include Posts section
		await page.getByRole( 'heading', { name: 'Include Posts' } ).scrollIntoViewIfNeeded();

		await expect(
			page.getByLabel( 'Posts', { exact: true } )
		).toBeVisible();
	} );

	test( 'Exclude Posts search functionality finds posts by title', async ( {
		page,
	} ) => {
		const excludeInput = page.getByLabel( 'Posts to Exclude' );

		// Click on the field to expand suggestions
		await excludeInput.click();

		// Type to search for "Apple" posts
		await excludeInput.fill( 'Apple' );

		// Wait a moment for the search to trigger
		await page.waitForTimeout( 500 );

		// Should show suggestions with "Apple" in the title
		await expect(
			page.getByText( 'Apple Post 001' )
		).toBeVisible( { timeout: 5000 } );
	} );

	test( 'Include Posts search functionality finds posts by title', async ( {
		page,
	} ) => {
		// Scroll to Include Posts section
		await page.getByRole( 'heading', { name: 'Include Posts' } ).scrollIntoViewIfNeeded();

		const includeInput = page.getByLabel( 'Posts', { exact: true } );

		// Click on the field to expand suggestions
		await includeInput.click();

		// Type to search for "Banana" posts
		await includeInput.fill( 'Banana' );

		// Wait a moment for the search to trigger
		await page.waitForTimeout( 500 );

		// Should show suggestions with "Banana" in the title
		await expect(
			page.getByText( 'Banana Article 051' )
		).toBeVisible( { timeout: 5000 } );
	} );

	test( 'Can exclude a specific post from search results', async ( {
		page,
		editor,
	} ) => {
		const excludeInput = page.getByLabel( 'Posts to Exclude' );

		// Click on the field
		await excludeInput.click();

		// Type to search
		await excludeInput.fill( 'Cherry Story 101' );

		// Wait for search results
		await page.waitForTimeout( 500 );

		// Click on the suggestion
		await page.getByText( 'Cherry Story 101', { exact: true } ).click();

		// Verify the post was added as a token
		await expect(
			page.locator( '.components-form-token-field__token-text' ).filter( { hasText: 'Cherry Story 101' } )
		).toBeVisible();

		// Verify it's saved in block attributes
		const blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.exclude_posts ).toBeDefined();
		expect( blocks[ 0 ].attributes.query.exclude_posts.length ).toBeGreaterThan( 0 );
	} );

	test( 'Can include a specific post from search results', async ( {
		page,
		editor,
	} ) => {
		// Scroll to Include Posts section
		await page.getByRole( 'heading', { name: 'Include Posts' } ).scrollIntoViewIfNeeded();

		const includeInput = page.getByLabel( 'Posts', { exact: true } );

		// Click on the field
		await includeInput.click();

		// Type to search
		await includeInput.fill( 'Apple Post 025' );

		// Wait for search results
		await page.waitForTimeout( 500 );

		// Click on the suggestion
		await page.getByText( 'Apple Post 025', { exact: true } ).click();

		// Verify the post was added as a token
		await expect(
			page.locator( '.components-form-token-field__token-text' ).filter( { hasText: 'Apple Post 025' } )
		).toBeVisible();

		// Verify it's saved in block attributes
		const blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.include_posts ).toBeDefined();
		expect( blocks[ 0 ].attributes.query.include_posts.length ).toBeGreaterThan( 0 );
	} );

	test( 'Search finds posts beyond the first 10 results', async ( {
		page,
	} ) => {
		const excludeInput = page.getByLabel( 'Posts to Exclude' );

		// Click on the field
		await excludeInput.click();

		// Search for a post that would be beyond result 10 if per_page was still set to 10
		await excludeInput.fill( 'Apple Post 045' );

		// Wait for search results
		await page.waitForTimeout( 500 );

		// This post should be findable now with increased per_page and search
		await expect(
			page.getByText( 'Apple Post 045' )
		).toBeVisible( { timeout: 5000 } );
	} );

	test( 'Can search and select multiple posts in exclude control', async ( {
		page,
		editor,
	} ) => {
		const excludeInput = page.getByLabel( 'Posts to Exclude' );

		// Add first post
		await excludeInput.click();
		await excludeInput.fill( 'Apple Post 010' );
		await page.waitForTimeout( 500 );
		await page.getByText( 'Apple Post 010', { exact: true } ).click();

		// Add second post
		await excludeInput.click();
		await excludeInput.fill( 'Banana Article 075' );
		await page.waitForTimeout( 500 );
		await page.getByText( 'Banana Article 075', { exact: true } ).click();

		// Verify both tokens are visible
		await expect(
			page.locator( '.components-form-token-field__token-text' ).filter( { hasText: 'Apple Post 010' } )
		).toBeVisible();
		await expect(
			page.locator( '.components-form-token-field__token-text' ).filter( { hasText: 'Banana Article 075' } )
		).toBeVisible();

		// Verify both are saved in block attributes
		const blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.exclude_posts.length ).toBe( 2 );
	} );

	test( 'Search clears after selecting a post in exclude control', async ( {
		page,
	} ) => {
		const excludeInput = page.getByLabel( 'Posts to Exclude' );

		// Click on the field
		await excludeInput.click();

		// Type to search
		await excludeInput.fill( 'Cherry Story 120' );
		await page.waitForTimeout( 500 );

		// Click on the suggestion
		await page.getByText( 'Cherry Story 120', { exact: true } ).click();

		// The search input should be cleared after selection
		await expect( excludeInput ).toHaveValue( '' );
	} );

	test( 'Search clears after selecting a post in include control', async ( {
		page,
	} ) => {
		// Scroll to Include Posts section
		await page.getByRole( 'heading', { name: 'Include Posts' } ).scrollIntoViewIfNeeded();

		const includeInput = page.getByLabel( 'Posts', { exact: true } );

		// Click on the field
		await includeInput.click();

		// Type to search
		await includeInput.fill( 'Banana Article 090' );
		await page.waitForTimeout( 500 );

		// Click on the suggestion
		await page.getByText( 'Banana Article 090', { exact: true } ).click();

		// The search input should be cleared after selection
		await expect( includeInput ).toHaveValue( '' );
	} );
} );
