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

	/**
	 * A block query carrying only params that don't override archive
	 * context (e.g. meta_query) must not pin the result set or change the
	 * post type inherited from the archive.
	 */
	public function test_block_query_without_context_overrides_leaves_post_type_and_post_in_untouched() {
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

		$this->assertArrayNotHasKey( 'post__in', $args );
		$this->assertSame( 'post', $args['post_type'] );
	}

	/**
	 * Mirrors the contract of the `unset()` call in the inherit branch of
	 * includes/query-loop.php: with `include_posts`, `multiple_posts`, and
	 * `exclude_current` removed from the block query (as the unset does
	 * before the generator ever sees them), the inherited query args carry
	 * no post__in, no post__not_in, and the inherited post_type is
	 * unchanged.
	 */
	public function test_block_query_with_context_overriding_params_removed_does_not_pin_archive() {
		$block_query = array(
			'orderBy'    => 'title',
			'order'      => 'asc',
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
			// include_posts, multiple_posts, and exclude_current are
			// intentionally absent here, simulating the unset() in
			// includes/query-loop.php.
		);

		$qpg = new Query_Params_Generator( $this->inherited_vars(), $block_query );
		$qpg->process_all();
		$args = $qpg->get_inherited_query_args();

		$this->assertArrayNotHasKey( 'post__in', $args );
		$this->assertArrayNotHasKey( 'post__not_in', $args );
		$this->assertSame( 'post', $args['post_type'] );
	}
}
