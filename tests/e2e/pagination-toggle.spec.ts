/**
 * Import our custom test fixtures.
 */
import { test, expect } from './aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from './utils';

test.describe( 'Disable pagination toggle', () => {
	test.beforeEach( async ( { page, editor, playground } ) => {
		await playground.init( { page, editor } );
	} );

	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	test( 'Initial state', async ( { page, editor } ) => {
		await insertAQL( { page, editor } );

		await expect(
			page.getByRole( 'checkbox', { name: 'Disable pagination' } )
		).toBeVisible();

		await expect(
			page.getByRole( 'checkbox', { name: 'Disable pagination' } )
		).not.toBeChecked();

		const blocks = await editor.getBlocks();

		await expect(
			blocks[ 0 ].attributes.query.disable_pagination
		).toBeUndefined();
	} );

	test( 'Toggled on and then off', async ( { page, editor } ) => {
		await insertAQL( { page, editor } );
		let blocks;

		await page
			.getByRole( 'checkbox', { name: 'Disable pagination' } )
			.click();

		await expect(
			page.getByRole( 'checkbox', { name: 'Disable pagination' } )
		).toBeChecked();

		blocks = await editor.getBlocks();

		await expect( blocks[ 0 ].attributes.query.disable_pagination ).toEqual(
			true
		);

		await page
			.getByRole( 'checkbox', { name: 'Disable pagination' } )
			.click();

		await expect(
			page.getByRole( 'checkbox', { name: 'Disable pagination' } )
		).not.toBeChecked();

		blocks = await editor.getBlocks();

		await expect( blocks[ 0 ].attributes.query.disable_pagination ).toEqual(
			false
		);
	} );
} );
