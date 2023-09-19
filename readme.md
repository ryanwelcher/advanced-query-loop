# Advanced Query Loop

## Description

This plugin introduces a Query Loop block variation that will empower users to be able to do much more complicated queries with the Query Loop block, such number of posts to display and post meta

### Support/Issues

Please use the either the [support](https://wordpress.org/support/plugin/advanced-query-loop/) forum or the [official repository](https://github.com/ryanwelcher/advanced-query-loop) for any questions or to log issues.

### Available Controls

#### Multiple post types

Select additional post types for your query!

#### Post Count

Set the number of items you want to display (up to 50).

#### Offset

Choose whether you want to start at the first or 100th!

#### Post Meta Query

Generate complicated post meta queries using an interface that allows you to create a query based on `meta_key`, `meta_value` and the `compare` options. Combine multiple queries and determine if they combine results (OR) or narrow them down (AND).

#### Date Query

Query item before a date, after a date or between two dates!

#### Post Order controls

Sort in ascending or descending order by:

-   Author
-   Date
-   Last Modified Date
-   Title
-   Meta Value
-   Meta Value Num
-   Random
-   Menu Order ( props to @jvanja )

**Please note that this is a slight duplication of the existing sorting controls. They both work interchangeably but it just looks a bit odd in the UI**

### Extending AQL

Since version 1.5, AQL is now completely extendable. Using the SlotFills and filter outlined below, you can add any custom control you may need!

#### SlotFills

There are two SlotFills available to extend the UI of AQL that are exposed based the value of the `Inherit query from template` setting of the block.

-   AQLControls
-   AQLControlsInheritedQuery

These SlotFills are available on the `window.aql` object for import.

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

```php
/**
 * Add a filter to update the query args passed to WP_Query
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
