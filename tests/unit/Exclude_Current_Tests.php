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
class Exclude_Current_Tests extends TestCase {

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
					'exclude_current' => '',
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
	public function test_exclude_current_returns_empty( $default_data, $custom_data ) {

		$qpg = new Query_Params_Generator( $default_data, $custom_data );
		$qpg->process_all();

		// Empty arrays return empty.
		$this->assertEmpty( $qpg->get_query_args() );
	}


	/**
	 * Data provider for the empty array tests
	 *
	 * @return array
	 */
	public function data_basic_exclude_current() {
		return array(
			array(
				// Default values.
				array(),
				// Custom data.
				array( 'exclude_current' => '1' ),
			),
			array(
				// Default values.
				array(),
				// Custom data.
				array(
					'exclude_current' => 1,
				),
			),
		);
	}

	/**
	 * Test that basics of setting an ID
	 *
	 * @param array $default_data The params coming from the default block.
	 * @param array $custom_data  The params coming from AQL.
	 *
	 * @dataProvider data_basic_exclude_current
	 */
	public function test_basic_exclude_current( $default_data, $custom_data ) {
		$qpg = new Query_Params_Generator( $default_data, $custom_data );
		$qpg->process_all();

		$this->assertEquals( array( 'post__not_in' => array( 1 ) ), $qpg->get_query_args() );
	}


	/**
	 * When Exclude current post is set on a template, it receives a string of the template name.
	 */
	public function test_exclude_current_receives_a_string() {

		// We need to mock a global post object
		$GLOBALS['post'] = (object) array( 'ID' => '1337' );

		$default_data = array();
		$custom_data  = array( 'exclude_current' => 'twentytwentyfour//single' );

		$qpg = new Query_Params_Generator( $default_data, $custom_data );
		$qpg->process_all();

		$this->assertEquals( array( 'post__not_in' => array( 1337 ) ), $qpg->get_query_args() );
	}
}
