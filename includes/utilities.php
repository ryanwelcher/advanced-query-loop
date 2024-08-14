<?php
/**
 * Handles enqueueing of assets for the plugin.
 *
 * @package AdvancedQueryLoop/Utils
 */

namespace AdvancedQueryLoop\Utils;

/**
 * Helper to determine if the Gutenberg plugin is installed and if so, if it is at or higher a given version.
 *
 * @param string $version The version to check for.
 *
 * @return boolean.
 */
function is_gutenberg_plugin_version_or_higher( string $version ) {
	if ( defined( 'IS_GUTENBERG_PLUGIN' ) && defined( 'GUTENBERG_VERSION' ) ) {
		// This means the plugin is installed
		return version_compare( GUTENBERG_VERSION, $version, '>=' );
	}
	return false;
}

/**
 * Helper to determine is the current WP install is at or higher than a given version.
 *
 * @param string $version The version to check for.

 * @return boolean.
 */
function is_core_version_or_higher( string $version ) {
	$core = get_bloginfo( 'version' );
	return version_compare( $core, $version, '>=' );
}

