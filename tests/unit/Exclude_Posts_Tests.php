<?php
/**
 * Tests for the Query_Params_Generator class.
 */

namespace AdvancedQueryLoop\UnitTests;

use AdvancedQueryLoop\Query_Params_Generator;
use PHPUnit\Framework\TestCase;

/**
 * Test the generator class
 */
class Exclude_Posts_Tests extends TestCase {

	/**
	 * Data provider for the empty array tests
	 *
	 * @return array
	 */
	public function data_returns_empty_array() {
		return array(
			array(
				// Default values.
				array(),
				// Custom data.
				array(),
			),
			array(
				// Default values.
				array(),
				// Custom data.
				array(
					'exclude_posts' => array(),
				),
			),
		);
	}

	/**
	 * All of these tests will return empty arrays
	 *
	 * @param array $default_data The params coming from the default block.
	 * @param array $custom_data  The params coming from AQL.
	 *
	 * @dataProvider data_returns_empty_array
	 */
	public function test_exclude_posts_returns_empty( $default_data, $custom_data ) {

		$qpg = new Query_Params_Generator( $default_data, $custom_data );
		$qpg->process_all();

		// Empty arrays return empty.
		$this->assertEquals( [ 'is_aql' => true ], $qpg->get_query_args() );
	}


	/**
	 * Data provider for the non-empty array tests
	 *
	 * @return array
	 */
	public function data_basic_exclude_posts() {
		return array(
			'exclude two posts' => array(
				// Default values.
				array(),
				// Custom data.
				array( 'exclude_posts' => array( 12, 13 ) ),
				// Expected results.
				array(
					'post__not_in' => array( 12, 13 ),
					'is_aql'       => true,
				),
			),
			'exclude three posts' => array(
				// Default values.
				array(),
				// Custom data.
				array(
					'exclude_posts' => array( 14, 15, 16 ),
				),
				// Expected results.
				array(
					'post__not_in' => array( 14, 15, 16 ),
					'is_aql'       => true,
				),
			),
		);
	}

	/**
	 * Test that basics of excluding posts
	 *
	 * @param array $default_data The params coming from the default block.
	 * @param array $custom_data  The params coming from AQL.
	 * @param array $expected     The expected results.
	 *
	 * @dataProvider data_basic_exclude_posts
	 */
	public function test_basic_exclude_posts( $default_data, $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( $default_data, $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}
}
