<?php
/**
 * Tests for the Date_Query Trait
 */

namespace AdvancedQueryLoop\UnitTests;

use AdvancedQueryLoop\Query_Params_Generator;
use PHPUnit\Framework\TestCase;

/**
 * Define the test class
 */
class Date_Query_Tests extends TestCase {

	public function data_range_and_relationship_are_discreet() {
		return [
			[
				// Range takes precedence
				[
					'date_query' => [
						'range'        => 'last-month',
						'relation'     => 'before',
						'date_primary' => '2024-06-05T13:31:35',
					],
				],
				[
					'date_query' => [
						'before' => 'today',
						'after'  => 'first day of -1 months',
					],
				],
			],
			[
				// Empty range is ignored
				[
					'date_query' => [
						'range'        => '',
						'relation'     => 'before',
						'date_primary' => '2024-06-05T13:31:35',
					],
				],
				[
					'date_query' => [
						'before' => [
							'year'  => '2024',
							'month' => '06',
							'day'   => '05',
						],
					],
				],
			],
			[
				// Null range is ignored
				[
					'date_query' => [
						'range'        => null,
						'relation'     => 'before',
						'date_primary' => '2024-06-05T13:31:35',
					],
				],
				[
					'date_query' => [
						'before' => [
							'year'  => '2024',
							'month' => '06',
							'day'   => '05',
						],
					],
				],
			],
		];
	}

	/**
	 * Ranges and Relationships can't co-exist in they query
	 *
	 * @param array $custom_data      The data from the block.
	 * @param array $expected_results The expected results to test against.
	 *
	 * @dataProvider data_range_and_relationship_are_discreet
	 */
	public function test_range_and_relationship_are_discreet( $custom_data, $expected_results ) {
		$qpg = new Query_Params_Generator( [], $custom_data );
		$qpg->process_all();

		// Empty arrays return empty.
		$this->assertSame( $expected_results, $qpg->get_query_args() );
	}

	/**
	 * Data provider
	 */
	public function data_all_ranges_return_expected() {
		return [
			// Month
			[
				[
					'date_query' => [
						'range' => 'last-month',
					],
				],
				[
					'date_query' => [
						'before' => 'today',
						'after'  => 'first day of -1 months',
					],
				],
			],
			[
				[
					'date_query' => [
						'range' => 'three-months',
					],
				],
				[
					'date_query' => [
						'before' => 'today',
						'after'  => 'first day of -3 months',
					],
				],
			],
			[
				[
					'date_query' => [
						'range' => 'six-months',
					],
				],
				[
					'date_query' => [
						'before' => 'today',
						'after'  => 'first day of -6 months',
					],
				],
			],
			[
				[
					'date_query' => [
						'range' => 'twelve-months',
					],
				],
				[
					'date_query' => [
						'before' => 'today',
						'after'  => 'first day of -12 months',
					],
				],
			],
		];
	}

	/**
	 * Ensure range return the expected array
	 *
	 * @param array $custom_data      The data from the block.
	 * @param array $expected_results The expected results to test against.
	 *
	 * @dataProvider data_all_ranges_return_expected
	 */
	public function test_all_ranges_return_expected( $custom_data, $expected_results ) {
		$qpg = new Query_Params_Generator( [], $custom_data );
		$qpg->process_all();

		// Empty arrays return empty.
		$this->assertSame( $expected_results, $qpg->get_query_args() );

	}
}
