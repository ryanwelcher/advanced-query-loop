/**
 * Import our custom test fixtures.
 */
import { test, expect } from '../aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from '../utils';

test.describe( 'Additional Post Types', () => {
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

	test( 'Control is visible and empty', async ( {
		page,
		editor,
		selectors,
	} ) => {
		// await page.getByRole( 'radio', { name: 'Custom' } ).click();

		const multiplePostTypes = selectors.selectFormTokenField(
			'Additional Post Types'
		);
		expect( multiplePostTypes ).toBeVisible();
		expect( multiplePostTypes ).toBeEmpty();
		// const list = await multiplePostTypes.getAttribute( 'aria-describedby' );

		// expect( await page.getByText( 'page' ) ).not.toBeVisible();
		// expect( await page.getByText( 'attachment' ) ).not.toBeVisible();
		// await page.getByRole( 'option', { name: 'attachment' } ).click();
		// await expect( multiplePostTypes ).toBeEmpty();
	} );
} );
