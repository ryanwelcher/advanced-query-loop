/**
 * Import our custom test fixtures.
 */
import { test, expect } from '../aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from '../utils';

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
		await page
			.getByRole( 'checkbox', { name: 'Add secondary sort' } )
			.click();
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
		await page.waitForTimeout( 500 );

		// Primary: Meta Value on _test_featured, descending (the
		// default order) so posts with the key ('yes') sort before
		// posts without it.
		await page.getByLabel( 'Post Order By' ).selectOption( 'meta_value' );
		await page
			.getByRole( 'combobox', { name: 'Meta key to sort by' } )
			.fill( '_test_featured' );
		await page.keyboard.press( 'Enter' );

		// Secondary: Date, descending (the toggle's default).
		await page
			.getByRole( 'checkbox', { name: 'Add secondary sort' } )
			.click();

		await editor.publishPost();
		const postUrl = new URL( page.url() ).searchParams.get( 'post' );
		await page.goto( `/?p=${ postUrl }` );

		const postTitles = await page
			.locator( '.wp-block-query .wp-block-post-title' )
			.allTextContents();

		// Extract post IDs from the "Test Post - ID: NNN" titles. This
		// also drops the container post itself (its title doesn't
		// contain "ID:") and de-dupes (a Playground rendering quirk).
		const ids = [
			...new Set(
				postTitles
					.map( ( title ) => {
						const match = title.match( /ID:\s*(\d+)/ );
						return match ? parseInt( match[ 1 ], 10 ) : null;
					} )
					.filter( ( id ): id is number => id !== null )
			),
		];

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
} );
