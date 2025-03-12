<?php
/**
 * PHPUnit bootstrap file
 *
 * @package features-plugin-v2
 */

define( 'TESTS_PLUGIN_DIR', dirname( __DIR__ ) );
define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', dirname( TESTS_PLUGIN_DIR ) . '/vendor/yoast/phpunit-polyfills' );

// Determine correct location for plugins directory to use.
define( 'WP_PLUGIN_DIR', dirname( dirname( TESTS_PLUGIN_DIR ) ) );

define( 'WP_PHPUNIT__DIR', dirname( TESTS_PLUGIN_DIR ) . '/vendor/wp-phpunit/wp-phpunit/' );

// Load Composer dependencies if applicable.
if ( file_exists( dirname( TESTS_PLUGIN_DIR ) . '/vendor/autoload.php' ) ) {
	require_once dirname( TESTS_PLUGIN_DIR ) . '/vendor/autoload.php';
}

// Detect where to load the WordPress tests environment from.

$_test_root = WP_PHPUNIT__DIR;

require_once $_test_root . '/includes/functions.php';

/**
 * Load plugin in test env.
 *
 * @return void
 */
function features_plugin_unit_test_load_plugin_file() {
	require_once dirname( TESTS_PLUGIN_DIR ) . '/index.php';
}

tests_add_filter( 'muplugins_loaded', 'features_plugin_unit_test_load_plugin_file' );

require $_test_root . '/includes/bootstrap.php';
