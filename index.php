<?php
/**
 * Plugin Name:       Advanced Query Loop
 * Description:       Query loop block variations to create custom queries.
 * Plugin URI:        https://github.com/ryanwelcher/advanced-query-loop/
 * Version:           1.0.3
 * Requires at least: 6.1
 * Requires PHP:      7.2
 * Author:            Ryan Welcher
 * Author URI:        https://www.ryanwelcher.com/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       advanced-query-loop
 * Domain Path:       /languages
 *
 * @package           AdvancedQueryLoop
 */

namespace AdvancedQueryLoop;

/**
 * Enqueue our variations.
 */
\add_action(
	'enqueue_block_editor_assets',
	function() {

		// Variations.
		$variations_assets_file = plugin_dir_path( __FILE__ ) . 'build/variations.asset.php';

		if ( file_exists( $variations_assets_file ) ) {
			$assets = include $variations_assets_file;
			\wp_enqueue_script(
				'advanced-query-loop',
				plugin_dir_url( __FILE__ ) . '/build/variations.js',
				$assets['dependencies'],
				$assets['version'],
				true
			);
		}

	}
);

/**
 * Updates the query on the front end based on custom query attributes.
 */
\add_filter(
	'pre_render_block',
	function( $pre_render, $parsed_block ) {
		if ( isset( $parsed_block['attrs']['namespace'] ) && 'advanced-query-loop' === $parsed_block['attrs']['namespace'] ) {
			\add_filter(
				'query_loop_block_query_vars',
				function( $default_query ) use ( $parsed_block ) {
					$custom_query = $parsed_block['attrs']['query'];
					// Generate a new custom query will all potential query vars.
					$custom_args = array();

					// Check for meta queries.
					if ( isset( $custom_query['meta_query']['queries'] ) ) {

						$meta_queries = array(
							'relation' => isset( $custom_query['meta_query']['relation'] ) ? $custom_query['meta_query']['relation'] : '',
						);

						foreach ( $custom_query['meta_query']['queries'] as $query ) {
							$meta_queries[] = array_filter(
								array(
									'key'     => $query['meta_key'],
									'value'   => $query['meta_value'],
									'compare' => $query['meta_compare'],
								)
							);
						}

						// Add the meta queries to the custom args.
						$custom_args['meta_query'] = array_filter( $meta_queries ); // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
					}

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
		$registered_post_types = get_post_types( array( 'public' => true ) );
		foreach ( $registered_post_types as $registered_post_type ) {
			add_filter( 'rest_' . $registered_post_type . '_query', __NAMESPACE__ . '\add_custom_query_params', 10, 2 );
		}

	},
	PHP_INT_MAX
);

/**
 * Callback to handle the custom query params. Updates the block editor.
 */
function add_custom_query_params( $args, $request ) {
	// Generate a new custom query will all potential query vars.
	$custom_args = array();
	// Meta related.
	$meta_query = $request->get_param( 'meta_query' );

	if ( $meta_query ) {
		$meta_queries = array(
			'relation' => $meta_query['relation'],
		);
		foreach ( $meta_query['queries'] as $query ) {
			$meta_queries[] = array_filter(
				array(
					'key'     => $query['meta_key'],
					'value'   => $query['meta_value'],
					'compare' => $query['meta_compare'],
				)
			);
		}

		$custom_args['meta_query'] = array_filter( $meta_queries );
	}
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
