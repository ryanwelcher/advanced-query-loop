<?php
/**
 * Tests for the Tax_Query Trait
 */

namespace AdvancedQueryLoop\UnitTests;

use AdvancedQueryLoop\Query_Params_Generator;
use PHPUnit\Framework\TestCase;

/**
 * Test the Tax_Query trait
 */
class Tax_Query_Tests extends TestCase {

	/**
	 * Data provider for empty/null tax query tests
	 *
	 * @return array
	 */
	public function data_no_tax_query_added() {
		return array(
			'no tax_query param'                 => array(
				// Custom data.
				array(),
				// Expected.
				array( 'is_aql' => true ),
			),
			'empty tax_query array'              => array(
				// Custom data.
				array(
					'tax_query' => array(),
				),
				// Expected.
				array( 'is_aql' => true ),
			),
			'tax_query without queries'          => array(
				// Custom data.
				array(
					'tax_query' => array(
						'relation' => 'AND',
					),
				),
				// Expected.
				array(
					'is_aql'    => true,
					'tax_query' => array(),
				),
			),
			'tax_query with empty queries array' => array(
				// Custom data.
				array(
					'tax_query' => array(
						'queries' => array(),
					),
				),
				// Expected.
				array(
					'is_aql'    => true,
					'tax_query' => array(),
				),
			),
		);
	}

	/**
	 * Test that empty/null tax queries are handled correctly
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_no_tax_query_added
	 */
	public function test_tax_query_empty_handling( $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}

