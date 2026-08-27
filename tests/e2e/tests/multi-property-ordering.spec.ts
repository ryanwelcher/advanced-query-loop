/**
 * Import our custom test fixtures.
 */
import { test, expect } from '../aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from '../utils';

/**
 * Opens the AQL Order by panel options menu and selects the Secondary sort
 * item so its controls become visible in the panel.
 *
 * @param {import('@playwright/test').Page} page Playwright page object.
 */
const addSecondarySortControl = async ( page ) => {
	await page.getByRole( 'button', { name: 'AQL: Order by options' } ).click();
	await page
		.getByRole( 'menuitemcheckbox', { name: 'Secondary sort' } )
		.click();
	await page.keyboard.press( 'Escape' );
};

/**
 * Extracts the seeded post IDs, in render order, from the frontend query loop.
 *
 * Titles read "Test Post - ID: NNN"; the container post's own title has no
 * "ID:" so it is dropped, and the result is de-duped (a Playground rendering
 * quirk can repeat titles).
 *
 * @param {import('@playwright/test').Page} page Playwright page object.
 * @return {Promise<number[]>} Rendered post IDs in order.
 */
const renderedPostIds = async ( page ) => {
	const postTitles = await page
		.locator( '.wp-block-query .wp-block-post-title' )
		.allTextContents();

	return [
		...new Set(
			postTitles
				.map( ( title ) => {
					const match = title.match( /ID:\s*(\d+)/ );
					return match ? parseInt( match[ 1 ], 10 ) : null;
				} )
				.filter( ( id ): id is number => id !== null )
		),
	];
};

test.describe( 'Multi-property ordering', () => {
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

	test( 'Secondary sort controls appear and store attributes', async ( {
		page,
		editor,
	} ) => {
		await addSecondarySortControl( page );

		await expect( page.getByLabel( 'Secondary Order By' ) ).toBeVisible();

		const blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.secondary_orderby ).toEqual( {
			order_by: 'date',
			order: 'desc',
		} );
	} );

	test( 'Featured-first then date ordering on the frontend', async ( {
		page,
		editor,
	} ) => {
		// Show all seeded posts (10) plus the post that hosts the query
		// loop itself, which also matches the query since it's a
		// published `post`.
		await page
			.getByRole( 'spinbutton', { name: 'Items per page' } )
			.fill( '20' );

		// Wait for the editor preview to re-query rather than sleeping: the
		// default is 3 posts, so more than 10 means the new count applied.
		await expect
			.poll(
				async () =>
					editor.canvas.locator( '.wp-block-post-title' ).count(),
				{ timeout: 20000 }
			)
			.toBeGreaterThan( 10 );

		// Primary: Meta Value on _test_featured, descending (the
		// default order) so posts with the key ('yes') sort before
		// posts without it.
		await page.getByLabel( 'Post Order By' ).selectOption( 'meta_value' );
		await page
			.getByRole( 'combobox', { name: 'Meta key to sort by' } )
			.fill( '_test_featured' );
		await page.keyboard.press( 'Enter' );

		// Secondary: Date, descending (the seeded default).
		await addSecondarySortControl( page );

		await editor.publishPost();
		const postUrl = new URL( page.url() ).searchParams.get( 'post' );
		await page.goto( `/?p=${ postUrl }` );

		const ids = await renderedPostIds( page );

		// The blueprint seeds 10 posts; all of them must render (none
		// dropped by the NOT EXISTS branch of the meta ordering clause).
		const totalSeeded = 10;
		expect( ids.length ).toBe( totalSeeded );

		// The blueprint's `--post_date` values are NOT in creation-ID
		// order, so "oldest two by date" doesn't mean "two lowest IDs".
		// Creation order (and therefore relative ID order, low -> high)
		// with each post's seeded date:
		//   1: 2024-06-15   3: 2024-09-22   5: 2024-11-30   7: 2024-07-07
		//   2: 2024-02-10   4: 2024-01-05   6: 2024-03-18   8: 2024-04-25
		//   9: 2024-12-12  10: 2024-05-08
		// The seeding step flags the two OLDEST-by-date posts as
		// featured: 2024-01-05 (creation order 4) and 2024-02-10
		// (creation order 2). Since IDs increase with creation order,
		// the 2024-02-10 post has the lower ID of the pair.
		//
		// Every seeded post also carries unrelated `_test_noise` meta, so a
		// meta ordering clause that sorts on an unkeyed join would order the
		// keyless posts by that noise instead of dropping them to the end.
		//
		// Expected render order, expressed as creation-order ranks
		// (1 = lowest ID .. 10 = highest ID):
		//   - Featured pair, secondary date desc: rank 2, then rank 4
		//     (2024-02-10 is newer than 2024-01-05).
		//   - Remaining 8 posts, date desc: ranks 9, 5, 3, 7, 1, 10, 8, 6.
		const expectedRankOrder = [ 2, 4, 9, 5, 3, 7, 1, 10, 8, 6 ];

		// Recover each rendered post's creation-order rank from its
		// relative position among the observed IDs (ascending == rank
		// order, since IDs were assigned sequentially during seeding).
		const sortedAsc = [ ...ids ].sort( ( a, b ) => a - b );
		const rankOrder = ids.map( ( id ) => sortedAsc.indexOf( id ) + 1 );

		expect( rankOrder ).toEqual( expectedRankOrder );
	} );

	test( 'Ascending meta order puts posts without the key first', async ( {
		page,
		editor,
	} ) => {
		await page
			.getByRole( 'spinbutton', { name: 'Items per page' } )
			.fill( '20' );

		await expect
			.poll(
				async () =>
					editor.canvas.locator( '.wp-block-post-title' ).count(),
				{ timeout: 20000 }
			)
			.toBeGreaterThan( 10 );

		await page.getByLabel( 'Post Order By' ).selectOption( 'meta_value' );
		await page
			.getByRole( 'combobox', { name: 'Meta key to sort by' } )
			.fill( '_test_featured' );
		await page.keyboard.press( 'Enter' );

		// MySQL sorts NULL first in ASC, so the eight keyless posts must
		// lead and the two featured posts must trail.
		await page.getByRole( 'checkbox', { name: 'Ascending Order' } ).click();

		await editor.publishPost();
		const postUrl = new URL( page.url() ).searchParams.get( 'post' );
		await page.goto( `/?p=${ postUrl }` );

		const ids = await renderedPostIds( page );
		expect( ids.length ).toBe( 10 );

		const sortedAsc = [ ...ids ].sort( ( a, b ) => a - b );
		const rankOrder = ids.map( ( id ) => sortedAsc.indexOf( id ) + 1 );

		// Featured posts are creation-order ranks 2 and 4 (see the test
		// above). Ascending, they must be the LAST two rendered.
		expect( rankOrder.slice( -2 ).sort( ( a, b ) => a - b ) ).toEqual( [
			2, 4,
		] );
		expect( rankOrder.slice( 0, 8 ) ).not.toContain( 2 );
		expect( rankOrder.slice( 0, 8 ) ).not.toContain( 4 );
	} );
} );
