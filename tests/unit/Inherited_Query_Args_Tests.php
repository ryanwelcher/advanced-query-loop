<?php
/**
 * Tests for Query_Params_Generator::get_inherited_query_args()
 */

namespace AdvancedQueryLoop\UnitTests;

use AdvancedQueryLoop\Query_Params_Generator;
use PHPUnit\Framework\TestCase;

/**
 * Inherited query args merging tests.
 */
class Inherited_Query_Args_Tests extends TestCase {

	/**
	 * Query vars as the main query would carry them on a taxonomy archive.
	 *
	 * @return array
	 */
	private function inherited_vars() {
		return array(
			'taxonomy'  => 'season',
			'term'      => 'season-one',
			'post_type' => 'post',
			'paged'     => 2,
			'order'     => 'DESC',
			'orderby'   => 'date',
		);
	}

	/**
	 * With no block params, the inherited vars pass through untouched
	 * (plus the is_aql marker the generator always adds).
	 */
	public function test_no_block_params_passes_inherited_vars_through() {
		$qpg = new Query_Params_Generator( $this->inherited_vars(), array() );
		$qpg->process_all();

		$expected           = $this->inherited_vars();
		$expected['is_aql'] = true;

		$this->assertEquals( $expected, $qpg->get_inherited_query_args() );
	}

	/**
	 * The archive context (taxonomy, term, paged) survives when advanced
	 * params are layered on top.
	 */
	public function test_meta_query_layers_on_top_of_archive_context() {
		$block_query = array(
			'meta_query' => array(
				'queries' => array(
					array(
						'id'           => 'abc-123',
						'meta_key'     => 'screening_date',
						'meta_value'   => '',
						'meta_compare' => 'EXISTS',
					),
				),
			),
		);

		$qpg = new Query_Params_Generator( $this->inherited_vars(), $block_query );
		$qpg->process_all();
		$args = $qpg->get_inherited_query_args();

		$this->assertSame( 'season', $args['taxonomy'] );
		$this->assertSame( 'season-one', $args['term'] );
		$this->assertSame( 2, $args['paged'] );
		$this->assertArrayHasKey( 'meta_query', $args );
	}

	/**
	 * A legacy inherit-mode block (perPage/order/orderBy only) produces
	 * the equivalent of the old hand-merged args: posts_per_page mapped,
	 * order passed through, orderby normalized by the OrderBy trait.
	 */
	public function test_legacy_order_only_block_matches_old_behavior() {
		$block_query = array(
			'perPage' => 6,
			'order'   => 'asc',
			'orderBy' => 'title',
		);

		$qpg = new Query_Params_Generator( $this->inherited_vars(), $block_query );
		$qpg->process_all();
		$args = $qpg->get_inherited_query_args();

		$this->assertSame( 6, $args['posts_per_page'] );
		$this->assertSame( 'asc', $args['order'] );
		$this->assertSame( 'title', $args['orderby'] );
	}

	/**
	 * The OrderBy trait's id → ID normalization applies on the
	 * inherited path too.
	 */
	public function test_orderby_id_is_normalized() {
		$qpg = new Query_Params_Generator(
			$this->inherited_vars(),
			array( 'orderBy' => 'id' )
		);
		$qpg->process_all();

		$this->assertSame( 'ID', $qpg->get_inherited_query_args()['orderby'] );
	}

	/**
	 * Unset core attributes must not inject keys: no posts_per_page
	 * unless the block set perPage, and the inherited order survives
	 * when the block does not carry one.
	 */
	public function test_unset_core_params_do_not_leak() {
		$qpg = new Query_Params_Generator(
			$this->inherited_vars(),
			array( 'exclude_current' => 10 )
		);
		$qpg->process_all();
		$args = $qpg->get_inherited_query_args();

		$this->assertArrayNotHasKey( 'posts_per_page', $args );
		$this->assertSame( 'DESC', $args['order'] );
		$this->assertEquals( array( 10 ), $args['post__not_in'] );
	}
}
