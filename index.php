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
				function( $query ) use ( $parsed_block ) {
					$custom_query = $parsed_block['attrs']['query'];
					// Generate a new custom query will all potential query vars.
					$custom_args = array(
						'meta_key'     => $custom_query['meta_key'],
						'meta_value'   => $custom_query['meta_value'],
						'meta_compare' => $custom_query['meta_compare'],
					);
					// Filter out any empty values from the custom query and merge it with the existing query.
					return array_merge(
						array_filter( $custom_args ),
						$query
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
add_filter(
	'rest_twitch-stream_query',
	function( $args, $request ) {
		// Generate a new custom query will all potential query vars.
		$custom_args = array(
			'meta_key'       => $request->get_param( 'meta_key' ),
			'meta_value'     => $request->get_param( 'meta_value' ),
			'meta_compare'   => $request->get_param( 'meta_compare' ),
		);

		// Filter out any empty values from the custom query and merge it with the existing query.
		return array_merge(
			$args,
			array_filter( $custom_args )
		);
	},
	10,
	2
);
