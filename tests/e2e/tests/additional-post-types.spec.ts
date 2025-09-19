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
		const additionalPostTypes = selectors.selectFormTokenField(
			'Additional Post Types'
		);

		await expect( additionalPostTypes ).toBeVisible();
		await expect( additionalPostTypes ).toBeEmpty();
	} );
} );
