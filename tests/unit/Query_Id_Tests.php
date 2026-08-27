<?php
/**
 * Tests for the Query_Id Trait
 */

namespace AdvancedQueryLoop\UnitTests;

use AdvancedQueryLoop\Query_Params_Generator;
use PHPUnit\Framework\TestCase;

/**
 * Test the Query_Id trait
 */
class Query_Id_Tests extends TestCase {

	/**
	 * Data provider for tests that should not add aql_query_id
	 *
	 * @return array
	 */
	public function data_no_query_id() {
		return array(
			'no aql_query_id param'     => array(
				// Custom data.
				array(),
				// Expected.
				array( 'is_aql' => true ),
			),
			'empty string aql_query_id' => array(
				// Custom data.
				array(
					'aql_query_id' => '',
				),
				// Expected - empty string is falsy, not processed.
				array( 'is_aql' => true ),
			),
			'null aql_query_id'         => array(
				// Custom data.
				array(
					'aql_query_id' => null,
				),
				// Expected - null is falsy, not processed.
				array( 'is_aql' => true ),
			),
			'whitespace aql_query_id'   => array(
				// Custom data.
				array(
					'aql_query_id' => '   ',
				),
				// Expected - whitespace-only should be treated as empty.
				array( 'is_aql' => true ),
			),
			'array aql_query_id'        => array(
				// Custom data.
				array(
					'aql_query_id' => array( 'not-a-string' ),
				),
				// Expected - non-scalar values should be ignored.
				array( 'is_aql' => true ),
			),
		);
	}

	/**
	 * Test that empty/null identifier values are not added
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_no_query_id
	 */
	public function test_query_id_empty_handling( $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}

	/**
	 * Test that the identifier is passed through to the query args
	 */
	public function test_query_id_passed_through() {
		$qpg = new Query_Params_Generator( array(), array( 'aql_query_id' => 'homepage-featured' ) );
		$qpg->process_all();

		$this->assertEquals(
			array(
				'is_aql'       => true,
				'aql_query_id' => 'homepage-featured',
			),
			$qpg->get_query_args()
		);
	}

	/**
	 * Test the identifier works alongside other query params
	 */
	public function test_query_id_with_other_params() {
		$custom_data = array(
			'aql_query_id'    => 'sidebar-recent',
			'exclude_current' => 20,
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		$this->assertSame( 'sidebar-recent', $result['aql_query_id'] );
		$this->assertEquals( array( 20 ), $result['post__not_in'] );
	}

	/**
	 * Test that query_id is registered as an allowed control
	 */
	public function test_query_id_is_an_allowed_control() {
		$this->assertContains( 'query_id', Query_Params_Generator::get_allowed_controls() );
	}
}
