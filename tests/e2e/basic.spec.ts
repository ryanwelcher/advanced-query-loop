/**
 * Import our custom test fixtures.
 */
import { test, expect } from './aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from './utils';

test.describe( 'Basic Tests', () => {
	test.beforeEach( async ( { page, editor, playground } ) => {
		await playground.init( { page, editor } );
	} );

	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	test( 'AQL was inserted and variation was selected', async ( {
		page,
		editor,
	} ) => {
		await insertAQL( { page, editor } );

		const blocks = await editor.getBlocks();

		await expect( blocks[ 0 ].attributes.namespace ).toEqual(
			'advanced-query-loop'
		);
	} );
} );
