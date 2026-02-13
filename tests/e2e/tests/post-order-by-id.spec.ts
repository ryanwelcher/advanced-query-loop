/**
 * Import our custom test fixtures.
 */
import { test, expect } from '../aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from '../utils';

test.describe( 'Post Order By ID', () => {
	test.beforeEach( async ( { page, editor, playground, admin } ) => {
		await playground.init( { page, editor } );
	} );

	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	test( 'Post Order By control is visible and has Post ID option', async ( {
		page,
		editor,
		admin,
	} ) => {
		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		await insertAQL( { editor, page } );

		// Check that the Post Order By select is visible
		const orderBySelect = page.getByLabel( 'Post Order By' );
		await expect( orderBySelect ).toBeVisible();

		// Get the option
		const postIdOption = orderBySelect.locator( 'option[value="id"]' );
		await expect( postIdOption ).toHaveCount( 1 );
		await expect( postIdOption ).toHaveText( 'Post ID' );
	} );

	test( 'Selecting Post ID updates the block attributes correctly', async ( {
		page,
		editor,
		admin,
	} ) => {
		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		await insertAQL( { editor, page } );

		// Select "Post ID" from the order by dropdown (value is lowercase 'id')
		const orderBySelect = page.getByLabel( 'Post Order By' );
		await orderBySelect.selectOption( 'id' );

		// Get the block attributes
		const blocks = await editor.getBlocks();

		// Verify that orderBy is set to 'id' (lowercase in JS, normalized to 'ID' in PHP)
		expect( blocks[ 0 ].attributes.query.orderBy ).toEqual( 'id' );
	} );

	test( 'Posts are ordered by ID on the frontend (not by date)', async ( {
		page,
		editor,
		admin,
	} ) => {
		// Create a post with AQL block
		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		await insertAQL( { editor, page } );

		// Increase posts per page to show all test posts
		await page.getByRole( 'spinbutton', { name: 'Items per page' } ).fill( '10' );
		await page.waitForTimeout( 500 );

		// Select "Post ID" from the order by dropdown
		const orderBySelect = page.getByLabel( 'Post Order By' );
		await orderBySelect.selectOption( 'id' );

		// Set ascending order
		const ascendingToggle = page.getByRole( 'checkbox', {
			name: 'Ascending Order',
		} );
		await ascendingToggle.check();

		// Publish the post
		await editor.publishPost();

		// Get the post URL
		const postUrl = new URL( page.url() ).searchParams.get( 'post' );

		// Visit the post on the frontend
		await page.goto( `/?p=${ postUrl }` );

		// Get all post titles in the query loop
		const postTitles = await page
			.locator( '.wp-block-query .wp-block-post-title' )
			.allTextContents();

		// Extract post IDs from titles (assuming format "Test Post - ID: 1841")
		const postIds = postTitles
			.map( ( title ) => {
				const match = title.match( /ID:\s*(\d+)/ );
				return match ? parseInt( match[ 1 ], 10 ) : null;
			} )
			.filter( ( id ) => id !== null );

		// Remove duplicates (Playground environment quirk)
		const uniqueIds = [ ...new Set( postIds ) ];

		// Verify that posts are ordered by ID (ascending)
		const sortedIds = [ ...uniqueIds ].sort( ( a, b ) => a - b );

		expect( uniqueIds ).toEqual( sortedIds );

		// Verify we have multiple posts
		expect( uniqueIds.length ).toBeGreaterThanOrEqual( 5 );

		// Verify ascending order - first ID should be less than last
		expect( uniqueIds[ 0 ] ).toBeLessThan(
			uniqueIds[ uniqueIds.length - 1 ]
		);
	} );

	test( 'Descending order by Post ID works correctly', async ( {
		page,
		editor,
		admin,
	} ) => {
		// Create a post with AQL block
		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		await insertAQL( { editor, page } );

		// Increase posts per page to show all test posts
		await page.getByRole( 'spinbutton', { name: 'Items per page' } ).fill( '10' );
		await page.waitForTimeout( 500 );

		// Select "Post ID" from the order by dropdown
		const orderBySelect = page.getByLabel( 'Post Order By' );
		await orderBySelect.selectOption( 'id' );

		// Set descending order (uncheck ascending)
		const ascendingToggle = page.getByRole( 'checkbox', {
			name: 'Ascending Order',
		} );
		await ascendingToggle.uncheck();

		// Verify the block attributes
		const blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.orderBy ).toEqual( 'id' );
		expect( blocks[ 0 ].attributes.query.order ).toEqual( 'desc' );

		// Publish the post
		await editor.publishPost();

		// Get the post URL
		const postUrl = new URL( page.url() ).searchParams.get( 'post' );

		// Visit the post on the frontend
		await page.goto( `/?p=${ postUrl }` );

		// Get all post titles in the query loop
		const postTitles = await page
			.locator( '.wp-block-query .wp-block-post-title' )
			.allTextContents();

		// Extract post IDs from titles
		const postIds = postTitles
			.map( ( title ) => {
				const match = title.match( /ID:\s*(\d+)/ );
				return match ? parseInt( match[ 1 ], 10 ) : null;
			} )
			.filter( ( id ) => id !== null );

		// Remove duplicates (Playground environment quirk)
		const uniqueIds = [ ...new Set( postIds ) ];

		// Verify that posts are ordered by ID (descending)
		const sortedIds = [ ...uniqueIds ].sort( ( a, b ) => b - a );

		expect( uniqueIds ).toEqual( sortedIds );

		// Verify we have multiple posts
		expect( uniqueIds.length ).toBeGreaterThanOrEqual( 5 );

		// First post should have higher ID than last post (descending)
		expect( uniqueIds[ 0 ] ).toBeGreaterThan(
			uniqueIds[ uniqueIds.length - 1 ]
		);
	} );

	test( 'Editor preview shows correct ordering by Post ID', async ( {
		page,
		editor,
		admin,
	} ) => {
		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		await insertAQL( { editor, page } );

		// Select "Post ID" from the order by dropdown
		const orderBySelect = page.getByLabel( 'Post Order By' );
		await orderBySelect.selectOption( 'id' );

		// Set ascending order
		const ascendingToggle = page.getByRole( 'checkbox', {
			name: 'Ascending Order',
		} );
		await ascendingToggle.check();

		// Wait for the editor to update the preview
		await page.waitForTimeout( 1000 );

		// Get post titles in the editor canvas
		const postTitles = await editor.canvas
			.locator( '.wp-block-post-title' )
			.allTextContents();

		// Extract post IDs from titles
		const postIds = postTitles
			.map( ( title ) => {
				const match = title.match( /ID:\s*(\d+)/ );
				return match ? parseInt( match[ 1 ], 10 ) : null;
			} )
			.filter( ( id ) => id !== null );

		// Verify that posts are ordered by ID (ascending) in the editor
		if ( postIds.length > 1 ) {
			const sortedIds = [ ...postIds ].sort( ( a, b ) => a - b );
			expect( postIds ).toEqual( sortedIds );
		}
	} );

	test( 'Switching from Date to Post ID ordering changes the order', async ( {
		page,
		editor,
		admin,
	} ) => {
		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		await insertAQL( { editor, page } );

		// Increase posts per page to show all test posts
		await page.getByRole( 'spinbutton', { name: 'Items per page' } ).fill( '10' );
		await page.waitForTimeout( 500 );

		// Start with Date ordering (default)
		const orderBySelect = page.getByLabel( 'Post Order By' );
		await orderBySelect.selectOption( 'date' );

		await page.waitForTimeout( 500 );

		// Get initial order (by date)
		let postTitles = await editor.canvas
			.locator( '.wp-block-post-title' )
			.allTextContents();

		const postIdsByDate = postTitles
			.map( ( title ) => {
				const match = title.match( /ID:\s*(\d+)/ );
				return match ? parseInt( match[ 1 ], 10 ) : null;
			} )
			.filter( ( id ) => id !== null );

		// Switch to Post ID ordering
		await orderBySelect.selectOption( 'id' );

		// Ensure ascending order is set
		const ascendingToggle = page.getByRole( 'checkbox', {
			name: 'Ascending Order',
		} );
		await ascendingToggle.check();

		await page.waitForTimeout( 500 );

		// Get new order (by ID)
		postTitles = await editor.canvas
			.locator( '.wp-block-post-title' )
			.allTextContents();

		const postIdsByPostId = postTitles
			.map( ( title ) => {
				const match = title.match( /ID:\s*(\d+)/ );
				return match ? parseInt( match[ 1 ], 10 ) : null;
			} )
			.filter( ( id ) => id !== null );

		// Remove duplicates from both arrays (Playground environment quirk)
		const uniqueIdsByDate = [ ...new Set( postIdsByDate ) ];
		const uniqueIdsByPostId = [ ...new Set( postIdsByPostId ) ];

		// Verify that the order changed
		// (only if we have multiple posts with different dates and IDs)
		if (
			uniqueIdsByDate.length > 1 &&
			uniqueIdsByPostId.length > 1
		) {
			expect( uniqueIdsByPostId ).not.toEqual( uniqueIdsByDate );

			// Verify that Post ID order is actually sorted by ID
			const sortedByIdAsc = [ ...uniqueIdsByPostId ].sort(
				( a, b ) => a - b
			);
			expect( uniqueIdsByPostId ).toEqual( sortedByIdAsc );
		}
	} );
} );
