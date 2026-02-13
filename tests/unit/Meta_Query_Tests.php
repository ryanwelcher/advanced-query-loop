<?php
/**
 * Tests for the Meta_Query Trait
 */

namespace AdvancedQueryLoop\UnitTests;

use AdvancedQueryLoop\Query_Params_Generator;
use PHPUnit\Framework\TestCase;

/**
 * Test the Meta_Query trait
 */
class Meta_Query_Tests extends TestCase {

	/**
	 * Data provider for tests that should not add meta_query
	 *
	 * @return array
	 */
	public function data_no_meta_query_added() {
		return array(
			'no meta_query param' => array(
				// Default values.
				array(),
				// Custom data.
				array(),
				// Expected.
				array( 'is_aql' => true ),
			),
			'empty meta_query array' => array(
				// Default values.
				array(),
				// Custom data.
				array(
					'meta_query' => array(),
				),
				// Expected - empty array is treated as falsy by has_custom_param.
				array(
					'is_aql' => true,
				),
			),
		);
	}

	/**
	 * Test that empty/null meta queries are handled correctly
	 *
	 * @param array $default_data The params coming from the default block.
	 * @param array $custom_data  The params coming from AQL.
	 * @param array $expected     The expected results.
	 *
	 * @dataProvider data_no_meta_query_added
	 */
	public function test_meta_query_empty_handling( $default_data, $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( $default_data, $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}

	/**
	 * Data provider for single meta query tests
	 *
	 * @return array
	 */
	public function data_single_meta_query() {
		return array(
			'single query with all fields' => array(
				// Custom data.
				array(
					'meta_query' => array(
						'queries' => array(
							array(
								'meta_key'     => 'color',
								'meta_value'   => 'blue',
								'meta_compare' => '=',
								'meta_type'    => 'CHAR',
							),
						),
					),
				),
				// Expected results.
				array(
					'is_aql'     => true,
					'meta_query' => array(
						array(
							'key'     => 'color',
							'value'   => 'blue',
							'compare' => '=',
							'type'    => 'CHAR',
						),
					),
				),
			),
			'single query without compare and type' => array(
				// Custom data.
				array(
					'meta_query' => array(
						'queries' => array(
							array(
								'meta_key'   => 'featured',
								'meta_value' => '1',
							),
						),
					),
				),
				// Expected results.
				array(
					'is_aql'     => true,
					'meta_query' => array(
						array(
							'key'   => 'featured',
							'value' => '1',
						),
					),
				),
			),
			'single query with only key (EXISTS check)' => array(
				// Custom data.
				array(
					'meta_query' => array(
						'queries' => array(
							array(
								'meta_key'     => 'featured',
								'meta_compare' => 'EXISTS',
							),
						),
					),
				),
				// Expected results.
				array(
					'is_aql'     => true,
					'meta_query' => array(
						array(
							'key'     => 'featured',
							'compare' => 'EXISTS',
						),
					),
				),
			),
		);
	}

	/**
	 * Test single meta queries
	 *
	 * @param array $custom_data      The params coming from AQL.
	 * @param array $expected_results The expected results to test against.
	 *
	 * @dataProvider data_single_meta_query
	 */
	public function test_single_meta_query( $custom_data, $expected_results ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected_results, $qpg->get_query_args() );
	}

