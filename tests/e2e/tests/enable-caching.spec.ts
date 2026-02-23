/**
 * Import our custom test fixtures.
 */
import { test, expect } from '../aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from '../utils';

/**
 * Opens the AQL Performance Controls panel options menu and selects
 * the Caching item so the toggle becomes visible in the panel.
 *
 * @param {import('@playwright/test').Page} page Playwright page object.
 */
const addCachingControl = async ( page ) => {
	await page
		.getByRole( 'button', { name: 'AQL: Performance Controls options' } )
		.click();
	await page.getByRole( 'menuitemcheckbox', { name: 'Caching' } ).click();
	await page.keyboard.press( 'Escape' );
};

test.describe( 'Enable Caching toggle', () => {
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

	test( 'AQL: Performance Controls panel is visible', async ( { page } ) => {
		await expect(
			page.getByText( 'AQL: Performance Controls' )
		).toBeVisible();
	} );

	test( 'Caching control can be added from the panel options menu', async ( {
		page,
	} ) => {
		await addCachingControl( page );

		await expect(
			page.getByRole( 'checkbox', {
				name: 'Enable Caching for this query',
			} )
		).toBeVisible();

		await expect(
			page.getByRole( 'checkbox', {
				name: 'Enable Caching for this query',
			} )
		).not.toBeChecked();
	} );

	test( 'Enabling caching sets the attribute to true', async ( {
		page,
		editor,
	} ) => {
		await addCachingControl( page );

		await page
			.getByRole( 'checkbox', { name: 'Enable Caching for this query' } )
			.click();

		await expect(
			page.getByRole( 'checkbox', {
				name: 'Enable Caching for this query',
			} )
		).toBeChecked();

		const blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.enable_caching ).toEqual( true );
	} );

	test( 'Disabling caching sets the attribute to false', async ( {
		page,
		editor,
	} ) => {
		await addCachingControl( page );

		// Toggle on then off.
		await page
			.getByRole( 'checkbox', { name: 'Enable Caching for this query' } )
			.click();
		await page
			.getByRole( 'checkbox', { name: 'Enable Caching for this query' } )
			.click();

		await expect(
			page.getByRole( 'checkbox', {
				name: 'Enable Caching for this query',
			} )
		).not.toBeChecked();

		const blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.enable_caching ).toEqual( false );
	} );

	test( 'Reset All clears the enable_caching attribute', async ( {
		page,
		editor,
	} ) => {
		await addCachingControl( page );

		// Enable caching.
		await page
			.getByRole( 'checkbox', { name: 'Enable Caching for this query' } )
			.click();

		let blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.enable_caching ).toEqual( true );

		// Use the panel's Reset All option.
		await page
			.getByRole( 'button', {
				name: 'AQL: Performance Controls options',
			} )
			.click();
		await page.getByRole( 'menuitem', { name: 'Reset all' } ).click();

		blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.enable_caching ).toEqual( false );
	} );

	test( 'Caching toggle is disabled when order is set to Random', async ( {
		page,
	} ) => {
		await addCachingControl( page );

		await page.getByLabel( 'Post Order By' ).selectOption( 'rand' );

		await expect(
			page.getByRole( 'checkbox', {
				name: 'Enable Caching for this query',
			} )
		).toBeDisabled();
	} );

	test( 'Switching to Random order clears enable_caching', async ( {
		page,
		editor,
	} ) => {
		await addCachingControl( page );

		// Enable caching first.
		await page
			.getByRole( 'checkbox', { name: 'Enable Caching for this query' } )
			.click();

		let blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.enable_caching ).toEqual( true );

		// Switch to Random order.
		await page.getByLabel( 'Post Order By' ).selectOption( 'rand' );

		// Attribute must be cleared.
		blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.enable_caching ).toEqual( false );

		// Toggle must be disabled.
		await expect(
			page.getByRole( 'checkbox', {
				name: 'Enable Caching for this query',
			} )
		).toBeDisabled();
	} );

	test( 'Switching away from Random order re-enables the caching toggle', async ( {
		page,
	} ) => {
		await addCachingControl( page );

		// Go to Random first.
		await page.getByLabel( 'Post Order By' ).selectOption( 'rand' );

		await expect(
			page.getByRole( 'checkbox', {
				name: 'Enable Caching for this query',
			} )
		).toBeDisabled();

		// Switch to a non-random order.
		await page.getByLabel( 'Post Order By' ).selectOption( 'date' );

		await expect(
			page.getByRole( 'checkbox', {
				name: 'Enable Caching for this query',
			} )
		).toBeEnabled();

		await expect(
			page.getByRole( 'checkbox', {
				name: 'Enable Caching for this query',
			} )
		).not.toBeChecked();
	} );
} );

test.describe( 'Enable Caching - Frontend Rendering', () => {
	test.beforeEach( async ( { page, editor, playground } ) => {
		await playground.init( { page, editor } );
	} );

	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	test( 'Page renders correctly with caching enabled', async ( {
		page,
		editor,
		admin,
	} ) => {
		test.setTimeout( 60000 );

		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		await insertAQL( { editor, page } );

		await addCachingControl( page );

		await page
			.getByRole( 'checkbox', { name: 'Enable Caching for this query' } )
			.click();

		await expect(
			page.getByRole( 'checkbox', {
				name: 'Enable Caching for this query',
			} )
		).toBeChecked();

		await editor.publishPost();

		const postUrl = await page
			.locator( '.post-publish-panel__postpublish-buttons a' )
			.first()
			.getAttribute( 'href' );

		expect( postUrl ).toBeTruthy();

		await page.goto( postUrl! );
		await page.waitForLoadState( 'networkidle' );

		// The query loop should render with posts visible.
		const queryLoop = page.locator( '.wp-block-query' ).first();
		await expect( queryLoop ).toBeVisible();
		await expect(
			queryLoop.locator( '.wp-block-post-title' ).first()
		).toBeVisible();
	} );

	test( 'Repeated loads of a cached page return consistent results', async ( {
		page,
		editor,
		admin,
	} ) => {
		test.setTimeout( 60000 );

		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		await insertAQL( { editor, page } );
		await addCachingControl( page );

		await page
			.getByRole( 'checkbox', { name: 'Enable Caching for this query' } )
			.click();

		await editor.publishPost();

		const postUrl = await page
			.locator( '.post-publish-panel__postpublish-buttons a' )
			.first()
			.getAttribute( 'href' );

		expect( postUrl ).toBeTruthy();

		// First visit primes the cache.
		await page.goto( postUrl! );
		await page.waitForLoadState( 'networkidle' );

		const firstLoadTitles = await page
			.locator( '.wp-block-query .wp-block-post-title' )
			.allTextContents();

		// Second visit should serve from cache.
		await page.goto( postUrl! );
		await page.waitForLoadState( 'networkidle' );

		const secondLoadTitles = await page
			.locator( '.wp-block-query .wp-block-post-title' )
			.allTextContents();

		// Both loads must return the same posts in the same order.
		expect( secondLoadTitles ).toEqual( firstLoadTitles );
		expect( firstLoadTitles.length ).toBeGreaterThan( 0 );
	} );
} );
