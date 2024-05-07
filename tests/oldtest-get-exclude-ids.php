<?php
/**
 * Tests for the get_exclude_ids function
 *
 * @package AdvancedQueryLoop\UnitTests;
 */

namespace AdvancedQueryLoop\UnitTests;

use function AdvancedQueryLoop\get_exclude_ids;

class GetExcludeIdTests extends \WP_UnitTestCase {


	/**
	 * Data provider for the empty array tests
	 * @return array {
	 *		@type array {
     *    		@type array $data The data being passed.
     * 		}
     * }
	 */
	public function data_returns_empty_array() {
		return array(
			array(
				array()
			),
		);
	}

	/**
	 * All of these tests will return empty arrays
	 *
	 * @dataProvider data_returns_empty_array
	 */
	public function test_returns_empty_array( $data ) {
		// Empty arrays return empty
		$this->assertEmpty( get_exclude_ids( $data ) );
	}

	/**
	 * Data provider for the contains post_id tests
	 * @return array {
	 *		@type array {
     *    		@type array $data The data being passed.
     * 		}
     * }
	 */
	public function data_contains_post_id() {
		return array(
			array(
				array( 'exclude_current' => 1 )
			),
			array(
				array( 'exclude_current' => '1' )
			),
		);
	}

	/**
	 * The returned array should contain only a post ID
	 *
	 * @dataProvider data_contains_post_id
	 */
	public function test_contains_post_id( $data ) {
		$this->assertNotEmpty( get_exclude_ids( $data ) );
	}
}

