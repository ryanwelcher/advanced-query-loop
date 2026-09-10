/**
 * Import our custom test fixtures.
 */
import { test, expect } from '../aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from '../utils';

/**
 * Core's Query Loop block owns the Exclude current toggle as of WordPress 7.1.
 * These tests cover that toggle on an AQL block, AQL's migration of the legacy
 * `exclude_current` query key to core's `excludeCurrent`, and the frontend
 * result, which core resolves.
 */

/**
 * Opens core's Filters panel options menu and selects the "Exclude" item so
 * the Exclude current toggle becomes visible in the panel.
 *
 * @param {import('@playwright/test').Page} page Playwright page object.
 */
const addExcludeCurrentControl = async ( page ) => {
	await page.getByRole( 'button', { name: 'Filters options' } ).click();
	await page.getByRole( 'menuitemcheckbox', { name: 'Exclude' } ).click();
	await page.keyboard.press( 'Escape' );
};

const excludeCurrentToggle = ( page ) =>
	page.getByRole( 'checkbox', { name: 'Exclude current' } );

/**
 * A full core query attribute so a block can be inserted with a legacy
 * `exclude_current` key already present. The object attribute replaces the
 * default entirely, so every core key must be provided.
 *
 * @param {boolean|number} excludeCurrent The legacy value to store.
 */
const legacyQuery = ( excludeCurrent ) => ( {
	perPage: 3,
	pages: 0,
	offset: 0,
	postType: 'post',
	order: 'desc',
	orderBy: 'date',
	author: '',
	search: '',
	exclude: [],
	sticky: '',
	inherit: false,
	exclude_current: excludeCurrent,
} );

/**
 * Inserts an AQL block carrying a legacy `exclude_current` value.
 *
 * The block is inserted with inner blocks because core's Query Loop only
 * renders its inspector controls (including the Exclude current toggle) once
 * it has inner blocks; without them it shows the pattern placeholder instead.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor         Editor utils.
 * @param {boolean|number}                                        excludeCurrent The legacy value to store.
 */
const insertLegacyAQL = async ( editor, excludeCurrent ) => {
	await editor.insertBlock( {
		name: 'core/query',
		attributes: {
			namespace: 'advanced-query-loop',
			query: legacyQuery( excludeCurrent ),
		},
		innerBlocks: [
			{
				name: 'core/post-template',
				innerBlocks: [
					{ name: 'core/post-title' },
					{ name: 'core/post-date' },
				],
			},
		],
	} );
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
		await addExcludeCurrentControl( page );
	} );

	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	test( 'Initial state - should be visible and unchecked', async ( {
		page,
		editor,
	} ) => {
		await expect( excludeCurrentToggle( page ) ).toBeVisible();
		await expect( excludeCurrentToggle( page ) ).not.toBeChecked();

		const blocks = await editor.getBlocks();

		expect( blocks[ 0 ].attributes.query.excludeCurrent ).toBeNull();
		expect( blocks[ 0 ].attributes.query.exclude_current ).toBeUndefined();
	} );

	test( 'Should toggle on and store true', async ( { page, editor } ) => {
		await excludeCurrentToggle( page ).click();

		await expect( excludeCurrentToggle( page ) ).toBeChecked();

		const blocks = await editor.getBlocks();

		expect( blocks[ 0 ].attributes.query.excludeCurrent ).toEqual( true );
		expect( blocks[ 0 ].attributes.query.exclude_current ).toBeUndefined();
	} );

	test( 'Should toggle off and store false', async ( { page, editor } ) => {
		await excludeCurrentToggle( page ).click();
		await excludeCurrentToggle( page ).click();

		await expect( excludeCurrentToggle( page ) ).not.toBeChecked();

		const blocks = await editor.getBlocks();

		expect( blocks[ 0 ].attributes.query.excludeCurrent ).toEqual( false );
	} );

	test( 'Should not render the legacy AQL toggle when core supports it', async ( {
		page,
	} ) => {
		await expect(
			page.getByRole( 'checkbox', { name: 'Exclude Current Post' } )
		).toHaveCount( 0 );
		await expect(
			page.getByRole( 'button', { name: 'AQL: Extensions' } )
		).toHaveCount( 0 );
	} );
} );

