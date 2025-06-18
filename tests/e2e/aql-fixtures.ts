// eslint-disable-next-line import/no-extraneous-dependencies
import { test as baseTest } from '@playwright/test';
import { Editor } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies.
 */
import { Playground } from './Playground';

export const test = baseTest.extend< { playground: Playground } >( {
	playground: async ( { page, editor }, use ) => {
		const playground = new Playground( '_blueprints/e2e-blueprint.json' );
		await use( playground );
	},
	editor: async ( { page }, use ) => {
		await use( new Editor( { page } ) );
	},
} );

// eslint-disable-next-line import/no-extraneous-dependencies
export { expect } from '@playwright/test';
