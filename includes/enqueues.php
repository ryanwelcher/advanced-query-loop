<?php
/**
 * Handles enqueueing of assets for the plugin.
 *
 * @package AdvancedQueryLoop
 */

namespace AdvancedQueryLoop;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	return;
}

// Bail on unit tests.
if ( ! function_exists( 'add_action' ) ) {
	return;
}

/**
 * Enqueue our variations.
*/
\add_action(
	'enqueue_block_editor_assets',
	function () {
		// Variations.
		$variations_assets_file = BUILD_DIR_PATH . 'variations.asset.php';

		if ( file_exists( $variations_assets_file ) ) {
			$assets = include $variations_assets_file;
			\wp_enqueue_script(
				'advanced-query-loop',
				BUILD_DIR_URL . 'variations.js',
				$assets['dependencies'],
				$assets['version'],
				true
			);
			// Editor styles for AQL's token fields.
			if ( file_exists( BUILD_DIR_PATH . 'variations.css' ) ) {
				\wp_enqueue_style(
					'advanced-query-loop',
					BUILD_DIR_URL . 'variations.css',
					array(),
					$assets['version']
				);
			}

			// Allow for translation.
			wp_set_script_translations( 'advanced-query-loop', 'advanced-query-loop' );
			// Add inline script.
			wp_add_inline_script(
				'advanced-query-loop',
				'window.aql = window.aql || {};'
				. ' window.aql.allowedControls = "' . implode( ',', Query_Params_Generator::get_allowed_controls() ) . '";'
				. ' window.aql.placeholders = ' . wp_json_encode( Placeholder_Resolver::get_placeholder_list() ) . ';'
			);
		}
	}
);
