import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Posts Per Page', () => {
	test.beforeAll( async ( { requestUtils } ) => {
		for ( let i = 1; i < 11; i++ ) {
			await requestUtils.createPost( {
				title: `Post ${ i }`,
				status: 'publish',
			} );
		}
	} );

	test.beforeEach( async ( { admin, editor } ) => {
		// Create a new post before each test
		await admin.createNewPost();

		// Insert a block
		await editor.insertBlock( {
			name: 'core/query',
			attributes: { namespace: 'advanced-query-loop' },
		} );

		await editor.canvas
			.getByRole( 'document', { name: 'Block: Advanced Query Loop' } )
			.getByRole( 'button', { name: 'Start blank' } )
			.click();

		await editor.canvas
			.getByRole( 'document', { name: 'Block: Advanced Query Loop' } )
			.getByRole( 'list', { name: 'Block variations' } )
			.getByRole( 'button', { name: 'Title & Date' } )
			.click();

		await editor.openDocumentSettingsSidebar();
	} );

	test( 'should display 5 posts', async ( { editor, page } ) => {
		await page
			.getByRole( 'spinbutton', { name: 'Posts Per Page' } )
			.fill( '5' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );

	test( 'should display 1 post', async ( { editor, page } ) => {
		await page
			.getByRole( 'spinbutton', { name: 'Posts Per Page' } )
			.fill( '1' );

		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );
} );
