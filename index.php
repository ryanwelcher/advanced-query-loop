<?php
/**
 * Plugin Name:       Advanced Query Loop
 * Plugin URI:        https://example.com/plugins/the-basics/
 * Description:       Query loop block variations to create custom queries.
 * Version:           1.0.0
 * Requires at least: 6.1
 * Requires PHP:      7.2
 * Author:            Ryan Welcher
 * Author URI:        https://www.ryanwelcher.com/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Update URI:        https://example.com/my-plugin/
 * Text Domain:       advanced-query-loop
 * Domain Path:       /languages
 *
 * @package           AdvancedQueryLoop
 */

/**
 * Enqueue our variations.
 */
add_action(
	'enqueue_block_editor_assets',
	function() {

		// Variations.
		$variations_assets_file = plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

		if ( file_exists( $variations_assets_file ) ) {
			$assets = include $variations_assets_file;
			wp_enqueue_script(
				'advanced-query-loop',
				plugin_dir_url( __FILE__ ) . '/build/index.js',
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
add_filter(
	'pre_render_block',
	function( $pre_render, $parsed_block ) {
		if ( 'advanced-query-loop' === $parsed_block['attrs']['namespace'] ) {
			add_filter(
				'query_loop_block_query_vars',
				function( $default_query ) use ( $parsed_block ) {
					$custom_query = $parsed_block['attrs']['query'];
					// Generate a new custom query will all potential query vars.
					$meta_queries = array(
						'relation' => $custom_query['meta_query']['relation'],
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
					$custom_args = array(
						'meta_query' => array_filter( $meta_queries ),
					);

					$new_query = array_merge(
						$default_query,
						$custom_args
					);
					// die( '<pre>' . print_r( $new_query, 1 ) . '</pre>)' );

					// Filter out any empty values from the custom query and merge it with the existing query.
					return $new_query;
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
add_action(
	'init',
	function() {
		$registered_post_types = get_post_types( array( 'public' => true ) );
		foreach ( $registered_post_types as $registered_post_type ) {
			add_filter( 'rest_' . $registered_post_type . '_query', 'add_custom_query_params', 10, 2 );
		}

	},
	PHP_INT_MAX
);

/**
 * Callback to handle the custom query params.
 */
function add_custom_query_params( $args, $request ) {
	// Generate a new custom query will all potential query vars.

	$meta_query = $request->get_param( 'meta_query' );

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

	$custom_args = array(
		'meta_query' => array_filter( $meta_queries ),
	);

	$new_query = array_merge(
		$args,
		array_filter( $custom_args )
	);

	// die( '<pre>' . print_r( $new_query, 1 ) . '</pre>)' );

	// Filter out any empty values from the custom query and merge it with the existing query.
	return $new_query;
}
