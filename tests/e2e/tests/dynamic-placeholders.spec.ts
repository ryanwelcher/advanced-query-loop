/**
 * Import our custom test fixtures.
 */
import { test, expect } from '../aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from '../utils';

test.describe( 'Dynamic placeholders', () => {
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

	test( 'inserts the Current Post ID token from the picker', async ( {
		page,
		editor,
	} ) => {
		// Open the meta query builder and add a query.
		await page
			.getByRole( 'button', { name: 'Open Post Meta query builder' } )
			.click();
		await page.getByRole( 'button', { name: 'Add new query' } ).click();

		// Set a meta key so the Meta Value field appears.
		await page
			.getByRole( 'combobox', { name: 'Meta Key' } )
			.fill( 'related_post' );
		await page.keyboard.press( 'Enter' );

		// Pick "Current Post ID" from the Meta Value suggestions.
		const metaValueField = page.getByRole( 'combobox', {
			name: 'Meta Value',
		} );
		await metaValueField.fill( 'Current Post ID' );
		await page.keyboard.press( 'Enter' );

		const blocks = await editor.getBlocks();
		expect(
			blocks[ 0 ].attributes.query.meta_query.queries[ 0 ].meta_value
		).toEqual( '{aql:current_post_id}' );
	} );

	test( 'placeholder menu lists all built-in placeholders', async ( {
		page,
	} ) => {
		await page
			.getByRole( 'button', { name: 'Open Post Meta query builder' } )
			.click();
		await page.getByRole( 'button', { name: 'Add new query' } ).click();
		await page
			.getByRole( 'combobox', { name: 'Meta Key' } )
			.fill( 'any_key' );
		await page.keyboard.press( 'Enter' );

		await page.getByRole( 'combobox', { name: 'Meta Value' } ).click();

		for ( const label of [
			'Current Post ID',
			'Author ID',
			'Logged-in User ID',
			'Current Date',
			'1 Month Ago',
			'3 Months Ago',
			'6 Months Ago',
			'12 Months Ago',
		] ) {
			await expect(
				page.getByRole( 'option', { name: label, exact: true } )
			).toBeVisible();
		}
	} );

	test( 'stores a hand-typed literal verbatim', async ( {
		page,
		editor,
	} ) => {
		await page
			.getByRole( 'button', { name: 'Open Post Meta query builder' } )
			.click();
		await page.getByRole( 'button', { name: 'Add new query' } ).click();
		await page
			.getByRole( 'combobox', { name: 'Meta Key' } )
			.fill( 'color' );
		await page.keyboard.press( 'Enter' );

		const metaValueField = page.getByRole( 'combobox', {
			name: 'Meta Value',
		} );
		await metaValueField.fill( 'blue' );
		await page.keyboard.press( 'Enter' );

		const blocks = await editor.getBlocks();
		expect(
			blocks[ 0 ].attributes.query.meta_query.queries[ 0 ].meta_value
		).toEqual( 'blue' );
	} );
} );
