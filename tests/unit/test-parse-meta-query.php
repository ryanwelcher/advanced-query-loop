<?php
/**
 * Parse Meta Query
 *
 * @package AdvancedQueryLoop\UnitTests;
 */

namespace AdvancedQueryLoop\UnitTests;

use function AdvancedQueryLoop\parse_meta_query;

class ParseMetaQueryTests extends \WP_UnitTestCase {


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
			array(
				array( 'relation' => '' ),
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
		$this->assertEmpty( parse_meta_query( $data ) );
	}
}

