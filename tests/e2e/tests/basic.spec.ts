/**
 * Import our custom test fixtures.
 */
import { test, expect } from '../aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from '../utils';

test.describe( 'Basic Tests', () => {
	test.beforeEach( async ( { page, editor, playground, admin } ) => {
		await playground.init( { page, editor } );
	} );

	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	test( 'AQL was inserted and variation was selected', async ( {
		editor,
		admin,
	} ) => {
		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );
		await insertAQL( { editor } );
		const blocks = await editor.getBlocks();

		expect( blocks[ 0 ].attributes.namespace ).toEqual(
			'advanced-query-loop'
		);
	} );
} );
