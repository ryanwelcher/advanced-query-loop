# Advanced Query Loop

![](https://github.com/ryanwelcher/advanced-query-loop/actions/workflows/phpunit.yml/badge.svg?branch=trunk)
![](https://github.com/ryanwelcher/advanced-query-loop/actions/workflows/static-linting.yml/badge.svg?branch=trunk)
![](https://github.com/ryanwelcher/advanced-query-loop/actions/workflows/e2e.yml/badge.svg?branch=trunk)

## Description

This plugin introduces a Query Loop block variation that will empower users to be able to do much more complicated queries with the Query Loop block, such as taxonomy queries, post meta queries, date queries, post ordering, and more

### Support/Issues

Please use the either the [support](https://wordpress.org/support/plugin/advanced-query-loop/) forum or the [official repository](https://github.com/ryanwelcher/advanced-query-loop) for any questions or to log issues.

### Available Controls

#### Taxonomy queries

Built complicated taxonomy queries!

#### Multiple post types

Select additional post types for your query!

#### Include Posts

Choose the posts you want to display manually or only the children of the current content.

#### Exclude current post

Remove the current post from the query.

#### Exclude posts list

Curate a list of posts to exclude from the query.

#### Post Meta Query

Generate complicated post meta queries using an interface that allows you to create a query based on `meta_key`, `meta_value` and the `compare` options. Combine multiple queries and determine if they combine results (OR) or narrow them down (AND).

#### Date Query

Query items before/after the current or selected or choose to show the post from the last 1, 3, 6 and 12 months.

#### Post Order controls

Sort in ascending or descending order by:

-   Author
-   Comment Count
-   Date
-   Included Posts
-   Last Modified Date
-   Menu Order (props to @jvanja)
-   Meta Value
-   Meta Value Num
-   Name (props @philbee)
-   Post ID (props to @markhowellsmead)
-   Random
-   Title

#### Disable Pagination

Improve the performance of the query by disabling pagination.

#### Enable Caching

Store query results in a transient for one hour to reduce database load on subsequent page loads. The caching toggle is unavailable when the order is set to Random, and switching to Random order will clear any existing caching setting. Found in the **AQL: Performance Controls** panel.

## Filtering the available controls

It is possible to remove controls from AQL using the `aql_allowed_controls` filter. The filter receives a single parameter containing an array of allowed controls. This can be modified to remove the control from the UI and stop processing the associated query param.

```php
add_filter(
	'aql_allowed_controls',
	function( $controls ) {
		// Exclude the additional_post_types and taxonomy_query_builder controls.
		$to_exclude        = array( 'additional_post_types', 'taxonomy_query_builder' );
		$filtered_controls = array_filter(
			$controls,
			function( $control ) use ( $to_exclude ) {
				if ( ! in_array( $control, $to_exclude, true ) ) {
					return $control;
				}
			},
		);
		return $filtered_controls;
	}
);
```

### List of control identifiers

-   `'additional_post_types'`
-   `'taxonomy_query_builder'`
-   `'post_meta_query'`
-   `'post_order'`
-   `'exclude_current_post'`
-   `'exclude_posts'`
-   `'include_posts'`
-   `'child_items_only'`
-   `'date_query_dynamic_range'`
-   `'date_query_relationship'`
-   `'pagination'`
-   `'enable_caching'`

## Extending AQL

Detailed instructions on how to extend AQL as well as an example are available [here](./extending-aql.md)
