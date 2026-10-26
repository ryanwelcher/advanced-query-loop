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

	/**
	 * Open the meta query builder, add a query, and set its meta key so the
	 * Meta Value field appears.
	 *
	 * @param page    The Playwright page.
	 * @param metaKey The meta key to set.
	 */
	const addMetaQuery = async ( page, metaKey ) => {
		await page
			.getByRole( 'button', { name: 'Open Post Meta query builder' } )
			.click();
		await page.getByRole( 'button', { name: 'Add new query' } ).click();
		await page
			.getByRole( 'combobox', { name: 'Meta Key' } )
			.fill( metaKey );
		await page.keyboard.press( 'Enter' );
	};

	const getMetaValue = async ( editor ) => {
		const blocks = await editor.getBlocks();
		return blocks[ 0 ].attributes.query.meta_query.queries[ 0 ].meta_value;
	};

	test( 'inserts the Current Post ID token from the menu', async ( {
		page,
		editor,
	} ) => {
		await addMetaQuery( page, 'related_post' );

		await page
			.getByRole( 'button', { name: 'Insert dynamic value' } )
			.click();
		await page
			.getByRole( 'menuitem', { name: /^Current Post ID/ } )
			.click();

		expect( await getMetaValue( editor ) ).toEqual(
			'{aql:current_post_id}'
		);
		await expect(
			page.getByRole( 'textbox', { name: 'Meta Value' } )
		).toHaveValue( '{aql:current_post_id}' );
	} );

	test( 'lists every built-in placeholder in the menu', async ( {
		page,
	} ) => {
		await addMetaQuery( page, 'any_key' );

		await page
			.getByRole( 'button', { name: 'Insert dynamic value' } )
			.click();
		// Labels only; each menu item also shows its description.
		await expect(
			page.locator( '[role="menuitem"] .components-menu-item__item' )
		).toHaveText( [
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
		] );
	} );

	test( 'stores a typed value with commas verbatim', async ( {
		page,
		editor,
	} ) => {
		await addMetaQuery( page, 'color' );

		await page
			.getByRole( 'textbox', { name: 'Meta Value' } )
			.fill( 'red,blue' );

		expect( await getMetaValue( editor ) ).toEqual( 'red,blue' );
	} );

	test( 'appends a placeholder to a typed value', async ( {
		page,
		editor,
	} ) => {
		await addMetaQuery( page, 'related_posts' );

		await page.getByRole( 'textbox', { name: 'Meta Value' } ).fill( '12,' );
		await page
			.getByRole( 'button', { name: 'Insert dynamic value' } )
			.click();
		await page
			.getByRole( 'menuitem', { name: /^Current Post ID/ } )
			.click();

		expect( await getMetaValue( editor ) ).toEqual(
			'12,{aql:current_post_id}'
		);
	} );
} );