	/**
	 * Data provider for multiple meta query tests with relations
	 *
	 * @return array
	 */
	public function data_multiple_meta_queries() {
		return array(
			'two queries with AND relation' => array(
				// Custom data.
				array(
					'meta_query' => array(
						'relation' => 'AND',
						'queries'  => array(
							array(
								'meta_key'     => 'color',
								'meta_value'   => 'blue',
								'meta_compare' => '=',
								'meta_type'    => 'CHAR',
							),
							array(
								'meta_key'     => 'price',
								'meta_value'   => '100',
								'meta_compare' => '<',
								'meta_type'    => 'NUMERIC',
							),
						),
					),
				),
				// Expected results.
				array(
					'is_aql'     => true,
					'meta_query' => array(
						'relation' => 'AND',
						array(
							'key'     => 'color',
							'value'   => 'blue',
							'compare' => '=',
							'type'    => 'CHAR',
						),
						array(
							'key'     => 'price',
							'value'   => '100',
							'compare' => '<',
							'type'    => 'NUMERIC',
						),
					),
				),
			),
			'two queries with OR relation' => array(
				// Custom data.
				array(
					'meta_query' => array(
						'relation' => 'OR',
						'queries'  => array(
							array(
								'meta_key'   => 'featured',
								'meta_value' => '1',
							),
							array(
								'meta_key'   => 'highlighted',
								'meta_value' => 'true',
							),
						),
					),
				),
				// Expected results.
				array(
					'is_aql'     => true,
					'meta_query' => array(
						'relation' => 'OR',
						array(
							'key'   => 'featured',
							'value' => '1',
						),
						array(
							'key'   => 'highlighted',
							'value' => 'true',
						),
					),
				),
			),
			'three queries with mixed field completeness' => array(
				// Custom data.
				array(
					'meta_query' => array(
						'relation' => 'AND',
						'queries'  => array(
							array(
								'meta_key'     => 'status',
								'meta_value'   => 'active',
								'meta_compare' => '=',
								'meta_type'    => 'CHAR',
							),
							array(
								'meta_key'   => 'count',
								'meta_value' => '5',
							),
							array(
								'meta_key'     => 'verified',
								'meta_compare' => 'EXISTS',
							),
						),
					),
				),
				// Expected results.
				array(
					'is_aql'     => true,
					'meta_query' => array(
						'relation' => 'AND',
						array(
							'key'     => 'status',
							'value'   => 'active',
							'compare' => '=',
							'type'    => 'CHAR',
						),
						array(
							'key'   => 'count',
							'value' => '5',
						),
						array(
							'key'     => 'verified',
							'compare' => 'EXISTS',
						),
					),
				),
			),
		);
	}

	/**
	 * Test multiple meta queries with relations
	 *
	 * @param array $custom_data      The params coming from AQL.
	 * @param array $expected_results The expected results to test against.
	 *
	 * @dataProvider data_multiple_meta_queries
	 */
	public function test_multiple_meta_queries( $custom_data, $expected_results ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected_results, $qpg->get_query_args() );
	}

	/**
	 * Data provider for edge case tests
	 *
	 * @return array
	 */
	public function data_edge_cases() {
		return array(
			'query with all empty values filters to empty' => array(
				// Custom data.
				array(
					'meta_query' => array(
						'queries' => array(
							array(
								'meta_key'     => '',
								'meta_value'   => '',
								'meta_compare' => '',
								'meta_type'    => '',
							),
						),
					),
				),
				// Expected results - empty query gets filtered out.
				array(
					'is_aql'     => true,
					'meta_query' => array(),
				),
			),
			'relation without queries' => array(
				// Custom data.
				array(
					'meta_query' => array(
						'relation' => 'AND',
					),
				),
				// Expected results - relation is preserved even without queries.
				array(
					'is_aql'     => true,
					'meta_query' => array(
						'relation' => 'AND',
					),
				),
			),
			'numeric meta values' => array(
				// Custom data.
				array(
					'meta_query' => array(
						'queries' => array(
							array(
								'meta_key'     => 'price',
								'meta_value'   => '99.99',
								'meta_compare' => '>=',
								'meta_type'    => 'DECIMAL',
							),
						),
					),
				),
				// Expected results.
				array(
					'is_aql'     => true,
					'meta_query' => array(
						array(
							'key'     => 'price',
							'value'   => '99.99',
							'compare' => '>=',
							'type'    => 'DECIMAL',
						),
					),
				),
			),
			'LIKE comparison' => array(
				// Custom data.
				array(
					'meta_query' => array(
						'queries' => array(
							array(
								'meta_key'     => 'title',
								'meta_value'   => 'WordPress',
								'meta_compare' => 'LIKE',
							),
						),
					),
				),
				// Expected results.
				array(
					'is_aql'     => true,
					'meta_query' => array(
						array(
							'key'     => 'title',
							'value'   => 'WordPress',
							'compare' => 'LIKE',
						),
					),
				),
			),
		);
	}

	/**
	 * Test edge cases for meta queries
	 *
	 * @param array $custom_data      The params coming from AQL.
	 * @param array $expected_results The expected results to test against.
	 *
	 * @dataProvider data_edge_cases
	 */
	public function test_meta_query_edge_cases( $custom_data, $expected_results ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected_results, $qpg->get_query_args() );
	}
}
