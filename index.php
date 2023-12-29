<?php
/**
 * Plugin Name:       Advanced Query Loop
 * Description:       Query loop block variations to create custom queries.
 * Plugin URI:        https://github.com/ryanwelcher/advanced-query-loop/
 * Version:           2.1.0
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

// Some helpful constants.
define( 'BUILD_DIR_PATH', plugin_dir_path( __FILE__ ) . 'build/' );
define( 'BUILD_DIR_URL', plugin_dir_url( __FILE__ ) . 'build/' );

// Require some files.
require_once __DIR__ . '/includes/enqueues.php';
require_once __DIR__ . '/includes/query-loop.php';
