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

	public function test_tax_query_add_items_to_custom_tax_query() {

		$expected_query_args = [
			'tax_query' => [
				[
					'taxonomy'         => 'category',
					'terms'            => [ 1 ],
					'include_children' => true,
					'operator'         => 'IN',
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

		$default_params_from_block = [];

		$custom_params_from_aql = [
			'tax_query' => [
				'queries'  => [
					[
						'id'               => '9aa9887e-e61b-42e0-bc5d-3b8c60337a3b',
						'taxonomy'         => 'category',
						'terms'            => [ 'Uncategorized' ],
						'include_children' => true,
						'operator'         => 'IN',
					],
				],
			],
		];

		$qpg = new Query_Params_Generator( $default_params_from_block, $custom_params_from_aql );

		add_filter(
			'aql_query_vars',
			function ( $query_args, $default_params, $context ) {
				$query_args['tax_query'][] = array(
					'taxonomy'         => 'recipe_category',
					'field'            => 'slug',
					'terms'            => 'pasta',
					'operator'         => 'NOT IN',
					'include_children' => false,
				);
				return $query_args;
			},
			10,
			3
		);

		$qpg->process_all();
		$query_args          = $qpg->get_query_args();
		$filtered_query_args = \apply_filters(
			'aql_query_vars',
			$query_args,
			$default_params_from_block,
			false
		);
		// Assertions
		$this->assertSame( $expected_query_args, array_merge( $default_params_from_block, $filtered_query_args ) );
	}

	public function test_tax_query_add_items_to_default_tax_query() {}

}
