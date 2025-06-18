import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { runCLI } from '@wp-playground/cli';
import { readFileSync } from 'fs';
import { login } from '@wp-playground/blueprints';

test( 'Admin page', async ( { page } ) => {
	const blueprint = JSON.parse( readFileSync( 'blueprint.json', 'utf8' ) );
	const cli = await runCLI( {
		command: 'server',
		mount: [
			{
				hostPath: '.',
				vfsPath:
					'/wordpress/wp-content/plugins/playground-testing-demo',
			},
		],
		blueprint,
	} );

	const server = cli.server;
	const handler = await cli.requestHandler;
	const php = await handler.getPrimaryPhp();

	const url = new URL(
		'/wp-admin/admin.php?page=workshop-tests',
		handler.absoluteUrl
	);

	await login( php, {
		username: 'admin',
	} );

	await page.goto( url.toString() );

	// Expect a title "to contain" a substring.
	await expect( page ).toHaveTitle( /Workshop Tests/ );

	await server.close();
} );
