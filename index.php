<?php
/**
 * Plugin Name:       Advanced Query Loop
 * Description:       Query loop block variations to create custom queries.
 * Plugin URI:        https://github.com/ryanwelcher/advanced-query-loop/
 * Version:           4.1.2
 * Requires at least: 6.2
 * Requires PHP:      7.4
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

// Some helpful constants.
define( 'BUILD_DIR_PATH', plugin_dir_path( __FILE__ ) . 'build/' );
define( 'BUILD_DIR_URL', plugin_dir_url( __FILE__ ) . 'build/' );

// Prevent direct access.
defined( 'ABSPATH' ) || exit;

// Load the autoloader.
if ( ! class_exists( 'Query_Params_Generator' ) && is_file( __DIR__ . '/vendor/autoload.php' ) ) {
	require_once __DIR__ . '/vendor/autoload.php';
}
