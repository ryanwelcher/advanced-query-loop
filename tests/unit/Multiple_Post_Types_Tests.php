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
class Multiple_Post_Types_Tests extends TestCase {

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
				array(
					'post_type' => array(),
				),
				// Custom data.
				array(
					'multiple_posts' => array(),
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
	public function test_meta_query_returns_empty( $default_data, $custom_data ) {

		$qpg = new Query_Params_Generator( $default_data, $custom_data );
		$qpg->process_all();

		// Empty arrays return empty.
		$this->assertEmpty( $qpg->get_query_args() );
	}



	/**
	 * Data provider for test_combine_post_types
	 *
	 * @return array
	 */
	public function data_combine_post_types() {
		return array(
			// Test basic combine of data
			array(
				// Test data
				array(
					// Default values.
					'default_data' => array(
						'post_type' => 'posts',
					),
					// Custom data.
					'custom_data'  => array(
						'multiple_posts' => array( 'pages' ),
					),
				),
				// Expected results
				array( 'post_type' => array( 'posts', 'pages' ) ),
			),
			// Test for duplicates. The UI shouldn't allow this but worth doing anyways.
			array(
				// Test data
				array(
					// Default values.
					'default_data' => array(
						'post_type' => 'posts',
					),
					// Custom data.
					'custom_data'  => array(
						'multiple_posts' => array( 'posts' ),
					),
				),
				// Expected results
				array( 'post_type' => array( 'posts' ) ),
			),
		);
	}

	/**
	 * All of these tests will return empty arrays
	 *
	 * @param array $data     Data to pass to the QPG class.
	 * @param array $expected Expected results of the test.
	 *
	 * @dataProvider data_combine_post_types
	 */
	public function test_combine_post_types( $data, $expected ) {

		$qpg = new Query_Params_Generator( $data['default_data'], $data['custom_data'] );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}
}
