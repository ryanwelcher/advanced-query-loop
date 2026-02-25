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
	 * Test that only boolean true satisfies the strict filter check.
	 *
	 * The posts_pre_query and the_posts filters use `true === $query->query['enable_caching']`.
	 * Only PHP boolean true passes this check; truthy values like 1, "1", or "true" do not.
	 */
	public function test_boolean_true_stored_with_strict_equality() {
		$qpg = new Query_Params_Generator( array(), array( 'enable_caching' => true ) );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// assertSame enforces type — only true (boolean) satisfies the filter's `true ===` check.
		$this->assertSame( true, $result['enable_caching'] );
	}

	/**
	 * Test that truthy non-boolean values are stored by the trait but won't trigger caching.
	 *
	 * The caching filters use a strict `true ===` comparison, so values like 1, "1", and "true"
	 * will be present in query args but will not satisfy the filter condition.
	 */
	public function test_truthy_non_boolean_values_will_not_satisfy_filter() {
		$non_boolean_truthy = array( 1, '1', 'true' );

		foreach ( $non_boolean_truthy as $value ) {
			$qpg = new Query_Params_Generator( array(), array( 'enable_caching' => $value ) );
			$qpg->process_all();

			$result = $qpg->get_query_args();

			// The value is stored in args by the trait...
			$this->assertArrayHasKey( 'enable_caching', $result );

			// ...but it does NOT satisfy the strict `true ===` filter condition.
			$this->assertNotSame( true, $result['enable_caching'] );
		}
	}

	/**
	 * Test that disabling caching removes the key entirely from query args.
	 *
	 * The caching filters check isset() first, so the key must be absent (not merely
	 * falsy) for the isset() guard to correctly short-circuit and skip caching.
	 */
	public function test_false_caching_key_is_absent_not_just_falsy() {
		$qpg = new Query_Params_Generator( array(), array( 'enable_caching' => false ) );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Key must be absent so that isset( $query->query['enable_caching'] ) returns false.
		$this->assertArrayNotHasKey( 'enable_caching', $result );

		// is_aql must still be present (the first condition the filters check).
		$this->assertArrayHasKey( 'is_aql', $result );
		$this->assertSame( true, $result['is_aql'] );
	}

	/**
	 * Test that both conditions required by the caching filters are satisfied together.
	 *
	 * The filters check: is_aql is set AND enable_caching === true.
	 * Both must be present for caching to be triggered.
	 */
	public function test_both_filter_conditions_met_when_caching_enabled() {
		$qpg = new Query_Params_Generator( array(), array( 'enable_caching' => true ) );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Condition 1: isset( $query->query['is_aql'] )
		$this->assertArrayHasKey( 'is_aql', $result );
		$this->assertSame( true, $result['is_aql'] );

		// Condition 2: true === $query->query['enable_caching']
		$this->assertArrayHasKey( 'enable_caching', $result );
		$this->assertSame( true, $result['enable_caching'] );
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
