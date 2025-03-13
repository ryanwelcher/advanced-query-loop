<?php
/**
 * Tests for the Query_Params_Generator class functions
 */

namespace AdvancedQueryLoop\UnitTests;

use AdvancedQueryLoop\Query_Params_Generator;
use PHPUnit\Framework\TestCase;

/**
 * Test the generator class
 */
class Query_Params_Generator_Tests extends TestCase {

	/**
	 * Data provider for the empty array tests
	 *
	 * @return array
	 */
	public function data_empty_null_passed_constructor() {
		return array(
			array(
				null,
				null,
			),
			array(
				array(),
				null,
			),
			array(
				null,
				array(),
			),
			array(
				array(),
				array(),
			),
		);
	}

	/**
	 * All of these tests will return empty arrays
	 *
	 * @param null|array $default_data The params coming from the default block.
	 * @param null|array $custom_data  The params coming from AQL.
	 *
	 * @dataProvider data_empty_null_passed_constructor
	 */
	public function test_empty_null_passed_constructor( $default_data, $custom_data ) {

		$qpg = new Query_Params_Generator( $default_data, $custom_data, );
		$qpg->process_all();

		// Empty arrays return empty.
		$this->assertEmpty( $qpg->get_query_args() );
	}
}