	/**
	 * Data provider for single taxonomy query tests
	 *
	 * @return array
	 */
	public function data_single_tax_query() {
		return array(
			'single taxonomy with one term'        => array(
				// Custom data.
				array(
					'tax_query' => array(
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
				),
				// Expected results.
				array(
					'is_aql'    => true,
					'tax_query' => array(
						array(
							'taxonomy'         => 'category',
							'terms'            => array( 1 ), // 'News' converts to term_id 1
							'field'            => 'term_id',
							'operator'         => 'IN',
							'include_children' => true,
						),
					),
				),
			),
			'single taxonomy with multiple terms'  => array(
				// Custom data.
				array(
					'tax_query' => array(
						'queries' => array(
							array(
								'taxonomy'         => 'category',
								'terms'            => array( 'News', 'Technology', 'Sports' ),
								'field'            => 'term_id',
								'operator'         => 'IN',
								'include_children' => false,
							),
						),
					),
				),
				// Expected results.
				array(
					'is_aql'    => true,
					'tax_query' => array(
						array(
							'taxonomy'         => 'category',
							'terms'            => array( 1, 2, 3 ),
							'field'            => 'term_id',
							'operator'         => 'IN',
							'include_children' => false,
						),
					),
				),
			),
			'single taxonomy with NOT IN operator' => array(
				// Custom data.
				array(
					'tax_query' => array(
						'queries' => array(
							array(
								'taxonomy'         => 'post_tag',
								'terms'            => array( 'Featured' ),
								'field'            => 'term_id',
								'operator'         => 'NOT IN',
								'include_children' => false,
							),
						),
					),
				),
				// Expected results.
				array(
					'is_aql'    => true,
					'tax_query' => array(
						array(
							'taxonomy'         => 'post_tag',
							'terms'            => array( 10 ),
							'field'            => 'term_id',
							'operator'         => 'NOT IN',
							'include_children' => false,
						),
					),
				),
			),
		);
	}

	/**
	 * Test single taxonomy queries
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_single_tax_query
	 */
	public function test_single_tax_query( $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}

	/**
	 * Data provider for multiple taxonomy query tests
	 *
	 * @return array
	 */
	public function data_multiple_tax_queries() {
		return array(
			'two taxonomies with AND relation'       => array(
				// Custom data.
				array(
					'tax_query' => array(
						'relation' => 'AND',
						'queries'  => array(
							array(
								'taxonomy'         => 'category',
								'terms'            => array( 'News' ),
								'field'            => 'term_id',
								'operator'         => 'IN',
								'include_children' => true,
							),
							array(
								'taxonomy'         => 'post_tag',
								'terms'            => array( 'Featured' ),
								'field'            => 'term_id',
								'operator'         => 'IN',
								'include_children' => false,
							),
						),
					),
				),
				// Expected results.
				array(
					'is_aql'    => true,
					'tax_query' => array(
						'relation' => 'AND',
						array(
							'taxonomy'         => 'category',
							'terms'            => array( 1 ),
							'field'            => 'term_id',
							'operator'         => 'IN',
							'include_children' => true,
						),
						array(
							'taxonomy'         => 'post_tag',
							'terms'            => array( 10 ),
							'field'            => 'term_id',
							'operator'         => 'IN',
							'include_children' => false,
						),
					),
				),
			),
			'three taxonomies with OR relation'      => array(
				// Custom data.
				array(
					'tax_query' => array(
						'relation' => 'OR',
						'queries'  => array(
							array(
								'taxonomy'         => 'category',
								'terms'            => array( 'News' ),
								'field'            => 'term_id',
								'operator'         => 'IN',
								'include_children' => true,
							),
							array(
								'taxonomy'         => 'post_tag',
								'terms'            => array( 'Featured', 'Popular' ),
								'field'            => 'term_id',
								'operator'         => 'IN',
								'include_children' => false,
							),
							array(
								'taxonomy'         => 'custom_tax',
								'terms'            => array( 'Custom Term' ),
								'field'            => 'term_id',
								'operator'         => 'IN',
								'include_children' => false,
							),
						),
					),
				),
				// Expected results.
				array(
					'is_aql'    => true,
					'tax_query' => array(
						'relation' => 'OR',
						array(
							'taxonomy'         => 'category',
							'terms'            => array( 1 ),
							'field'            => 'term_id',
							'operator'         => 'IN',
							'include_children' => true,
						),
						array(
							'taxonomy'         => 'post_tag',
							'terms'            => array( 10, 11 ),
							'field'            => 'term_id',
							'operator'         => 'IN',
							'include_children' => false,
						),
						array(
							'taxonomy'         => 'custom_tax',
							'terms'            => array( 100 ),
							'field'            => 'term_id',
							'operator'         => 'IN',
							'include_children' => false,
						),
					),
				),
			),
			'single query does not include relation' => array(
				// Custom data.
				array(
					'tax_query' => array(
						'relation' => 'AND',
						'queries'  => array(
							array(
								'taxonomy'         => 'category',
								'terms'            => array( 'News' ),
								'field'            => 'term_id',
								'operator'         => 'IN',
								'include_children' => true,
							),
						),
					),
				),
				// Expected results - relation not included for single query.
				array(
					'is_aql'    => true,
					'tax_query' => array(
						array(
							'taxonomy'         => 'category',
							'terms'            => array( 1 ),
							'field'            => 'term_id',
							'operator'         => 'IN',
							'include_children' => true,
						),
					),
				),
			),
		);
	}

	/**
	 * Test multiple taxonomy queries with relations
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_multiple_tax_queries
	 */
	public function test_multiple_tax_queries( $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}

	/**
	 * Data provider for edge case tests
	 *
	 * @return array
	 */
	public function data_edge_cases() {
		return array(
			'query with id field gets filtered out'       => array(
				// Custom data.
				array(
					'tax_query' => array(
						'queries' => array(
							array(
								'id'               => 'some-id',
								'taxonomy'         => 'category',
								'terms'            => array( 'News' ),
								'field'            => 'term_id',
								'operator'         => 'IN',
								'include_children' => true,
							),
						),
					),
				),
				// Expected results - id field removed.
				array(
					'is_aql'    => true,
					'tax_query' => array(
						array(
							'taxonomy'         => 'category',
							'terms'            => array( 1 ),
							'field'            => 'term_id',
							'operator'         => 'IN',
							'include_children' => true,
						),
					),
				),
			),
			'query with invalid term name filters it out' => array(
				// Custom data.
				array(
					'tax_query' => array(
						'queries' => array(
							array(
								'taxonomy'         => 'category',
								'terms'            => array( 'News', 'InvalidTerm', 'Technology' ),
								'field'            => 'term_id',
								'operator'         => 'IN',
								'include_children' => false,
							),
						),
					),
				),
				// Expected results - InvalidTerm filtered out, array keys preserved.
				array(
					'is_aql'    => true,
					'tax_query' => array(
						array(
							'taxonomy'         => 'category',
							'terms'            => array(
								0 => 1,
								2 => 2,
							), // Keys preserved from original array
							'field'            => 'term_id',
							'operator'         => 'IN',
							'include_children' => false,
						),
					),
				),
			),
			'query with all invalid terms results in empty terms' => array(
				// Custom data.
				array(
					'tax_query' => array(
						'queries' => array(
							array(
								'taxonomy'         => 'category',
								'terms'            => array( 'InvalidTerm1', 'InvalidTerm2' ),
								'field'            => 'term_id',
								'operator'         => 'IN',
								'include_children' => false,
							),
						),
					),
				),
				// Expected results - query added but with empty terms array.
				array(
					'is_aql'    => true,
					'tax_query' => array(
						array(
							'taxonomy'         => 'category',
							'terms'            => array(),
							'field'            => 'term_id',
							'operator'         => 'IN',
							'include_children' => false,
						),
					),
				),
			),
			'include_children handles string values'      => array(
				// Custom data.
				array(
					'tax_query' => array(
						'queries' => array(
							array(
								'taxonomy'         => 'category',
								'terms'            => array( 'News' ),
								'field'            => 'term_id',
								'operator'         => 'IN',
								'include_children' => 'true',
							),
						),
					),
				),
				// Expected results - string 'true' converted to boolean.
				array(
					'is_aql'    => true,
					'tax_query' => array(
						array(
							'taxonomy'         => 'category',
							'terms'            => array( 1 ),
							'field'            => 'term_id',
							'operator'         => 'IN',
							'include_children' => true,
						),
					),
				),
			),
			'query without taxonomy is skipped'           => array(
				// Custom data.
				array(
					'tax_query' => array(
						'queries' => array(
							array(
								'terms'            => array( 'News' ),
								'field'            => 'term_id',
								'operator'         => 'IN',
								'include_children' => true,
							),
						),
					),
				),
				// Expected results - query without taxonomy skipped.
				array(
					'is_aql'    => true,
					'tax_query' => array(),
				),
			),
			'query without terms is skipped'              => array(
				// Custom data.
				array(
					'tax_query' => array(
						'queries' => array(
							array(
								'taxonomy'         => 'category',
								'field'            => 'term_id',
								'operator'         => 'IN',
								'include_children' => true,
							),
						),
					),
				),
				// Expected results - query without terms skipped.
				array(
					'is_aql'    => true,
					'tax_query' => array(),
				),
			),
		);
	}

	/**
	 * Test edge cases for tax queries
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_edge_cases
	 */
	public function test_tax_query_edge_cases( $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}
}
