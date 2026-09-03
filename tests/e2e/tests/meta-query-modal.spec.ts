/**
 * Import our custom test fixtures.
 */
import { test, expect } from '../aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from '../utils';

test.describe( 'Meta query builder modal', () => {
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

	test( 'opens as a dialog, persists edits, and returns focus on close', async ( {
		page,
		editor,
	} ) => {
		const trigger = page.getByRole( 'button', {
			name: 'Open Post Meta query builder',
		} );
		await trigger.click();

		const dialog = page.getByRole( 'dialog', {
			name: 'Meta Query Builder',
		} );
		await expect( dialog ).toBeVisible();

		// Edits inside the modal write straight to the block.
		await dialog.getByRole( 'button', { name: 'Add new query' } ).click();
		await dialog
			.getByRole( 'combobox', { name: 'Meta Key' } )
			.fill( 'color' );
		await page.keyboard.press( 'Enter' );

		// Suggestions still render and select inside the modal.
		const metaValueField = dialog.getByRole( 'combobox', {
			name: 'Meta Value',
		} );
		await metaValueField.click();
		await page
			.getByRole( 'option', { name: 'Current Post ID', exact: true } )
			.click();

		let blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.meta_query.queries ).toHaveLength(
			1
		);
		expect(
			blocks[ 0 ].attributes.query.meta_query.queries[ 0 ].meta_key
		).toEqual( 'color' );
		expect(
			blocks[ 0 ].attributes.query.meta_query.queries[ 0 ].meta_value
		).toEqual( '{aql:current_post_id}' );

		// Escape closes the modal and focus returns to the trigger. Token
		// fields consume Escape to dismiss their own suggestions, so move
		// focus to a neutral element first.
		await dialog.getByRole( 'button', { name: 'Add new query' } ).focus();
		await page.keyboard.press( 'Escape' );
		await expect( dialog ).toBeHidden();
		await expect( trigger ).toBeFocused();

		// Reopening shows the persisted condition.
		await trigger.click();
		await expect( dialog ).toBeVisible();
		await expect(
			dialog.getByRole( 'combobox', { name: 'Meta Key' } )
		).toBeVisible();
		await expect(
			dialog.getByText( 'color', { exact: true } )
		).toBeVisible();

		// The close button also closes the modal.
		await dialog.getByRole( 'button', { name: 'Close' } ).click();
		await expect( dialog ).toBeHidden();

		blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.meta_query.queries ).toHaveLength(
			1
		);
	} );

	test( 'leaves the taxonomy builder as a flyout', async ( { page } ) => {
		await page
			.getByRole( 'button', { name: 'Open Taxonomy query builder' } )
			.click();
		await expect(
			page.getByRole( 'dialog', { name: 'Taxonomy Query Builder' } )
		).toBeHidden();
		await expect(
			page.getByRole( 'button', { name: 'Add new query' } )
		).toBeVisible();
	} );
} );
