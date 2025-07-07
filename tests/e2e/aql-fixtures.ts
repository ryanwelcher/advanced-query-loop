// eslint-disable-next-line import/no-extraneous-dependencies
import {
	test as baseTest,
	PlaywrightTestArgs,
	PlaywrightTestOptions,
	PlaywrightWorkerArgs,
	PlaywrightWorkerOptions,
} from '@playwright/test';
import { Editor, Admin, PageUtils } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies.
 */
import { Playground } from './Playground';
import { Selectors } from './Selectors';

interface Fixtures
	extends PlaywrightTestArgs,
		PlaywrightTestOptions,
		PlaywrightWorkerArgs,
		PlaywrightWorkerOptions {
	playground: Playground;
	editor: Editor;
	admin: Admin;
	pageUtils: PageUtils;
	absoluteUrl: any;
	selectors: any;
}

export const test = baseTest.extend< Fixtures >( {
	playground: async ( { page, editor }, use ) => {
		const playground = new Playground( '_blueprints/e2e-blueprint.json' );
		await use( playground );
	},
	absoluteUrl: async ( { page, editor, playground }, use ) => {
		const absoluteUrl = playground.init( { page, editor } ).absoluteUrl;
		await use( {
			baseURL: absoluteUrl,
		} );
	},
	editor: async ( { page }, use ) => {
		await use( new Editor( { page } ) );
	},
	pageUtils: async ( { page, browserName }, use ) => {
		await use( new PageUtils( { page, browserName } ) );
	},
	admin: async ( { page, editor, pageUtils }, use ) => {
		await use( new Admin( { page, editor, pageUtils } ) );
	},
	selectors: async ( { page }, use ) => {
		await use( new Selectors( page ) );
	},
} );

// eslint-disable-next-line import/no-extraneous-dependencies
export { expect } from '@playwright/test';
