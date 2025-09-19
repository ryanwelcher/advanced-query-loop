// eslint-disable-next-line import/no-extraneous-dependencies
import { PHPRequestHandler, PHP } from '@php-wasm/universal';
// eslint-disable-next-line import/no-extraneous-dependencies
import { runCLI } from '@wp-playground/cli';
// eslint-disable-next-line import/no-extraneous-dependencies
import { login } from '@wp-playground/blueprints';
import { readFileSync } from 'fs';
import { Page } from '@playwright/test';
import { Editor } from '@wordpress/e2e-test-utils-playwright';

export class Playground {
	private cliServer;
	private php: PHP;
	private handler: PHPRequestHandler;
	private blueprint: string;

	constructor( blueprint: string ) {
		this.blueprint = blueprint;
	}

	async init( { page, editor }: { editor: Editor; page: Page } ) {
		const blueprint = JSON.parse( readFileSync( this.blueprint, 'utf8' ) );
		this.cliServer = await runCLI( {
			command: 'server',
			mount: [
				{
					hostPath: '.',
					vfsPath:
						'/wordpress/wp-content/plugins/advanced-query-loop',
				},
			],
			blueprint,
			port: 8889,
			quiet: true,
		} );
		this.handler = this.cliServer.requestHandler;
		this.php = await this.handler.getPrimaryPhp();

		// Login to the admin page.
		await login( this.php, {
			username: 'admin',
		} );

		return this.handler;
	}

	async cleanUp() {
		if ( this.cliServer ) {
			await this.cliServer.server.close();
		}
	}
}
