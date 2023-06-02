<?php
/**
 * Handles the filters we need to add to the query.
 *
 * @package AdvancedQueryLoop
 */

namespace AdvancedQueryLoop;

/**
 * Adds the custom query attributes to the Query Loop block.
 *
 * @param array $meta_query_data Post meta query data.
 * @return array
 */
function parse_meta_query( $meta_query_data ) {
	$meta_queries = array();
	if ( isset( $meta_query_data ) ) {
		$meta_queries = array(
			'relation' => isset( $meta_query_data['relation'] ) ? $meta_query_data['relation'] : '',
		);

		foreach ( $meta_query_data['queries'] as $query ) {
			$meta_queries[] = array_filter(
				array(
					'key'     => $query['meta_key'],
					'value'   => $query['meta_value'],
					'compare' => $query['meta_compare'],
				)
			);
		}
	}

	return array_filter( $meta_queries );
}




/**
 * Updates the query on the front end based on custom query attributes.
 */
\add_filter(
	'pre_render_block',
	function( $pre_render, $parsed_block ) {
		if ( isset( $parsed_block['attrs']['namespace'] ) && 'advanced-query-loop' === $parsed_block['attrs']['namespace'] ) {

			// Hijack the global query. It's a hack, but it works.
			if ( true === $parsed_block['attrs']['query']['inherit'] ) {
				global $wp_query;
				$query_args = array_merge(
					$wp_query->query_vars,
					array(
						'posts_per_page' => $parsed_block['attrs']['query']['perPage'],
						'order'          => $parsed_block['attrs']['query']['order'],
						'orderby'        => $parsed_block['attrs']['query']['orderBy'],
					)
				);

				$wp_query = new \WP_Query( $query_args );
			} else {
				\add_filter(
					'query_loop_block_query_vars',
					function( $default_query ) use ( $parsed_block ) {
						$custom_query = $parsed_block['attrs']['query'];
						// Generate a new custom query will all potential query vars.
						$custom_args = array();

						// Check for meta queries.
						$custom_args['meta_query'] = parse_meta_query( $custom_query['meta_query'] ); // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query

						// Date queries.
						if ( ! empty( $custom_query['date_query'] ) ) {
							$date_query        = $custom_query['date_query'];
							$date_relationship = $date_query['relation'];
							$date_is_inclusive = $date_query['inclusive'];
							$date_primary      = $date_query['date_primary'];
							$date_secondary    = $date_query['date_secondary'];

							// Date format: 2022-12-27T11:14:21.
							$primary_year    = substr( $date_primary, 0, 4 );
							$primary_month   = substr( $date_primary, 5, 2 );
							$primary_day     = substr( $date_primary, 8, 2 );
							$secondary_year  = substr( $date_secondary, 0, 4 );
							$secondary_month = substr( $date_secondary, 5, 2 );
							$secondary_day   = substr( $date_secondary, 8, 2 );

							if ( 'between' === $date_relationship ) {
								$date_queries = array(
									'after'  => array(
										'year'  => $primary_year,
										'month' => $primary_month,
										'day'   => $primary_day,
									),
										'before' => array(
											'year'  => $secondary_year,
											'month' => $secondary_month,
											'day'   => $secondary_day,
										),
									);
								} else {
									$date_queries = array(
										$date_relationship => array(
											'year'  => $primary_year,
											'month' => $primary_month,
											'day'   => $primary_day,
										),
									);
								}

								$date_queries['inclusive'] = $date_is_inclusive;

								// Add the date queries to the custom query.
								$custom_args['date_query'] = array_filter( $date_queries );

							}

							// Return the merged query.
							return array_merge(
								$default_query,
								$custom_args
							);
						},
						10,
						2
				);
			}
		}

		return $pre_render;

	},
	10,
	2
);

/**
 * Updates the query vars for the Query Loop block in the block editor
 */

// Add a filter to each rest endpoint to add our custom query params.
\add_action(
	'init',
	function() {
		$registered_post_types = \get_post_types( array( 'public' => true ) );
		foreach ( $registered_post_types as $registered_post_type ) {
			\add_filter( 'rest_' . $registered_post_type . '_query', __NAMESPACE__ . '\add_custom_query_params', 10, 2 );

			// We need more sortBy options.
			\add_filter( 'rest_' . $registered_post_type . '_collection_params', __NAMESPACE__ . '\add_more_sort_by', 10, 2 );
		}

	},
	PHP_INT_MAX
);


/**
 * Override the allowed items
 *
 * @see https://developer.wordpress.org/reference/classes/wp_rest_posts_controller/get_collection_params/
 *
 * @param array $query_params The query params.
 * @param array $post_type    The post type.
 *
 * @return array
 */
function add_more_sort_by( $query_params, $post_type ) {
	$query_params['orderby']['enum'][] = 'meta_value';
	$query_params['orderby']['enum'][] = 'meta_value_num';
	$query_params['orderby']['enum'][] = 'rand';
	return $query_params;
}

/**
 * Callback to handle the custom query params. Updates the block editor.
 *
 * @param array           $args    The query args.
 * @param WP_REST_Request $request The request object.
 */
function add_custom_query_params( $args, $request ) {
	// Generate a new custom query will all potential query vars.
	$custom_args = array();
	// Meta related.
	$meta_query                = $request->get_param( 'meta_query' );
	$custom_args['meta_query'] = parse_meta_query( $meta_query ); // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query

	// Date related.
	$date_query = $request->get_param( 'date_query' );

	if ( $date_query ) {
		$date_relationship = $date_query['relation'];
		$date_is_inclusive = ( 'true' === $date_query['inclusive'] ) ? true : false;
		$date_primary      = $date_query['date_primary'];
		$date_secondary    = $date_query['date_secondary'];

		// Date format: 2022-12-27T11:14:21.
		$primary_year    = substr( $date_primary, 0, 4 );
		$primary_month   = substr( $date_primary, 5, 2 );
		$primary_day     = substr( $date_primary, 8, 2 );
		$secondary_year  = substr( $date_secondary, 0, 4 );
		$secondary_month = substr( $date_secondary, 5, 2 );
		$secondary_day   = substr( $date_secondary, 8, 2 );

		if ( 'between' === $date_relationship ) {
			$date_queries = array(
				'after'  => array(
					'year'  => $primary_year,
					'month' => $primary_month,
					'day'   => $primary_day,
				),
				'before' => array(
					'year'  => $secondary_year,
					'month' => $secondary_month,
					'day'   => $secondary_day,
				),
			);
		} else {
			$date_queries = array(
				$date_relationship => array(
					'year'  => $primary_year,
					'month' => $primary_month,
					'day'   => $primary_day,
				),
			);
		}
		$date_queries['inclusive'] = $date_is_inclusive;

		$custom_args['date_query'] = array_filter( $date_queries );
	}

	// Merge all queries.
	return array_merge(
		$args,
		array_filter( $custom_args )
	);
}
