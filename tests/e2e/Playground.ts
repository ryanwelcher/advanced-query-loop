// eslint-disable-next-line import/no-extraneous-dependencies
import { PHPRequestHandler, PHP } from '@php-wasm/universal';
// eslint-disable-next-line import/no-extraneous-dependencies
import { runCLI } from '@wp-playground/cli';
// eslint-disable-next-line import/no-extraneous-dependencies
import { login } from '@wp-playground/blueprints';
import { readFileSync } from 'fs';

export class Playground {
	private cliServer: any;
	private php: PHP;
	private handler: PHPRequestHandler;
	private blueprint: string;

	constructor( blueprint ) {
		this.blueprint = blueprint;
	}

	async init( { page, editor } ) {
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
			quiet: true,
		} );
		this.handler = this.cliServer.requestHandler;
		this.php = await this.handler.getPrimaryPhp();
		// Login to the admin page.
		await login( this.php, {
			username: 'admin',
		} );
		// Create a new post.
		const url = new URL(
			'/wp-admin/post-new.php',
			this.handler.absoluteUrl
		);

		await page.goto( url.toString() );
		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );
	}

	async cleanUp() {
		if ( this.cliServer ) {
			await this.cliServer.server.close();
		}
	}
}
