/**
 * Import our custom test fixtures.
 */
import { test, expect } from '../aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from '../utils';

/**
 * Opens the AQL Post Parameters panel options menu and selects
 * the "Exclude current post" item so the toggle becomes visible in the panel.
 *
 * @param {import('@playwright/test').Page} page Playwright page object.
 */
const addExcludeCurrentPostControl = async ( page ) => {
	await page
		.getByRole( 'button', { name: 'AQL: Post Parameters options' } )
		.click();
	await page
		.getByRole( 'menuitemcheckbox', { name: 'Exclude current post' } )
		.click();
	await page.keyboard.press( 'Escape' );
};

test.describe( 'Exclude Current Post', () => {
	test.beforeEach( async ( { page, editor, playground, admin } ) => {
		await playground.init( { page, editor } );
		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );
		await insertAQL( { editor, page } );
		await addExcludeCurrentPostControl( page );
	} );

	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	test( 'Initial state - should be visible and unchecked', async ( {
		page,
		editor,
	} ) => {
		await expect(
			page.getByRole( 'checkbox', {
				name: 'Exclude Current Post',
			} )
		).toBeVisible();

		await expect(
			page.getByRole( 'checkbox', {
				name: 'Exclude Current Post',
			} )
		).not.toBeChecked();

		const blocks = await editor.getBlocks();

		expect( blocks[ 0 ].attributes.query.exclude_current ).toBeUndefined();
	} );

	test( 'Should toggle on and store true', async ( { page, editor } ) => {
		await page
			.getByRole( 'checkbox', { name: 'Exclude Current Post' } )
			.click();

		await expect(
			page.getByRole( 'checkbox', {
				name: 'Exclude Current Post',
			} )
		).toBeChecked();

		const blocks = await editor.getBlocks();

		expect( blocks[ 0 ].attributes.query.exclude_current ).toEqual( true );
	} );

	test( 'Should toggle off and store false', async ( { page, editor } ) => {
		// Toggle on first
		await page
			.getByRole( 'checkbox', { name: 'Exclude Current Post' } )
			.click();

		// Then toggle off
		await page
			.getByRole( 'checkbox', { name: 'Exclude Current Post' } )
			.click();

		await expect(
			page.getByRole( 'checkbox', {
				name: 'Exclude Current Post',
			} )
		).not.toBeChecked();

		const blocks = await editor.getBlocks();

		expect( blocks[ 0 ].attributes.query.exclude_current ).toEqual( false );
	} );

	test( 'Should not be disabled in a regular post', async ( { page } ) => {
		await expect(
			page.getByRole( 'checkbox', {
				name: 'Exclude Current Post',
			} )
		).toBeEnabled();
	} );
} );

