// Import the original config from the @wordpress/scripts package.
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

// Add any a new entry point by extending the webpack config.
module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry(),
		variations: './src/variations/index.js',
		'legacy-pre-gb-19': './src/legacy-controls/pre-gb-19.js',
	},
	output: {
		...defaultConfig.output,
		library: [ 'aql' ],
	},
	devServer: {
		...defaultConfig.devServer,
		allowedHosts: 'all', // Allow Fast Refresh access from any host. This is useful for testing in different environments.
	},
};
