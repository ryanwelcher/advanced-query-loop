<?php
/**
 * Tests for the Disable_Pagination Trait
 */

namespace AdvancedQueryLoop\UnitTests;

use AdvancedQueryLoop\Query_Params_Generator;
use PHPUnit\Framework\TestCase;

/**
 * Test the Disable_Pagination trait
 */
class Disable_Pagination_Tests extends TestCase {

	/**
	 * Data provider for tests that should not add no_found_rows
	 *
	 * @return array
	 */
	public function data_no_pagination_setting() {
		return array(
			'no disable_pagination param' => array(
				// Custom data.
				array(),
				// Expected.
				array( 'is_aql' => true ),
			),
			'empty string disable_pagination' => array(
				// Custom data.
				array(
					'disable_pagination' => '',
				),
				// Expected - empty string is falsy, not processed.
				array( 'is_aql' => true ),
			),
			'null disable_pagination' => array(
				// Custom data.
				array(
					'disable_pagination' => null,
				),
				// Expected - null is falsy, not processed.
				array( 'is_aql' => true ),
			),
			'false disable_pagination' => array(
				// Custom data.
				array(
					'disable_pagination' => false,
				),
				// Expected - false is falsy, not processed.
				array( 'is_aql' => true ),
			),
		);
	}

	/**
	 * Test that empty/null/false pagination values are not added
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_no_pagination_setting
	 */
	public function test_disable_pagination_empty_handling( $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}

	/**
	 * Data provider for truthy disable_pagination values
	 *
	 * @return array
	 */
	public function data_disable_pagination_enabled() {
		return array(
			'boolean true' => array(
				// Custom data.
				array(
					'disable_pagination' => true,
				),
				// Expected.
				array(
					'is_aql'        => true,
					'no_found_rows' => true,
				),
			),
			'integer 1' => array(
				// Custom data.
				array(
					'disable_pagination' => 1,
				),
				// Expected.
				array(
					'is_aql'        => true,
					'no_found_rows' => 1,
				),
			),
			'string "true"' => array(
				// Custom data.
				array(
					'disable_pagination' => 'true',
				),
				// Expected.
				array(
					'is_aql'        => true,
					'no_found_rows' => 'true',
				),
			),
			'string "1"' => array(
				// Custom data.
				array(
					'disable_pagination' => '1',
				),
				// Expected.
				array(
					'is_aql'        => true,
					'no_found_rows' => '1',
				),
			),
		);
	}

	/**
	 * Test that truthy disable_pagination values are passed through
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_disable_pagination_enabled
	 */
	public function test_disable_pagination_enabled( $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}

	/**
	 * Test that any non-falsy value is passed through (trait doesn't validate)
	 */
	public function test_disable_pagination_passes_through_any_value() {
		$custom_data = array(
			'disable_pagination' => 'some-random-value',
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// The trait simply passes through the value
		$this->assertEquals( 'some-random-value', $result['no_found_rows'] );
	}

	/**
	 * Test disable_pagination works with other query params
	 */
	public function test_disable_pagination_with_other_params() {
		$custom_data = array(
			'disable_pagination' => true,
			'exclude_current'    => 10,
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Should have both no_found_rows and post__not_in
		$this->assertArrayHasKey( 'no_found_rows', $result );
		$this->assertArrayHasKey( 'post__not_in', $result );
		$this->assertTrue( $result['no_found_rows'] );
		$this->assertEquals( array( 10 ), $result['post__not_in'] );
	}

	/**
	 * Test no_found_rows improves performance (documentation test)
	 */
	public function test_no_found_rows_purpose() {
		// This test documents the purpose of no_found_rows
		// In WordPress, no_found_rows=true skips the SQL_CALC_FOUND_ROWS
		// which improves query performance when pagination info isn't needed

		$custom_data = array(
			'disable_pagination' => true,
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Verify the parameter is set correctly for WP_Query
		$this->assertArrayHasKey( 'no_found_rows', $result );
		$this->assertTrue( $result['no_found_rows'] );
	}
}
