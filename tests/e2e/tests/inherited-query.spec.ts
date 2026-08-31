/**
 * Import our custom test fixtures.
 */
import { test, expect } from '../aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from '../utils';

/**
 * Extracts the seeded post IDs, in render order, from the frontend query
 * loop. Titles read "Test Post - ID: NNN".
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

test.describe( 'Inherited queries', () => {
	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	test( 'category archive stays filtered while AQL meta ordering applies', async ( {
		page,
		editor,
		playground,
	} ) => {
		await playground.init( { page, editor } );

		// Plain-permalink form: works regardless of rewrite settings.
		await page.goto( '/?category_name=season-one' );

		const ids = await renderedPostIds( page );

		// Filtering: exactly the 5 categorized posts, not all 10 seeded.
		expect( ids ).toHaveLength( 5 );

		// Ordering: _test_screening equals the post ID and the template
		// orders by meta_value_num ASC, so IDs must render ascending —
		// distinct from the archive default (date DESC) and from date ASC.
		const sorted = [ ...ids ].sort( ( a, b ) => a - b );
		expect( ids ).toEqual( sorted );
	} );

	test( 'archive pagination keeps working with inherit ON', async ( {
		page,
		editor,
		playground,
	} ) => {
		await playground.init( { page, editor } );

		// The category-season-two template shows 2 posts per page over
		// 5 categorized posts.
		await page.goto( '/?category_name=season-two' );
		const pageOneIds = await renderedPostIds( page );
		expect( pageOneIds ).toHaveLength( 2 );

		await page.goto( '/?category_name=season-two&paged=2' );
		const pageTwoIds = await renderedPostIds( page );
		expect( pageTwoIds ).toHaveLength( 2 );

		// Pages are disjoint and continue the ascending meta order.
		for ( const id of pageTwoIds ) {
			expect( pageOneIds ).not.toContain( id );
			expect( id ).toBeGreaterThan( Math.max( ...pageOneIds ) );
		}
	} );

	test( 'inherit mode exposes the advanced control panels', async ( {
		page,
		editor,
		playground,
		admin,
	} ) => {
		await playground.init( { page, editor } );
		await admin.visitAdminPage( 'post-new.php' );
		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );
		await insertAQL( { editor, page } );

		// insertAQL leaves the block on "Custom"; switch to inherit mode.
		await page.getByRole( 'radio', { name: 'Default' } ).click();

		// Scoped to the editor settings sidebar: the same notice text is
		// also mirrored into the a11y-speak live region, which would
		// otherwise make an unscoped getByText() match two elements.
		const editorSettings = page.getByLabel( 'Editor settings' );

		await expect( editorSettings.getByText( 'AQL: Meta' ) ).toBeVisible();
		await expect(
			editorSettings.getByText( 'AQL: Taxonomy' )
		).toBeVisible();
		await expect(
			editorSettings.getByText(
				'Editor previews cannot reflect the specific archive being viewed. Verify results on the front end.'
			)
		).toBeVisible();
	} );
} );