test.describe( 'Exclude Current Post - Frontend Rendering', () => {
	test.beforeEach( async ( { page, editor, playground, admin } ) => {
		await playground.init( { page, editor } );
	} );

	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	test( 'Should exclude current post from query results on frontend', async ( {
		page,
		editor,
		admin,
	} ) => {
		test.setTimeout( 60000 );

		// Create one test post - enough to verify exclusion without slowing CI.
		await admin.createNewPost( { title: 'Test Post Alpha' } );
		await editor.publishPost();

		// Create the main post with AQL block
		await admin.createNewPost( { title: 'Main Post with AQL' } );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		// Insert AQL block
		await insertAQL( { editor, page } );
		await addExcludeCurrentPostControl( page );

		// Enable "Exclude Current Post"
		await page
			.getByRole( 'checkbox', { name: 'Exclude Current Post' } )
			.click();

		// Verify it's enabled
		await expect(
			page.getByRole( 'checkbox', { name: 'Exclude Current Post' } )
		).toBeChecked();

		// Publish the post
		await editor.publishPost();

		// Get the post URL from the publish panel
		const postUrl = await page
			.locator( '.post-publish-panel__postpublish-buttons a' )
			.first()
			.getAttribute( 'href' );

		expect( postUrl ).toBeTruthy();

		// Navigate to the frontend
		await page.goto( postUrl! );

		// Wait for the page to load
		await page.waitForLoadState( 'networkidle' );

		// The AQL block is the first query loop inserted into the post content.
		// The theme may also render its own query loops (e.g. a "More posts"
		// section), so we scope to the first .wp-block-query to isolate our block.
		const aqlQueryLoop = page.locator( '.wp-block-query' ).first();
		await expect( aqlQueryLoop ).toBeVisible();

		const postTitlesInAQL = aqlQueryLoop.locator( '.wp-block-post-title' );
		const aqlTitles = await postTitlesInAQL.allTextContents();

		// The AQL block should NOT include the current post in its results.
		expect( aqlTitles ).not.toContain( 'Main Post with AQL' );

		// Other posts should still appear.
		expect( aqlTitles ).toContain( 'Test Post Alpha' );
	} );

	test( 'Should include current post when exclude_current is false', async ( {
		page,
		editor,
		admin,
	} ) => {
		test.setTimeout( 60000 );

		// Create one test post - enough to verify inclusion without slowing CI.
		await admin.createNewPost( { title: 'Test Post One' } );
		await editor.publishPost();

		// Create main post with AQL block
		await admin.createNewPost( { title: 'Main Post Without Exclusion' } );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		// Insert AQL block
		await insertAQL( { editor, page } );
		await addExcludeCurrentPostControl( page );

		// Do NOT enable "Exclude Current Post" - leave it unchecked

		// Verify it's NOT checked
		await expect(
			page.getByRole( 'checkbox', { name: 'Exclude Current Post' } )
		).not.toBeChecked();

		// Publish the post
		await editor.publishPost();

		// Get the post URL
		const postUrl = await page
			.locator( '.post-publish-panel__postpublish-buttons a' )
			.first()
			.getAttribute( 'href' );

		expect( postUrl ).toBeTruthy();

		// Navigate to frontend
		await page.goto( postUrl! );
		await page.waitForLoadState( 'networkidle' );

		// Get all post titles in the query loop
		const postLinksInLoop = page.locator(
			'.wp-block-query .wp-block-post-title a'
		);

		await expect( postLinksInLoop.first() ).toBeVisible();

		const displayedTitles = await postLinksInLoop.allTextContents();

		// Verify "Main Post Without Exclusion" IS in the displayed titles
		expect( displayedTitles ).toContain( 'Main Post Without Exclusion' );

		// Verify test post is also displayed
		expect( displayedTitles ).toContain( 'Test Post One' );
	} );

	test( 'Should work correctly when toggled on then off', async ( {
		page,
		editor,
		admin,
	} ) => {
		test.setTimeout( 60000 );

		// Create test posts
		await admin.createNewPost( { title: 'Another Test Post' } );
		await editor.publishPost();

		// Create main post
		await admin.createNewPost( { title: 'Toggle Test Post' } );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		// Insert AQL block
		await insertAQL( { editor, page } );
		await addExcludeCurrentPostControl( page );

		// Toggle ON
		await page
			.getByRole( 'checkbox', { name: 'Exclude Current Post' } )
			.click();

		// Toggle OFF
		await page
			.getByRole( 'checkbox', { name: 'Exclude Current Post' } )
			.click();

		// Verify it's unchecked
		await expect(
			page.getByRole( 'checkbox', { name: 'Exclude Current Post' } )
		).not.toBeChecked();

		// Publish
		await editor.publishPost();

		// Get URL and navigate to frontend
		const postUrl = await page
			.locator( '.post-publish-panel__postpublish-buttons a' )
			.first()
			.getAttribute( 'href' );

		await page.goto( postUrl! );
		await page.waitForLoadState( 'networkidle' );

		// Get displayed titles
		const postLinksInLoop = page.locator(
			'.wp-block-query .wp-block-post-title a'
		);

		await expect( postLinksInLoop.first() ).toBeVisible();

		const displayedTitles = await postLinksInLoop.allTextContents();

		// Since exclude_current is OFF, the post should be included
		expect( displayedTitles ).toContain( 'Toggle Test Post' );
	} );
} );
