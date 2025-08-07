/**
 * Import our custom test fixtures.
 */
import { test, expect } from '../aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from '../utils';

test.describe( 'Disable pagination toggle', () => {
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

	test( 'Initial state', async ( { page, editor, admin } ) => {
		await expect(
			page.getByRole( 'checkbox', { name: 'Disable pagination' } )
		).toBeVisible();

		await expect(
			page.getByRole( 'checkbox', { name: 'Disable pagination' } )
		).not.toBeChecked();

		const blocks = await editor.getBlocks();

		expect(
			blocks[ 0 ].attributes.query.disable_pagination
		).toBeUndefined();
	} );

	test( 'Toggled on and then off', async ( { page, editor, admin } ) => {
		let blocks;

		await page
			.getByRole( 'checkbox', { name: 'Disable pagination' } )
			.click();

		expect(
			page.getByRole( 'checkbox', { name: 'Disable pagination' } )
		).toBeChecked();

		blocks = await editor.getBlocks();

		expect( blocks[ 0 ].attributes.query.disable_pagination ).toEqual(
			true
		);

		await page
			.getByRole( 'checkbox', { name: 'Disable pagination' } )
			.click();

		expect(
			page.getByRole( 'checkbox', { name: 'Disable pagination' } )
		).not.toBeChecked();

		blocks = await editor.getBlocks();

		expect( blocks[ 0 ].attributes.query.disable_pagination ).toEqual(
			false
		);
	} );
} );
