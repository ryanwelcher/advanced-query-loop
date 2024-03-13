import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Advanced Query Loop', () => {
	test.beforeEach( async ( { admin } ) => {
		// Create a new post before each test
		await admin.createNewPost();
	} );

	test( 'should be inserted', async ( { editor } ) => {
		// Insert a block
		await editor.insertBlock( {
			name: 'core/query',
			attributes: { namespace: 'advanced-query-loop' },
		} );

		// Test that post content matches snapshot
		expect( await editor.getEditedPostContent() ).toMatchSnapshot();
	} );
} );
