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

	test( 'reveals compare and type behind Advanced mode', async ( {
		page,
		editor,
	} ) => {
		const dialog = page.getByRole( 'dialog', {
			name: 'Meta Query Builder',
		} );
		await addCondition( page, 'price' );

		const compare = dialog.getByRole( 'combobox', {
			name: 'Meta Compare',
		} );
		const type = dialog.getByRole( 'combobox', { name: 'Meta Type' } );
		await expect( compare ).toBeHidden();
		await expect( type ).toBeHidden();

		const toggle = dialog.getByRole( 'checkbox', {
			name: 'Advanced mode',
		} );
		await toggle.check();
		await expect( compare ).toBeVisible();
		await expect( type ).toBeVisible();

		await compare.selectOption( '>=' );
		await type.selectOption( 'NUMERIC' );

		// Non-default values keep the controls visible and lock the toggle.
		await expect( toggle ).toBeChecked();
		await expect( toggle ).toBeDisabled();

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
		// Ten round-trips through the token field add up on a slow runner.
		test.slow();
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
	} );

	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	test( 'is hidden until the info button is pressed', async ( { page } ) => {
		const toggle = page.getByRole( 'button', {
			name: 'About dynamic placeholders',
		} );
		await expect( toggle ).toBeVisible();
		await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
		await expect(
			page.getByRole( 'region', { name: 'Dynamic placeholders' } )
		).toHaveCount( 0 );

		await toggle.click();

		const panel = page.getByRole( 'region', {
			name: 'Dynamic placeholders',
		} );
		await expect( panel ).toBeVisible();
		await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );

		// Groups start collapsed.
		const contentGroup = panel.getByRole( 'button', {
			name: 'Content & users (5)',
		} );
		await expect( contentGroup ).toHaveAttribute(
			'aria-expanded',
			'false'
		);
		await expect( panel.getByText( 'Current Post ID' ) ).toBeHidden();
		await expect(
			panel.getByRole( 'button', { name: 'Current date & time (10)' } )
		).toBeVisible();
		await expect(
			panel.getByRole( 'button', { name: 'Relative dates (8)' } )
		).toBeVisible();

		await contentGroup.click();
		await expect( panel.getByText( 'Current Post ID' ) ).toBeVisible();
		await expect( panel.getByText( '{aql:' ) ).toHaveCount( 0 );
		await expect(
			panel.getByText( 'The ID of the post being viewed.' )
		).toBeVisible();

		// Only one section is open at a time.
		await panel
			.getByRole( 'button', { name: 'Relative dates (8)' } )
			.click();
		await expect( panel.getByText( '3 Months Ago' ) ).toBeVisible();
		await expect( panel.getByText( 'Current Post ID' ) ).toBeHidden();
		await expect( contentGroup ).toHaveAttribute(
			'aria-expanded',
			'false'
		);
		await expect( panel.getByRole( 'searchbox' ) ).toHaveCount( 0 );
	} );

	test( 'floats over the builder instead of pushing it down', async ( {
		page,
	} ) => {
		await page.getByRole( 'button', { name: 'Add new query' } ).click();
		const card = page.getByRole( 'combobox', { name: 'Meta Key' } );
		const before = await card.boundingBox();

		await page
			.getByRole( 'button', { name: 'About dynamic placeholders' } )
			.click();
		await expect(
			page.getByRole( 'region', { name: 'Dynamic placeholders' } )
		).toBeVisible();

		const after = await card.boundingBox();
		expect( after?.y ).toEqual( before?.y );
	} );

	test( 'closes from the toggle and from the panel', async ( { page } ) => {
		const toggle = page.getByRole( 'button', {
			name: 'About dynamic placeholders',
		} );
		const panel = page.getByRole( 'region', {
			name: 'Dynamic placeholders',
		} );

		await toggle.click();
		await expect( panel ).toBeVisible();
		await toggle.click();
		await expect( panel ).toHaveCount( 0 );

		await toggle.click();
		await panel
			.getByRole( 'button', { name: 'Hide placeholders' } )
			.click();
		await expect( panel ).toHaveCount( 0 );
	} );

	test( 'entries are reference only and do not write a value', async ( {
		page,
		editor,
	} ) => {
		await page.getByRole( 'button', { name: 'Add new query' } ).click();
		await page
			.getByRole( 'combobox', { name: 'Meta Key' } )
			.fill( 'related_post' );
		await page.keyboard.press( 'Enter' );

		await page
			.getByRole( 'button', { name: 'About dynamic placeholders' } )
			.click();
		const panel = page.getByRole( 'region', {
			name: 'Dynamic placeholders',
		} );
		await panel
			.getByRole( 'button', { name: 'Content & users (5)' } )
			.click();
		await panel.getByText( 'Current Post ID' ).click();

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
		await page.getByRole( 'checkbox', { name: 'Advanced mode' } ).check();
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
		const toggle = dialog.getByRole( 'checkbox', {
			name: 'Advanced mode',
		} );
		await expect( toggle ).toBeChecked();
		await expect( toggle ).toBeDisabled();
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

test.describe( 'Nested condition groups', () => {
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

	const fillLastKey = async ( scope, page, key: string ) => {
		await scope
			.getByRole( 'combobox', { name: 'Meta Key' } )
			.last()
			.fill( key );
		await page.keyboard.press( 'Enter' );
	};

	const fillLastValue = async ( scope, page, value: string ) => {
		await scope
			.getByRole( 'combobox', { name: 'Meta Value' } )
			.last()
			.fill( value );
		await page.keyboard.press( 'Enter' );
	};

	test( 'builds (A and B) or C and stores a nested group', async ( {
		page,
		editor,
	} ) => {
		const dialog = page.getByRole( 'dialog', {
			name: 'Meta Query Builder',
		} );
		const group = dialog.getByRole( 'group', { name: 'Condition group' } );

		// C at the top level.
		await dialog.getByRole( 'button', { name: 'Add new query' } ).click();
		await fillLastKey( dialog, page, 'c' );

		// A group with A and B.
		await dialog.getByRole( 'button', { name: 'Add group' } ).click();
		await expect( group ).toBeVisible();
		await fillLastKey( group, page, 'a' );
		await group.getByRole( 'button', { name: 'Add condition' } ).click();
		await fillLastKey( group, page, 'b' );

		// Groups do not offer nested groups.
		await expect(
			group.getByRole( 'button', { name: 'Add group' } )
		).toHaveCount( 0 );

		// Top level matches any; the group keeps its default of all.
		await dialog
			.getByRole( 'radio', { name: 'Any condition' } )
			.first()
			.click();

		const blocks = await editor.getBlocks();
		const metaQuery = blocks[ 0 ].attributes.query.meta_query;
		expect( metaQuery.relation ).toEqual( 'OR' );
		expect( metaQuery.queries ).toHaveLength( 2 );
		expect( metaQuery.queries[ 0 ].meta_key ).toEqual( 'c' );
		expect( metaQuery.queries[ 1 ].relation ).toEqual( 'AND' );
		expect(
			metaQuery.queries[ 1 ].queries.map( ( q ) => q.meta_key )
		).toEqual( [ 'a', 'b' ] );

		await dialog.getByRole( 'button', { name: 'Close' } ).click();
		await expect(
			page.getByText( '3 conditions, match any', { exact: true } )
		).toBeVisible();
	} );

	test( 'removing a group drops its conditions', async ( {
		page,
		editor,
	} ) => {
		const dialog = page.getByRole( 'dialog', {
			name: 'Meta Query Builder',
		} );
		const group = dialog.getByRole( 'group', { name: 'Condition group' } );
		await dialog.getByRole( 'button', { name: 'Add group' } ).click();
		await fillLastKey( group, page, 'a' );
		await group.getByRole( 'button', { name: 'Remove group' } ).click();
		await expect( group ).toHaveCount( 0 );

		const blocks = await editor.getBlocks();
		expect( blocks[ 0 ].attributes.query.meta_query.queries ).toEqual( [] );
	} );

	test( 'a nested query returns the same posts in the editor and on the frontend', async ( {
		page,
		editor,
	} ) => {
		const dialog = page.getByRole( 'dialog', {
			name: 'Meta Query Builder',
		} );
		const group = dialog.getByRole( 'group', { name: 'Condition group' } );

		// ( _test_featured = yes AND _test_noise EXISTS ) OR no_such_key = x
		await dialog.getByRole( 'button', { name: 'Add group' } ).click();
		await fillLastKey( group, page, '_test_featured' );
		await fillLastValue( group, page, 'yes' );
		await group.getByRole( 'button', { name: 'Add condition' } ).click();
		await fillLastKey( group, page, '_test_noise' );
		await group
			.getByRole( 'checkbox', { name: 'Advanced mode' } )
			.last()
			.check();
		await group
			.getByRole( 'combobox', { name: 'Meta Compare' } )
			.last()
			.selectOption( 'EXISTS' );

		await dialog.getByRole( 'button', { name: 'Add new query' } ).click();
		await fillLastKey( dialog, page, 'no_such_key' );
		await fillLastValue( dialog, page, 'x' );

		await dialog
			.getByRole( 'radio', { name: 'Any condition' } )
			.first()
			.click();
		await dialog.getByRole( 'button', { name: 'Close' } ).click();

		await page
			.getByRole( 'spinbutton', { name: 'Items per page' } )
			.fill( '10' );

		// The canvas also holds the page's own title block and renders the
		// active post twice, so compare the set of post IDs instead.
		const idsFrom = ( titles: string[] ) =>
			[
				...new Set(
					titles
						.map( ( title ) => title.match( /ID:\s*(\d+)/ )?.[ 1 ] )
						.filter( Boolean )
				),
			].sort();

		const readEditorIds = async () =>
			idsFrom(
				await editor.canvas
					.locator( '.wp-block-post-title' )
					.allTextContents()
			);
		// Two posts carry _test_featured in the blueprint. Poll until the
		// preview has re-rendered for the new query instead of sleeping.
		await expect
			.poll( async () => ( await readEditorIds() ).length, {
				timeout: 15000,
			} )
			.toBe( 2 );
		const editorIds = await readEditorIds();

		await editor.publishPost();
		const postId = new URL( page.url() ).searchParams.get( 'post' );
		await page.goto( `/?p=${ postId }` );
		const frontendIds = idsFrom(
			await page
				.locator(
					'.wp-block-post-content .wp-block-query .wp-block-post-title'
				)
				.allTextContents()
		);
		expect( frontendIds ).toEqual( editorIds );
	} );
} );
