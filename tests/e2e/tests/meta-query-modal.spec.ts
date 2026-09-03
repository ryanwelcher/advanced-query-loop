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

test.describe( 'Meta query builder layout', () => {
	test.beforeEach( async ( { page, editor, playground, admin } ) => {
		await playground.init( { page, editor } );
		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );
		await insertAQL( { editor, page } );
		await page
			.getByRole( 'button', { name: 'Open Post Meta query builder' } )
			.click();
	} );

	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	const addCondition = async ( page, key: string ) => {
		const dialog = page.getByRole( 'dialog', {
			name: 'Meta Query Builder',
		} );
		await dialog.getByRole( 'button', { name: 'Add new query' } ).click();
		await dialog
			.getByRole( 'combobox', { name: 'Meta Key' } )
			.last()
			.fill( key );
		await page.keyboard.press( 'Enter' );
	};

	test( 'shows compare and type for every keyed condition without a toggle', async ( {
		page,
		editor,
	} ) => {
		const dialog = page.getByRole( 'dialog', {
			name: 'Meta Query Builder',
		} );
		await addCondition( page, 'price' );

		await expect(
			dialog.getByRole( 'combobox', { name: 'Meta Compare' } )
		).toBeVisible();
		await expect(
			dialog.getByRole( 'combobox', { name: 'Meta Type' } )
		).toBeVisible();
		await expect(
			dialog.getByRole( 'checkbox', { name: 'Advanced mode' } )
		).toHaveCount( 0 );

		await dialog
			.getByRole( 'combobox', { name: 'Meta Compare' } )
			.selectOption( '>=' );
		await dialog
			.getByRole( 'combobox', { name: 'Meta Type' } )
			.selectOption( 'NUMERIC' );

		const blocks = await editor.getBlocks();
		const condition = blocks[ 0 ].attributes.query.meta_query.queries[ 0 ];
		expect( condition.meta_compare ).toEqual( '>=' );
		expect( condition.meta_type ).toEqual( 'NUMERIC' );
	} );

	test( 'summarises the conditions in the sidebar when closed', async ( {
		page,
	} ) => {
		const dialog = page.getByRole( 'dialog', {
			name: 'Meta Query Builder',
		} );
		await addCondition( page, 'price' );
		await dialog.getByRole( 'button', { name: 'Close' } ).click();
		await expect(
			page.getByText( '1 condition', { exact: true } )
		).toBeVisible();

		await page
			.getByRole( 'button', { name: 'Open Post Meta query builder' } )
			.click();
		await addCondition( page, 'color' );
		await dialog.getByRole( 'radio', { name: 'Any condition' } ).click();
		await dialog.getByRole( 'button', { name: 'Close' } ).click();
		await expect(
			page.getByText( '2 conditions, match any', { exact: true } )
		).toBeVisible();
	} );

	test( 'keeps the footer reachable with many conditions', async ( {
		page,
	} ) => {
		const dialog = page.getByRole( 'dialog', {
			name: 'Meta Query Builder',
		} );
		for ( let i = 0; i < 10; i++ ) {
			await addCondition( page, `key_${ i }` );
		}
		await expect(
			dialog.getByRole( 'combobox', { name: 'Meta Key' } )
		).toHaveCount( 10 );
		await expect(
			dialog.getByRole( 'button', { name: 'Add new query' } )
		).toBeInViewport();
		await expect(
			dialog.getByRole( 'button', { name: 'Reset queries' } )
		).toBeInViewport();
	} );
} );

test.describe( 'Placeholder reference', () => {
	test.beforeEach( async ( { page, editor, playground, admin } ) => {
		await playground.init( { page, editor } );
		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );
		await insertAQL( { editor, page } );
		await page
			.getByRole( 'button', { name: 'Open Post Meta query builder' } )
			.click();
		await page.getByRole( 'button', { name: 'Add new query' } ).click();
		await page
			.getByRole( 'combobox', { name: 'Meta Key' } )
			.fill( 'related_post' );
		await page.keyboard.press( 'Enter' );
	} );

	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	test( 'lists placeholders with descriptions and filters them', async ( {
		page,
	} ) => {
		const reference = page.getByRole( 'complementary', {
			name: 'Dynamic placeholders',
		} );
		await expect( reference ).toBeVisible();
		await expect(
			reference.getByRole( 'button', { name: /Current Post ID/ } )
		).toBeVisible();
		await expect(
			reference.getByText( 'The ID of the post being viewed.' )
		).toBeVisible();

		await reference
			.getByRole( 'searchbox', { name: 'Filter placeholders' } )
			.fill( 'month' );
		await expect(
			reference.getByRole( 'button', { name: /3 Months Ago/ } )
		).toBeVisible();
		await expect(
			reference.getByRole( 'button', { name: /Current Post ID/ } )
		).toBeHidden();
	} );

	test( 'inserts a token into the focused value field', async ( {
		page,
		editor,
	} ) => {
		await page.getByRole( 'combobox', { name: 'Meta Value' } ).click();
		await page
			.getByRole( 'complementary', { name: 'Dynamic placeholders' } )
			.getByRole( 'button', { name: /Current Post ID/ } )
			.click();

		const blocks = await editor.getBlocks();
		expect(
			blocks[ 0 ].attributes.query.meta_query.queries[ 0 ].meta_value
		).toEqual( '{aql:current_post_id}' );
	} );

	test( 'explains itself when no value field has been focused', async ( {
		page,
		editor,
	} ) => {
		await page
			.getByRole( 'complementary', { name: 'Dynamic placeholders' } )
			.getByRole( 'button', { name: /Current Post ID/ } )
			.click();

		await expect(
			page.getByText( 'Select a Meta Value field first' )
		).toBeVisible();
		const blocks = await editor.getBlocks();
		expect(
			blocks[ 0 ].attributes.query.meta_query.queries[ 0 ].meta_value
		).toEqual( '' );
	} );
} );

