<?php
/**
 * Tests for the Query_Params_Generator core methods
 */

namespace AdvancedQueryLoop\UnitTests;

use AdvancedQueryLoop\Query_Params_Generator;
use PHPUnit\Framework\TestCase;

/**
 * Test the Query_Params_Generator core functionality
 */
class Query_Params_Generator_Core_Tests extends TestCase {

	/**
	 * Test constructor with various input types
	 */
	public function test_constructor_with_null_params() {
		$qpg = new Query_Params_Generator( null, null );
		$qpg->process_all();

		$this->assertEquals( array( 'is_aql' => true ), $qpg->get_query_args() );
	}

	/**
	 * Test constructor with empty arrays
	 */
	public function test_constructor_with_empty_arrays() {
		$qpg = new Query_Params_Generator( array(), array() );
		$qpg->process_all();

		$this->assertEquals( array( 'is_aql' => true ), $qpg->get_query_args() );
	}

	/**
	 * Test constructor with valid data
	 */
	public function test_constructor_with_valid_data() {
		$default_data = array( 'post_type' => 'post' );
		$custom_data  = array( 'exclude_current' => 10 );

		$qpg = new Query_Params_Generator( $default_data, $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		$this->assertArrayHasKey( 'post__not_in', $result );
		$this->assertEquals( array( 10 ), $result['post__not_in'] );
	}

	/**
	 * Data provider for has_custom_param tests
	 *
	 * @return array
	 */
	public function data_has_custom_param() {
		return array(
			'param exists and is truthy' => array(
				'custom_params' => array( 'test_param' => 'value' ),
				'param_name'    => 'test_param',
				'expected'      => true,
			),
			'param exists but is empty string' => array(
				'custom_params' => array( 'test_param' => '' ),
				'param_name'    => 'test_param',
				'expected'      => false,
			),
			'param exists but is empty array' => array(
				'custom_params' => array( 'test_param' => array() ),
				'param_name'    => 'test_param',
				'expected'      => false,
			),
			'param exists but is null' => array(
				'custom_params' => array( 'test_param' => null ),
				'param_name'    => 'test_param',
				'expected'      => false,
			),
			'param exists but is false' => array(
				'custom_params' => array( 'test_param' => false ),
				'param_name'    => 'test_param',
				'expected'      => false,
			),
			'param exists but is zero' => array(
				'custom_params' => array( 'test_param' => 0 ),
				'param_name'    => 'test_param',
				'expected'      => false,
			),
			'param does not exist' => array(
				'custom_params' => array( 'other_param' => 'value' ),
				'param_name'    => 'test_param',
				'expected'      => false,
			),
			'param exists with integer value' => array(
				'custom_params' => array( 'test_param' => 123 ),
				'param_name'    => 'test_param',
				'expected'      => true,
			),
			'param exists with array value' => array(
				'custom_params' => array( 'test_param' => array( 'item' ) ),
				'param_name'    => 'test_param',
				'expected'      => true,
			),
		);
	}

	/**
	 * Test has_custom_param method
	 *
	 * @param array  $custom_params The custom params to test with.
	 * @param string $param_name    The param name to check.
	 * @param bool   $expected      The expected result.
	 *
	 * @dataProvider data_has_custom_param
	 */
	public function test_has_custom_param( $custom_params, $param_name, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_params );

		$this->assertEquals( $expected, $qpg->has_custom_param( $param_name ) );
	}

	/**
	 * Data provider for get_custom_param tests
	 *
	 * @return array
	 */
	public function data_get_custom_param() {
		return array(
			'param exists with string value' => array(
				'custom_params' => array( 'test_param' => 'test_value' ),
				'param_name'    => 'test_param',
				'expected'      => 'test_value',
			),
			'param exists with integer value' => array(
				'custom_params' => array( 'test_param' => 42 ),
				'param_name'    => 'test_param',
				'expected'      => 42,
			),
			'param exists with array value' => array(
				'custom_params' => array( 'test_param' => array( 'a', 'b' ) ),
				'param_name'    => 'test_param',
				'expected'      => array( 'a', 'b' ),
			),
			'param exists but is empty string' => array(
				'custom_params' => array( 'test_param' => '' ),
				'param_name'    => 'test_param',
				'expected'      => false, // has_custom_param returns false for empty
			),
			'param does not exist' => array(
				'custom_params' => array(),
				'param_name'    => 'test_param',
				'expected'      => false,
			),
		);
	}

	/**
	 * Test get_custom_param method
	 *
	 * @param array  $custom_params The custom params to test with.
	 * @param string $param_name    The param name to retrieve.
	 * @param mixed  $expected      The expected result.
	 *
	 * @dataProvider data_get_custom_param
	 */
	public function test_get_custom_param( $custom_params, $param_name, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_params );

