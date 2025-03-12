<?php
/**
 * Test the filter
 */
namespace AdvancedQueryLoop\Tests\Integration;

use AdvancedQueryLoop\Query_Params_Generator;

/**
 * Test the filter
 */
class AQL_Filter_Tests extends \WP_UnitTestCase {

	public function test_tax_query() {

		$expected_query_args = [
			'tax_query' => [
				[
					'taxonomy' => 'category',
					'field'    => 'slug',
					'terms'    => 'test',
				],
				[
					'taxonomy'         => 'recipe_category',
					'field'            => 'slug',
					'terms'            => 'pasta',
					'operator'         => 'NOT IN',
					'include_children' => false,
				],
			],
		];

		$default_query = [
			'tax_query' => [
				[
					'taxonomy' => 'category',
					'field'    => 'slug',
					'terms'    => 'test',
				],
			],
		];

		$block_query = [];

		$qpg = new Query_Params_Generator( $default_query, $block_query );

		add_filter(
			'aql_query_vars',
			function ( $query_args ) {
				$query_args['tax_query'][] = array(
					array(
						'taxonomy'         => 'recipe_category',
						'field'            => 'slug',
						'terms'            => 'pasta',
						'operator'         => 'NOT IN',
						'include_children' => false,
					),
				);
				return $query_args;
			}
		);

		$qpg->process_all();
		$query_args          = $qpg->get_query_args();
		$filtered_query_args = \apply_filters(
			'aql_query_vars',
			$query_args,
			$block_query,
			false
		);
		// Assertions
		$this->assertEqualsCanonicalizing( $expected_query_args, array_merge( $default_query, $filtered_query_args ) );
	}
}