test.describe( 'Type guidance', () => {
	test.beforeEach( async ( { page, editor, playground, admin } ) => {
		await playground.init( { page, editor } );
		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );
		await insertAQL( { editor, page } );
		await page
			.getByRole( 'button', { name: 'Open Post Meta query builder' } )
			.click();
		await page.getByRole( 'button', { name: 'Add new query' } ).click();
		await page
			.getByRole( 'combobox', { name: 'Meta Key' } )
			.fill( 'price' );
		await page.keyboard.press( 'Enter' );
	} );

	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	test( 'hides text operators for numeric types', async ( { page } ) => {
		const dialog = page.getByRole( 'dialog', {
			name: 'Meta Query Builder',
		} );
		const compare = dialog.getByRole( 'combobox', {
			name: 'Meta Compare',
		} );
		await expect( compare.locator( 'option[value="LIKE"]' ) ).toHaveCount(
			1
		);
		await dialog
			.getByRole( 'combobox', { name: 'Meta Type' } )
			.selectOption( 'NUMERIC' );
		await expect( compare.locator( 'option[value="LIKE"]' ) ).toHaveCount(
			0
		);
		await expect( compare.locator( 'option[value=">="]' ) ).toHaveCount(
			1
		);
	} );

	test( 'keeps a saved operator the type would otherwise hide', async ( {
		page,
	} ) => {
		await page.evaluate( () => {
			const { dispatch, select } = ( window as any ).wp.data;
			const block = select( 'core/block-editor' )
				.getBlocks()
				.find( ( b ) => b.name === 'core/query' );
			dispatch( 'core/block-editor' ).updateBlockAttributes(
				block.clientId,
				{
					query: {
						...block.attributes.query,
						meta_query: {
							relation: 'AND',
							queries: [
								{
									id: 'legacy',
									meta_key: 'price',
									meta_value: '10',
									meta_compare: 'LIKE',
									meta_type: 'NUMERIC',
								},
							],
						},
					},
				}
			);
		} );

		const dialog = page.getByRole( 'dialog', {
			name: 'Meta Query Builder',
		} );
		await expect(
			dialog.getByRole( 'combobox', { name: 'Meta Compare' } )
		).toHaveValue( 'LIKE' );
		await expect(
			dialog.getByRole( 'combobox', { name: 'Meta Type' } )
		).toHaveValue( 'NUMERIC' );
	} );

	test( 'EXISTS hides the value field and clears the stored value', async ( {
		page,
		editor,
	} ) => {
		const dialog = page.getByRole( 'dialog', {
			name: 'Meta Query Builder',
		} );
		const value = dialog.getByRole( 'combobox', { name: 'Meta Value' } );
		await value.fill( 'anything' );
		await page.keyboard.press( 'Enter' );

		await dialog
			.getByRole( 'combobox', { name: 'Meta Compare' } )
			.selectOption( 'EXISTS' );
		await expect( value ).toBeHidden();

		const blocks = await editor.getBlocks();
		expect(
			blocks[ 0 ].attributes.query.meta_query.queries[ 0 ].meta_value
		).toEqual( '' );
	} );

	test( 'BETWEEN and IN show value hints', async ( { page } ) => {
		const dialog = page.getByRole( 'dialog', {
			name: 'Meta Query Builder',
		} );
		const compare = dialog.getByRole( 'combobox', {
			name: 'Meta Compare',
		} );
		await compare.selectOption( 'BETWEEN' );
		await expect(
			dialog.getByText( /lower and upper bounds separated by a comma/ )
		).toBeVisible();
		await compare.selectOption( 'IN' );
		await expect(
			dialog.getByText( /Separate multiple values with commas/ )
		).toBeVisible();
	} );

	test( 'DATE type offers a picker that writes YYYY-MM-DD', async ( {
		page,
		editor,
	} ) => {
		const dialog = page.getByRole( 'dialog', {
			name: 'Meta Query Builder',
		} );
		await dialog
			.getByRole( 'combobox', { name: 'Meta Type' } )
			.selectOption( 'DATE' );
		await dialog.getByRole( 'button', { name: 'Pick a date' } ).click();
		await dialog
			.getByRole( 'button', { name: /^[A-Z][a-z]+ 15, \d{4}/ } )
			.click();

		const blocks = await editor.getBlocks();
		const stored =
			blocks[ 0 ].attributes.query.meta_query.queries[ 0 ].meta_value;
		expect( stored ).toMatch( /^\d{4}-\d{2}-15$/ );
		await expect(
			dialog.getByRole( 'combobox', { name: 'Meta Value' } )
		).toBeVisible();
	} );
} );
