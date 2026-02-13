<?php
/**
 * Tests for the Include_Posts Trait
 */

namespace AdvancedQueryLoop\UnitTests;

use AdvancedQueryLoop\Query_Params_Generator;
use PHPUnit\Framework\TestCase;

/**
 * Test the Include_Posts trait
 */
class Include_Posts_Tests extends TestCase {

	/**
	 * Data provider for tests that should not add post__in
	 *
	 * @return array
	 */
	public function data_no_posts_included() {
		return array(
			'no include_posts param' => array(
				// Custom data.
				array(),
				// Expected.
				array( 'is_aql' => true ),
			),
			'empty include_posts array' => array(
				// Custom data.
				array(
					'include_posts' => array(),
				),
				// Expected - empty array is falsy, process method not called.
				array(
					'is_aql' => true,
				),
			),
			'null include_posts' => array(
				// Custom data.
				array(
					'include_posts' => null,
				),
				// Expected - null is not an array, returns empty.
				array( 'is_aql' => true ),
			),
			'string include_posts' => array(
				// Custom data.
				array(
					'include_posts' => 'not-an-array',
				),
				// Expected - string triggers process, returns empty array.
				array(
					'is_aql'   => true,
					'post__in' => array(),
				),
			),
		);
	}

	/**
	 * Test that empty/invalid include_posts are handled correctly
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_no_posts_included
	 */
	public function test_include_posts_empty_handling( $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}

	/**
	 * Data provider for single post tests
	 *
	 * @return array
	 */
	public function data_single_post() {
		return array(
			'single post with id key' => array(
				// Custom data.
				array(
					'include_posts' => array(
						array( 'id' => 123 ),
					),
				),
				// Expected results.
				array(
					'is_aql'   => true,
					'post__in' => array( 123 ),
				),
			),
			'single post with id and other data' => array(
				// Custom data.
				array(
					'include_posts' => array(
						array(
							'id'    => 456,
							'title' => 'Sample Post',
							'type'  => 'post',
						),
					),
				),
				// Expected results - only id is extracted.
				array(
					'is_aql'   => true,
					'post__in' => array( 456 ),
				),
			),
			'single post with numeric string id' => array(
				// Custom data.
				array(
					'include_posts' => array(
						array( 'id' => '789' ),
					),
				),
				// Expected results.
				array(
					'is_aql'   => true,
					'post__in' => array( '789' ),
				),
			),
		);
	}

	/**
	 * Test single post inclusion
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_single_post
	 */
	public function test_single_post_inclusion( $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}

	/**
	 * Data provider for multiple posts tests
	 *
	 * @return array
	 */
	public function data_multiple_posts() {
		return array(
			'two posts' => array(
				// Custom data.
				array(
					'include_posts' => array(
						array( 'id' => 10 ),
						array( 'id' => 20 ),
					),
				),
				// Expected results.
				array(
					'is_aql'   => true,
					'post__in' => array( 10, 20 ),
				),
			),
			'five posts with mixed data' => array(
				// Custom data.
				array(
					'include_posts' => array(
						array( 'id' => 100, 'title' => 'Post 1' ),
						array( 'id' => 200, 'title' => 'Post 2' ),
						array( 'id' => 300, 'title' => 'Post 3' ),
						array( 'id' => 400, 'title' => 'Post 4' ),
						array( 'id' => 500, 'title' => 'Post 5' ),
					),
				),
				// Expected results.
				array(
					'is_aql'   => true,
					'post__in' => array( 100, 200, 300, 400, 500 ),
				),
			),
			'posts with duplicate ids' => array(
				// Custom data.
				array(
					'include_posts' => array(
						array( 'id' => 99 ),
						array( 'id' => 88 ),
						array( 'id' => 99 ), // Duplicate
					),
				),
				// Expected results - duplicates preserved (WP_Query will handle).
				array(
					'is_aql'   => true,
					'post__in' => array( 99, 88, 99 ),
				),
			),
		);
	}

	/**
	 * Test multiple posts inclusion
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_multiple_posts
	 */
	public function test_multiple_posts_inclusion( $custom_data, $expected ) {
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
			'posts without id key returns empty' => array(
				// Custom data.
				array(
					'include_posts' => array(
						array( 'title' => 'Post without ID' ),
						array( 'slug' => 'another-post' ),
					),
				),
				// Expected results - array_column filters out missing keys.
				array(
					'is_aql'   => true,
					'post__in' => array(),
				),
			),
			'mixed posts with and without id' => array(
				// Custom data.
				array(
					'include_posts' => array(
						array( 'id' => 111 ),
						array( 'title' => 'No ID here' ),
						array( 'id' => 222 ),
					),
				),
				// Expected results - entry without id is skipped.
				array(
					'is_aql'   => true,
					'post__in' => array( 111, 222 ),
				),
			),
			'post with id value of zero' => array(
				// Custom data.
				array(
					'include_posts' => array(
						array( 'id' => 0 ),
					),
				),
				// Expected results - zero is a valid value.
				array(
					'is_aql'   => true,
					'post__in' => array( 0 ),
				),
			),
			'post with negative id' => array(
				// Custom data.
				array(
					'include_posts' => array(
						array( 'id' => -1 ),
					),
				),
				// Expected results - negative values preserved.
				array(
					'is_aql'   => true,
					'post__in' => array( -1 ),
				),
			),
			'post with empty string id' => array(
				// Custom data.
				array(
					'include_posts' => array(
						array( 'id' => '' ),
					),
				),
				// Expected results.
				array(
					'is_aql'   => true,
					'post__in' => array( '' ),
				),
			),
			'large number of posts' => array(
				// Custom data.
				array(
					'include_posts' => array_map(
						function( $i ) {
							return array( 'id' => $i );
						},
						range( 1, 100 )
					),
				),
				// Expected results.
				array(
					'is_aql'   => true,
					'post__in' => range( 1, 100 ),
				),
			),
		);
	}

	/**
	 * Test edge cases for include_posts
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_edge_cases
	 */
	public function test_include_posts_edge_cases( $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}

	/**
	 * Test that include_posts works with other query params
	 */
	public function test_include_posts_with_other_params() {
		$custom_data = array(
			'include_posts' => array(
				array( 'id' => 10 ),
				array( 'id' => 20 ),
			),
			'exclude_current' => 1,
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Should have both post__in and post__not_in
		$this->assertArrayHasKey( 'post__in', $result );
		$this->assertArrayHasKey( 'post__not_in', $result );
		$this->assertEquals( array( 10, 20 ), $result['post__in'] );
		$this->assertEquals( array( 1 ), $result['post__not_in'] );
	}
}
