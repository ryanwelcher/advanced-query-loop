<?php
/**
 * Tests for the Enable_Caching Trait
 */

namespace AdvancedQueryLoop\UnitTests;

use AdvancedQueryLoop\Query_Params_Generator;
use PHPUnit\Framework\TestCase;

/**
 * Test the Enable_Caching trait
 */
class Enable_Caching_Tests extends TestCase {

	/**
	 * Data provider for tests that should not add enable_caching
	 *
	 * @return array
	 */
	public function data_no_caching_setting() {
		return array(
			'no enable_caching param'     => array(
				// Custom data.
				array(),
				// Expected.
				array( 'is_aql' => true ),
			),
			'empty string enable_caching' => array(
				// Custom data.
				array(
					'enable_caching' => '',
				),
				// Expected - empty string is falsy, not processed.
				array( 'is_aql' => true ),
			),
			'null enable_caching'         => array(
				// Custom data.
				array(
					'enable_caching' => null,
				),
				// Expected - null is falsy, not processed.
				array( 'is_aql' => true ),
			),
			'false enable_caching'        => array(
				// Custom data.
				array(
					'enable_caching' => false,
				),
				// Expected - false is falsy, not processed.
				array( 'is_aql' => true ),
			),
			'zero enable_caching'         => array(
				// Custom data.
				array(
					'enable_caching' => 0,
				),
				// Expected - 0 is falsy, not processed.
				array( 'is_aql' => true ),
			),
		);
	}

	/**
	 * Test that empty/null/false caching values are not added
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_no_caching_setting
	 */
	public function test_enable_caching_empty_handling( $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}

	/**
	 * Data provider for truthy enable_caching values
	 *
	 * @return array
	 */
	public function data_enable_caching_enabled() {
		return array(
			'boolean true'           => array(
				// Custom data.
				array(
					'enable_caching' => true,
				),
				// Expected.
				array(
					'is_aql'         => true,
					'enable_caching' => true,
				),
			),
			'integer 1'              => array(
				// Custom data.
				array(
					'enable_caching' => 1,
				),
				// Expected.
				array(
					'is_aql'         => true,
					'enable_caching' => 1,
				),
			),
			'string "true"'          => array(
				// Custom data.
				array(
					'enable_caching' => 'true',
				),
				// Expected.
				array(
					'is_aql'         => true,
					'enable_caching' => 'true',
				),
			),
			'string "1"'             => array(
				// Custom data.
				array(
					'enable_caching' => '1',
				),
				// Expected.
				array(
					'is_aql'         => true,
					'enable_caching' => '1',
				),
			),
			'integer cache duration' => array(
				// Custom data.
				array(
					'enable_caching' => 3600,
				),
				// Expected - could be used for cache TTL.
				array(
					'is_aql'         => true,
					'enable_caching' => 3600,
				),
			),
		);
	}

	/**
	 * Test that truthy enable_caching values are passed through
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_enable_caching_enabled
	 */
	public function test_enable_caching_enabled( $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}

	/**
	 * Test that any non-falsy value is passed through (trait doesn't validate)
	 */
	public function test_enable_caching_passes_through_any_value() {
		$custom_data = array(
			'enable_caching' => 'custom-cache-key',
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// The trait simply passes through the value
		$this->assertEquals( 'custom-cache-key', $result['enable_caching'] );
	}

	/**
	 * Test enable_caching works with other query params
	 */
	public function test_enable_caching_with_other_params() {
		$custom_data = array(
			'enable_caching'  => true,
			'exclude_current' => 20,
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Should have both enable_caching and post__not_in
		$this->assertArrayHasKey( 'enable_caching', $result );
		$this->assertArrayHasKey( 'post__not_in', $result );
		$this->assertTrue( $result['enable_caching'] );
		$this->assertEquals( array( 20 ), $result['post__not_in'] );
	}

	/**
	 * Test enable_caching purpose (documentation test)
	 */
	public function test_enable_caching_purpose() {
		// This test documents the purpose of enable_caching
		// It's used by the plugin to determine whether to cache query results
		// in transients for improved performance

		$custom_data = array(
			'enable_caching' => true,
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Verify the parameter is set correctly
		$this->assertArrayHasKey( 'enable_caching', $result );
		$this->assertTrue( $result['enable_caching'] );
	}

	/**
	 * Test enable_caching and disable_pagination can work together
	 */
	public function test_caching_with_pagination_disabled() {
		$custom_data = array(
			'enable_caching'     => true,
			'disable_pagination' => true,
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Both settings should be present
		$this->assertArrayHasKey( 'enable_caching', $result );
		$this->assertArrayHasKey( 'no_found_rows', $result );
		$this->assertTrue( $result['enable_caching'] );
		$this->assertTrue( $result['no_found_rows'] );
	}
}