test.describe( 'Exclude Current Post - Legacy migration', () => {
	test.beforeEach( async ( { page, editor, playground, admin } ) => {
		await playground.init( { page, editor } );
		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );
	} );

	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	test( 'Should migrate a truthy exclude_current to excludeCurrent: true', async ( {
		page,
		editor,
	} ) => {
		await insertLegacyAQL( editor, true );

		await expect
			.poll( async () => {
				const blocks = await editor.getBlocks();
				return blocks[ 0 ].attributes.query;
			} )
			.toMatchObject( { excludeCurrent: true } );

		const blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.exclude_current ).toBeUndefined();

		// Core shows its toggle for a migrated value without opening the menu.
		await expect( excludeCurrentToggle( page ) ).toBeChecked();
	} );

	test( 'Should migrate a stored post ID to excludeCurrent: true', async ( {
		page,
		editor,
	} ) => {
		await insertLegacyAQL( editor, 42 );

		await expect
			.poll( async () => {
				const blocks = await editor.getBlocks();
				return blocks[ 0 ].attributes.query;
			} )
			.toMatchObject( { excludeCurrent: true } );

		const blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.exclude_current ).toBeUndefined();

		await expect( excludeCurrentToggle( page ) ).toBeChecked();
	} );

	test( 'Should drop a falsy exclude_current without enabling excludeCurrent', async ( {
		page,
		editor,
	} ) => {
		await insertLegacyAQL( editor, false );

		await expect
			.poll( async () => {
				const blocks = await editor.getBlocks();
				return Object.prototype.hasOwnProperty.call(
					blocks[ 0 ].attributes.query,
					'exclude_current'
				);
			} )
			.toBe( false );

		const blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.excludeCurrent ).toBeFalsy();

		await expect( excludeCurrentToggle( page ) ).not.toBeChecked();
	} );
} );

test.describe( 'Exclude Current Post - Frontend Rendering', () => {
	test.beforeEach( async ( { page, editor, playground } ) => {
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

		await insertAQL( { editor, page } );
		await addExcludeCurrentControl( page );

		await excludeCurrentToggle( page ).click();
		await expect( excludeCurrentToggle( page ) ).toBeChecked();

		await editor.publishPost();

		const postUrl = await page
			.locator( '.post-publish-panel__postpublish-buttons a' )
			.first()
			.getAttribute( 'href' );

		expect( postUrl ).toBeTruthy();

		await page.goto( postUrl! );
		await page.waitForLoadState( 'networkidle' );

		// The AQL block is the first query loop inserted into the post content.
		// The theme may also render its own query loops (e.g. a "More posts"
		// section), so we scope to the first .wp-block-query to isolate our block.
		const aqlQueryLoop = page.locator( '.wp-block-query' ).first();
		await expect( aqlQueryLoop ).toBeVisible();

		const postTitlesInAQL = aqlQueryLoop.locator( '.wp-block-post-title' );
		const aqlTitles = await postTitlesInAQL.allTextContents();

		expect( aqlTitles ).not.toContain( 'Main Post with AQL' );
		expect( aqlTitles ).toContain( 'Test Post Alpha' );
	} );

	test( 'Should include current post when excludeCurrent is not set', async ( {
		page,
		editor,
		admin,
	} ) => {
		test.setTimeout( 60000 );

		await admin.createNewPost( { title: 'Test Post One' } );
		await editor.publishPost();

		await admin.createNewPost( { title: 'Main Post Without Exclusion' } );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		await insertAQL( { editor, page } );
		await addExcludeCurrentControl( page );

		await expect( excludeCurrentToggle( page ) ).not.toBeChecked();

		await editor.publishPost();

		const postUrl = await page
			.locator( '.post-publish-panel__postpublish-buttons a' )
			.first()
			.getAttribute( 'href' );

		expect( postUrl ).toBeTruthy();

		await page.goto( postUrl! );
		await page.waitForLoadState( 'networkidle' );

		const postLinksInLoop = page.locator(
			'.wp-block-query .wp-block-post-title a'
		);

		await expect( postLinksInLoop.first() ).toBeVisible();

		const displayedTitles = await postLinksInLoop.allTextContents();

		expect( displayedTitles ).toContain( 'Main Post Without Exclusion' );
		expect( displayedTitles ).toContain( 'Test Post One' );
	} );

	test( 'Should work correctly when toggled on then off', async ( {
		page,
		editor,
		admin,
	} ) => {
		test.setTimeout( 60000 );

		await admin.createNewPost( { title: 'Another Test Post' } );
		await editor.publishPost();

		await admin.createNewPost( { title: 'Toggle Test Post' } );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		await insertAQL( { editor, page } );
		await addExcludeCurrentControl( page );

		await excludeCurrentToggle( page ).click();
		await excludeCurrentToggle( page ).click();

		await expect( excludeCurrentToggle( page ) ).not.toBeChecked();

		await editor.publishPost();

		const postUrl = await page
			.locator( '.post-publish-panel__postpublish-buttons a' )
			.first()
			.getAttribute( 'href' );

		await page.goto( postUrl! );
		await page.waitForLoadState( 'networkidle' );

		const postLinksInLoop = page.locator(
			'.wp-block-query .wp-block-post-title a'
		);

		await expect( postLinksInLoop.first() ).toBeVisible();

		const displayedTitles = await postLinksInLoop.allTextContents();

		expect( displayedTitles ).toContain( 'Toggle Test Post' );
	} );
} );
