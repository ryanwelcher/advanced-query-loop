<?php
/**
 * Handles enqueueing of assets for the plugin.
 *
 * @package AdvancedQueryLoop
 */

namespace AdvancedQueryLoop;

use function AdvancedQueryLoop\Utils\{ is_gutenberg_plugin_version_or_higher,is_core_version_or_higher };


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
			// Allow for translation.
			wp_set_script_translations( 'advanced-query-loop', 'advanced-query-loop' );
		}

		// Per Page, Offset, and Max count controls where merged into GB 19.
		if ( ! is_gutenberg_plugin_version_or_higher( '19' ) && ! is_core_version_or_higher( '6.7' ) ) {
			// Enqueue the legacy controls.
			$pre_gb_19_assets_file = BUILD_DIR_PATH . 'legacy-pre-gb-19.asset.php';

			if ( file_exists( $pre_gb_19_assets_file ) ) {
				$pre_gb_19_assets = include $pre_gb_19_assets_file;

				\wp_enqueue_script(
					'advanced-query-loop-legacy-pre-gb-19',
					BUILD_DIR_URL . 'legacy-pre-gb-19.js',
					array_merge( array( 'advanced-query-loop' ), $pre_gb_19_assets['dependencies'] ),
					$pre_gb_19_assets['version'],
					true
				);
			}
		}
	}
);
