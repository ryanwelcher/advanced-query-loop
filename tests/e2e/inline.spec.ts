/**
 * Import our custom test fixtures.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { test, expect } from '@playwright/test';
// eslint-disable-next-line import/no-extraneous-dependencies
import { PHPRequestHandler, PHP } from '@php-wasm/universal';
// eslint-disable-next-line import/no-extraneous-dependencies
import { runCLI } from '@wp-playground/cli';
// eslint-disable-next-line import/no-extraneous-dependencies
import { login } from '@wp-playground/blueprints';
import { readFileSync } from 'fs';
import { Editor } from '@wordpress/e2e-test-utils-playwright';
/**
 * Internal dependencies.
 */
import { insertAQL } from './utils';

test.describe( 'Basic Tests - Inline', () => {
	let cliServer: any;
	let handler: PHPRequestHandler;
	let php: PHP;

	test.use( {
		editor: async ( { page }, use ) => {
			await use( new Editor( { page } ) );
		},
	} );

	test.beforeEach( async ( { page, editor } ) => {
		const blueprint = JSON.parse(
			readFileSync( '_blueprints/e2e-blueprint.json', 'utf8' )
		);
		cliServer = await runCLI( {
			command: 'server',
			mount: [
				{
					hostPath: '.',
					vfsPath:
						'/wordpress/wp-content/plugins/advanced-query-loop',
				},
			],
			blueprint,
			quiet: true,
		} );
		handler = cliServer.requestHandler;
		php = await handler.getPrimaryPhp();
		// Login to the admin page.
		await login( php, {
			username: 'admin',
		} );
	} );

	test.afterEach( async () => {
		if ( cliServer ) {
			await cliServer.server.close();
		}
	} );

	test( 'AQL was inserted and variation was selected', async ( {
		page,
		editor,
	} ) => {
		// Create a new post.
		const url = new URL( '/wp-admin/post-new.php', handler.absoluteUrl );

		await page.goto( url.toString() );
		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );

		await insertAQL( { page, editor } );

		const blocks = await editor.getBlocks();

		await expect( blocks[ 0 ].attributes.namespace ).toEqual(
			'advanced-query-loop'
		);
	} );
} );
