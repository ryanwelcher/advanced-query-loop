## Extending AQL

Since version 1.5, AQL is now completely extendable. Using the SlotFills and filter outlined below, you can add any custom control you may need! The code below can be seen in my [advanced-query-loop-extension plugin here](https://github.com/ryanwelcher/advanced-query-loop-extension)

#### SlotFills

There are two SlotFills available to extend the UI of AQL that are exposed based the value of the `Inherit query from template` setting of the block.

The purpose of having two options is to be able to customize when a UI element is added. There may be cases that a particular control doesn't make sense to be shown when the query is being inherited.
For example, a control that makes changes to the content types being displayed may not make sense when used in an archive template and so that control would only be added using the `<AQLControls` SlotFill so that it doesn't appear when `Inherit query from template` is enabled.

-   AQLControls
-   AQLControlsInheritedQuery

Both SlotFills are passed all `props` from the main block and are available on the `window.aql` object for use.

The example below adds a new control to only show content from the from currently logged in user regardless of the status of `Inherit query from template`.

```js
const { AQLControls, AQLControlsInheritedQuery } = window.aql;
import { registerPlugin } from '@wordpress/plugins';
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const LoggedInUserControl = ( { attributes, setAttributes } ) => {
	const { query: { authorContent = false } = {} } = attributes;
	return (
		<>
			<ToggleControl
				label={ __( 'Show content for logged in user only' ) }
				checked={ authorContent === true }
				onChange={ () => {
					setAttributes( {
						query: {
							...attributes.query,
							authorContent: ! authorContent,
						},
					} );
				} }
			/>
		</>
	);
};

registerPlugin( 'aql-extension', {
	render: () => {
		return (
			<>
				<AQLControls>
					{ ( props ) => <LoggedInUserControl { ...props } /> }
				</AQLControls>
				<AQLControlsInheritedQuery>
					{ ( props ) => <LoggedInUserControl { ...props } /> }
				</AQLControlsInheritedQuery>
			</>
		);
	},
} );
```

#### Filters

Once the control is in place and saving, you will need to use that new query variable to modify the underlying `WP_Query` instance via the `aql_query_vars` filter.

The filter provides three parameters:

-   `$query_args` Arguments to be passed to WP_Query.
-   `$block_query` The query attribute retrieved from the block.
-   `$inherited` Whether the query is being inherited.

The example code below modifies the query based on the status of the control added above.

```php
/**
 * Add a filter to only show logged-in user content.
 *
 * @param array   $query_args  Arguments to be passed to WP_Query.
 * @param array   $block_query The query attribute retrieved from the block.
 * @param boolean $inherited   Whether the query is being inherited.
 */
function aql_extension_show_current_author_only( $query_args, $block_query, $inherited ) {
	if (
		isset( $block_query['authorContent'] ) &&
		true === filter_var( $block_query['authorContent'], FILTER_VALIDATE_BOOLEAN )
	) {
		$query_args['author'] = get_current_user_id();
	}
	return $query_args;
}

\add_filter( 'aql_query_vars', 'aql_extension_show_current_author_only', 10, 3 );
```

### Tutorial

Using he example code above, you can make a custom extension plugin for AQL that will filter the displayed posts by author.

#### Step 1

Start by using the `@wordpress/create-block` package to scaffold all of the files we need. We will be removing all of the block-related ones but this tool can quickly get us set up and ready to go.

The the following in the command line tool of your choice inside the wp-content folder of a local WordPress installation.

```bash
npx @wordpress/create-block custom-aql-extension

```

#### Step 2

Once the scaffold has been completed, delete all of the files in `custom-aql-extension/src` we don't need them.

#### Step 3

Create a new files called`webpack.config.js` in the root of the directory with with the following contents:

```js
// Import the original config from the @wordpress/scripts package.
const defaultConfig = require("@wordpress/scripts/config/webpack.config");

// Add any a new entry point by extending the webpack config.
module.exports = {
	...defaultConfig,
	entry: {
		`aql-extension`: './src/index.js
	},
};
```

#### Step 4

Create an `index.js` file inside of the `./src` directory with the following contents:

```js
const { AQLControls, AQLControlsInheritedQuery } = window.aql;
import { registerPlugin } from '@wordpress/plugins';
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const LoggedInUserControl = ( { attributes, setAttributes } ) => {
	const { query: { authorContent = false } = {} } = attributes;
	return (
		<>
			<ToggleControl
				label={ __( 'Show content for logged in user only' ) }
				checked={ authorContent === true }
				onChange={ () => {
					setAttributes( {
						query: {
							...attributes.query,
							authorContent: ! authorContent,
						},
					} );
				} }
			/>
		</>
	);
};

registerPlugin( 'aql-extension', {
	render: () => {
		return (
			<>
				<AQLControls>
					{ ( props ) => <LoggedInUserControl { ...props } /> }
				</AQLControls>
				<AQLControlsInheritedQuery>
					{ ( props ) => <LoggedInUserControl { ...props } /> }
				</AQLControlsInheritedQuery>
			</>
		);
	},
} );
```

#### Step 5

Next open the scaffolded `index.php` file in the root directory and remove the existing code ( be sure to leave the header comments) and add the following to enqueue the JavaScript file.

```php
\add_action(
	'enqueue_block_editor_assets',
	function () {
		$extension_assets_file = plugin_dir_path( __FILE__ ) . 'build/aql-extension.asset.php';

		if ( file_exists( $extension_assets_file ) ) {
			$assets = include $extension_assets_file;
			\wp_enqueue_script(
				'aql-extension',
				plugin_dir_url( __FILE__ ). 'build/aql-extension.js',
				$assets['dependencies'],
				$assets['version'],
				true
			);
		}
	}
);
```

Next, add the following hooks to filter AQL

```php
/**
 * Add a filter to only show logged-in user content.
 *
 * @param array   $query_args  Arguments to be passed to WP_Query.
 * @param array   $block_query The query attribute retrieved from the block.
 * @param boolean $inherited   Whether the query is being inherited.
 */
function aql_extension_show_current_author_only( $query_args, $block_query, $inherited ) {
	if (
		isset( $block_query['authorContent'] ) &&
		true === filter_var( $block_query['authorContent'], FILTER_VALIDATE_BOOLEAN )
	) {
		$query_args['author'] = get_current_user_id();
	}
	return $query_args;
}

\add_filter( 'aql_query_vars', 'aql_extension_show_current_author_only', 10, 3 );
```

#### Step 6

Now that all the code is in place, back in your terminal run the one of the following commands:

-   `npm run start` - starts development mode for the plugin that will rebuild when things change
-   `npm run build` - creates a production build of the plugin

Before you can use the plugin you need to run of the two

#### Step 7

Enable the plugin in your local WordPress environment
