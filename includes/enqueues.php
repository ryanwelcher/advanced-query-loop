<?php
/**
 * Handles enqueueing of assets for the plugin.
 *
 * @package AdvancedQueryLoop
 */

namespace AdvancedQueryLoop;

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
			// Allow for translation.
			wp_set_script_translations( 'advanced-query-loop', 'advanced-query-loop' );
		}
	}
);
