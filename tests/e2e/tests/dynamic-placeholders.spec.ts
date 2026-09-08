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

	test( 'suggests all placeholders on focus and filters while typing', async ( {
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

		const metaValueField = page.getByRole( 'combobox', {
			name: 'Meta Value',
		} );

		// Focusing the empty field lists every built-in placeholder.
		await metaValueField.click();
		for ( const label of [
			'Current Post ID',
			'Current Post Parent ID',
			'Author ID',
			'Logged-in User ID',
			'Current Term ID',
			'Current Date',
			'Current Date (Compact)',
			'Current Date and Time',
			'Current Time',
			'Current Timestamp',
			'Current Year',
			'Current Month',
			'Current Day',
			'Current Hour',
			'Current Week',
			'1 Month Ago',
			'3 Months Ago',
			'6 Months Ago',
			'12 Months Ago',
			'1 Month From Now',
			'3 Months From Now',
			'6 Months From Now',
			'12 Months From Now',
		] ) {
			await expect(
				page.getByRole( 'option', { name: label, exact: true } )
			).toBeVisible();
		}

		// Typing filters the list.
		await metaValueField.fill( 'Month' );
		await expect(
			page.getByRole( 'option', { name: '3 Months Ago', exact: true } )
		).toBeVisible();
		await expect(
			page.getByRole( 'option', { name: 'Author ID', exact: true } )
		).toBeHidden();

		// An input matching nothing shows no empty-state prompt.
		await metaValueField.fill( 'zzz' );
		await expect( page.getByText( 'No items found' ) ).toBeHidden();
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
