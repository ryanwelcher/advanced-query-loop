<?php
/**
 * Tests for the Post_Parent Trait
 */

namespace AdvancedQueryLoop\UnitTests;

use AdvancedQueryLoop\Query_Params_Generator;
use PHPUnit\Framework\TestCase;

/**
 * Test the Post_Parent trait
 */
class Post_Parent_Tests extends TestCase {

	/**
	 * Data provider for tests that should not add post_parent
	 *
	 * @return array
	 */
	public function data_no_post_parent_added() {
		return array(
			'no post_parent param' => array(
				// Custom data.
				array(),
				// Expected.
				array( 'is_aql' => true ),
			),
			'empty post_parent'    => array(
				// Custom data.
				array(
					'post_parent' => '',
				),
				// Expected - empty string is not processed.
				array( 'is_aql' => true ),
			),
			'null post_parent'     => array(
				// Custom data.
				array(
					'post_parent' => null,
				),
				// Expected - null is not processed.
				array( 'is_aql' => true ),
			),
		);
	}

	/**
	 * Test that empty/null post_parent values are handled correctly
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_no_post_parent_added
	 */
	public function test_post_parent_empty_handling( $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}

	/**
	 * Data provider for valid post_parent ID tests
	 *
	 * @return array
	 */
	public function data_valid_post_parent_ids() {
		return array(
			'integer post_parent'        => array(
				// Custom data.
				array(
					'post_parent' => 123,
				),
				// Expected.
				array(
					'is_aql'      => true,
					'post_parent' => 123,
				),
			),
			'string numeric post_parent' => array(
				// Custom data.
				array(
					'post_parent' => '456',
				),
				// Expected.
				array(
					'is_aql'      => true,
					'post_parent' => '456',
				),
			),
			'zero post_parent'           => array(
				// Custom data.
				array(
					'post_parent' => 0,
				),
				// Expected - 0 is falsy, not processed by has_custom_param.
				array(
					'is_aql' => true,
				),
			),
			'negative post_parent'       => array(
				// Custom data.
				array(
					'post_parent' => -1,
				),
				// Expected - negative values preserved.
				array(
					'is_aql'      => true,
					'post_parent' => -1,
				),
			),
		);
	}

	/**
	 * Test valid post_parent ID values
	 *
	 * @param array $custom_data The params coming from AQL.
	 * @param array $expected    The expected results.
	 *
	 * @dataProvider data_valid_post_parent_ids
	 */
	public function test_valid_post_parent_ids( $custom_data, $expected ) {
		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$this->assertEquals( $expected, $qpg->get_query_args() );
	}

	/**
	 * Test post_parent with template slug (uses global $post)
	 */
	public function test_post_parent_with_template_slug() {
		// Set up global post object
		$GLOBALS['post'] = (object) array( 'ID' => 999 );

		$custom_data = array(
			'post_parent' => 'twentytwentyfour//page',
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Should use the global post ID
		$this->assertArrayHasKey( 'post_parent', $result );
		$this->assertEquals( 999, $result['post_parent'] );

		// Clean up
		unset( $GLOBALS['post'] );
	}

	/**
	 * Test post_parent with template slug when no global post exists
	 */
	public function test_post_parent_with_template_slug_no_global_post() {
		// Ensure no global post
		if ( isset( $GLOBALS['post'] ) ) {
			unset( $GLOBALS['post'] );
		}

		$custom_data = array(
			'post_parent' => 'twentytwentyfour//page',
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Should not add post_parent if no global post exists
		$this->assertArrayNotHasKey( 'post_parent', $result );
	}

	/**
	 * Data provider for template slug patterns
	 *
	 * @return array
	 */
	public function data_template_slug_patterns() {
		return array(
			'theme//template pattern'        => array(
				'twentytwentyfour//single',
			),
			'theme//nested/template pattern' => array(
				'mytheme//templates/archive',
			),
			'string with slashes and dashes' => array(
				'custom-theme//page-template',
			),
		);
	}

	/**
	 * Test various template slug patterns use global post
	 *
	 * @param string $template_slug The template slug to test.
	 *
	 * @dataProvider data_template_slug_patterns
	 */
	public function test_template_slug_patterns_use_global_post( $template_slug ) {
		// Set up global post object
		$GLOBALS['post'] = (object) array( 'ID' => 555 );

		$custom_data = array(
			'post_parent' => $template_slug,
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Should use the global post ID for all template patterns
		$this->assertEquals( 555, $result['post_parent'] );

		// Clean up
		unset( $GLOBALS['post'] );
	}

	/**
	 * Test post_parent works with other query params
	 */
	public function test_post_parent_with_other_params() {
		$custom_data = array(
			'post_parent'     => 100,
			'exclude_current' => 50,
		);

		$qpg = new Query_Params_Generator( array(), $custom_data );
		$qpg->process_all();

		$result = $qpg->get_query_args();

		// Should have both post_parent and post__not_in
		$this->assertArrayHasKey( 'post_parent', $result );
		$this->assertArrayHasKey( 'post__not_in', $result );
		$this->assertEquals( 100, $result['post_parent'] );
		$this->assertEquals( array( 50 ), $result['post__not_in'] );
	}
}