		$this->assertEquals( $expected, $qpg->get_custom_param( $param_name ) );
	}

	/**
	 * Test get_allowed_controls static method
	 */
	public function test_get_allowed_controls() {
		$controls = Query_Params_Generator::get_allowed_controls();

		// Should be an array
		$this->assertIsArray( $controls );

		// Should contain expected controls
		$expected_controls = array(
			'additional_post_types',
			'taxonomy_query_builder',
			'post_meta_query',
			'post_order',
			'exclude_current_post',
			'include_posts',
			'child_items_only',
			'date_query_dynamic_range',
			'date_query_relationship',
			'pagination',
			'exclude_posts',
			'enable_caching',
		);

		foreach ( $expected_controls as $control ) {
			$this->assertContains( $control, $controls );
		}
	}

	/**
	 * Test process_all method processes multiple traits
	 */
	public function test_process_all_with_multiple_traits() {
		$custom_data = array(
			'exclude_current' => 10,
			'include_posts'   => array(
				array( 'id' => 20 ),
				array( 'id' => 30 ),
			),
			'post_parent'     => 5,
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Should have all three parameters processed
		$this->assertArrayHasKey( 'post__not_in', $result );
		$this->assertArrayHasKey( 'post__in', $result );
		$this->assertArrayHasKey( 'post_parent', $result );

		$this->assertEquals( array( 10 ), $result['post__not_in'] );
		$this->assertEquals( array( 20, 30 ), $result['post__in'] );
		$this->assertEquals( 5, $result['post_parent'] );
	}

	/**
	 * Test process_all only processes params that exist
	 */
	public function test_process_all_only_processes_existing_params() {
		$custom_data = array(
			'exclude_current' => 10,
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Should only have exclude_current processed
		$this->assertArrayHasKey( 'post__not_in', $result );
		$this->assertArrayNotHasKey( 'post__in', $result );
		$this->assertArrayNotHasKey( 'post_parent', $result );
		$this->assertArrayNotHasKey( 'meta_query', $result );
	}

	/**
	 * Test get_query_args returns correct structure
	 */
	public function test_get_query_args_structure() {
		$qpg = new Query_Params_Generator( array(), array() );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Should always have is_aql
		$this->assertArrayHasKey( 'is_aql', $result );
		$this->assertTrue( $result['is_aql'] );

		// Should be an array
		$this->assertIsArray( $result );
	}

	/**
	 * Test get_query_args with complex query
	 */
	public function test_get_query_args_with_complex_query() {
		$custom_data = array(
			'meta_query' => array(
				'relation' => 'AND',
				'queries'  => array(
					array(
						'meta_key'     => 'color',
						'meta_value'   => 'blue',
						'meta_compare' => '=',
					),
				),
			),
			'tax_query'  => array(
				'queries' => array(
					array(
						'taxonomy'         => 'category',
						'terms'            => array( 'News' ),
						'field'            => 'term_id',
						'operator'         => 'IN',
						'include_children' => true,
					),
				),
			),
			'date_query' => array(
				'range' => 'last-month',
			),
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Should have all three query types
		$this->assertArrayHasKey( 'meta_query', $result );
		$this->assertArrayHasKey( 'tax_query', $result );
		$this->assertArrayHasKey( 'date_query', $result );
		$this->assertArrayHasKey( 'is_aql', $result );

		// Verify structure
		$this->assertIsArray( $result['meta_query'] );
		$this->assertIsArray( $result['tax_query'] );
		$this->assertIsArray( $result['date_query'] );
	}

	/**
	 * Test that is_aql is always present
	 */
	public function test_is_aql_always_present() {
		$test_cases = array(
			array(),
			array( 'exclude_current' => 10 ),
			array( 'meta_query' => array() ),
			null,
		);

		foreach ( $test_cases as $custom_data ) {
			$qpg = new Query_Params_Generator( array(), $custom_data );
			$qpg->process_all();

			$result = $qpg->get_query_args();

			$this->assertArrayHasKey( 'is_aql', $result );
			$this->assertTrue( $result['is_aql'] );
		}
	}

	/**
	 * Test process_all handles invalid param gracefully
	 */
	public function test_process_all_with_invalid_param() {
		$custom_data = array(
			'exclude_current' => 10,
			'invalid_param'   => 'should be ignored',
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Should process valid param
		$this->assertArrayHasKey( 'post__not_in', $result );

		// Should not have processed invalid param
		$this->assertArrayNotHasKey( 'invalid_param', $result );
	}

	/**
	 * Test that empty custom params still returns is_aql
	 */
	public function test_empty_custom_params_returns_is_aql() {
		$qpg = new Query_Params_Generator( array(), array() );

		// Before processing
		$result_before = $qpg->get_query_args();
		$this->assertEquals( array( 'is_aql' => true ), $result_before );

		// After processing
		$qpg->process_all();
		$result_after = $qpg->get_query_args();
		$this->assertEquals( array( 'is_aql' => true ), $result_after );
	}

	/**
	 * Test process_all called multiple times adds duplicate values
	 */
	public function test_process_all_not_idempotent() {
		$custom_data = array(
			'exclude_current' => 10,
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );

		// Process once
		$qpg->process_all();
		$result1 = $qpg->get_query_args();
		$this->assertEquals( array( 10 ), $result1['post__not_in'] );

		// Process again - adds duplicate
		$qpg->process_all();
		$result2 = $qpg->get_query_args();
		$this->assertEquals( array( 10, 10 ), $result2['post__not_in'] );

		// This documents that process_all should only be called once
	}

	/**
	 * Test default params are preserved
	 */
	public function test_default_params_preserved() {
		$default_data = array(
			'post_type'      => 'post',
			'posts_per_page' => 10,
		);

		$custom_data = array(
			'exclude_current' => 5,
		);

		$qpg = new Query_Params_Generator( $default_data, $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Custom params are added
		$this->assertArrayHasKey( 'post__not_in', $result );

		// Default params are not in custom args (they're separate)
		// The custom_args only contains AQL-specific modifications
		$this->assertArrayNotHasKey( 'post_type', $result );
		$this->assertArrayNotHasKey( 'posts_per_page', $result );
	}
}
