<?php
/**
 * Tests for multi-property ordering in the OrderBy Trait
 */

namespace AdvancedQueryLoop\UnitTests;

use AdvancedQueryLoop\Query_Params_Generator;
use PHPUnit\Framework\TestCase;

/**
 * Test the OrderBy trait multi-property ordering
 */
class OrderBy_Multi_Tests extends TestCase {

	private function generate( array $custom ): array {
		$generator = new Query_Params_Generator( array(), $custom );
		$generator->process_all();
		return $generator->get_query_args();
	}

	public function test_single_orderby_stays_a_string() {
		$args = $this->generate( array( 'orderBy' => 'title' ) );
		$this->assertSame( 'title', $args['orderby'] );
	}

	public function test_single_id_normalization_unchanged() {
		$args = $this->generate( array( 'orderBy' => 'id' ) );
		$this->assertSame( 'ID', $args['orderby'] );
	}

	public function test_secondary_orderby_produces_array() {
		$args = $this->generate(
			array(
				'orderBy'           => 'title',
				'order'             => 'asc',
				'secondary_orderby' => array(
					'order_by' => 'date',
					'order'    => 'desc',
				),
			)
		);
		$this->assertSame(
			array(
				'title' => 'ASC',
				'date'  => 'DESC',
			),
			$args['orderby']
		);
	}

	public function test_secondary_orderby_normalizes_id() {
		$args = $this->generate(
			array(
				'orderBy'           => 'date',
				'order'             => 'desc',
				'secondary_orderby' => array(
					'order_by' => 'id',
					'order'    => 'asc',
				),
			)
		);
		$this->assertSame(
			array(
				'date' => 'DESC',
				'ID'   => 'ASC',
			),
			$args['orderby']
		);
	}

	public function test_missing_order_values_default_sensibly() {
		// No 'order' params provided: primary and secondary default to DESC.
		$args = $this->generate(
			array(
				'orderBy'           => 'title',
				'secondary_orderby' => array( 'order_by' => 'date' ),
			)
		);
		$this->assertSame(
			array(
				'title' => 'DESC',
				'date'  => 'DESC',
			),
			$args['orderby']
		);
	}

	public function test_empty_secondary_orderby_keeps_string_path() {
		$args = $this->generate(
			array(
				'orderBy'           => 'title',
				'secondary_orderby' => array(),
			)
		);
		$this->assertSame( 'title', $args['orderby'] );
	}

	public function test_primary_meta_value_sort_builds_named_clauses() {
		$args = $this->generate(
			array(
				'orderBy'          => 'meta_value',
				'order'            => 'desc',
				'orderby_meta_key' => '_is_ns_featured_post',
			)
		);

		$this->assertSame( array( 'aql_orderby_primary' => 'DESC' ), $args['orderby'] );

		// The REFERENCED clause (the one orderby points at) must be the keyed
		// NOT EXISTS clause; the unrestricted EXISTS clause is the sibling.
		$this->assertSame(
			array(
				'relation'                   => 'OR',
				'aql_orderby_primary'        => array(
					'key'     => '_is_ns_featured_post',
					'compare' => 'NOT EXISTS',
				),
				'aql_orderby_primary_exists' => array(
					'key'     => '_is_ns_featured_post',
					'compare' => 'EXISTS',
				),
			),
			$args['meta_query']
		);
	}

	public function test_meta_value_num_sets_numeric_type_on_referenced_clause() {
		$args = $this->generate(
			array(
				'orderBy'          => 'meta_value_num',
				'orderby_meta_key' => 'price',
			)
		);

		// NUMERIC belongs on the clause the orderby references, since that is
		// the value WP_Query casts and sorts on.
		$this->assertSame(
			'NUMERIC',
			$args['meta_query']['aql_orderby_primary']['type']
		);
		$this->assertArrayNotHasKey(
			'type',
			$args['meta_query']['aql_orderby_primary_exists']
		);
		$this->assertSame(
			'NOT EXISTS',
			$args['meta_query']['aql_orderby_primary']['compare']
		);
	}

	public function test_featured_first_then_date_scenario() {
		// The exact use case from issue #162.
		$args = $this->generate(
			array(
				'orderBy'           => 'meta_value',
				'order'             => 'desc',
				'orderby_meta_key'  => '_is_ns_featured_post',
				'secondary_orderby' => array(
					'order_by' => 'date',
					'order'    => 'desc',
				),
			)
		);
		$this->assertSame(
			array(
				'aql_orderby_primary' => 'DESC',
				'date'                => 'DESC',
			),
			$args['orderby']
		);
		$this->assertArrayHasKey( 'aql_orderby_primary', $args['meta_query'] );
	}

	public function test_secondary_meta_sort_uses_secondary_clause_names() {
		$args = $this->generate(
			array(
				'orderBy'           => 'date',
				'secondary_orderby' => array(
					'order_by' => 'meta_value',
					'order'    => 'asc',
					'meta_key' => 'subtitle',
				),
			)
		);
		$this->assertSame(
			array(
				'date'                  => 'DESC',
				'aql_orderby_secondary' => 'ASC',
			),
			$args['orderby']
		);
		$this->assertSame(
			array(
				'key'     => 'subtitle',
				'compare' => 'NOT EXISTS',
			),
			$args['meta_query']['aql_orderby_secondary']
		);
		$this->assertSame(
			array(
				'key'     => 'subtitle',
				'compare' => 'EXISTS',
			),
			$args['meta_query']['aql_orderby_secondary_exists']
		);
	}

	public function test_ordering_clauses_merge_with_user_meta_query() {
		$args = $this->generate(
			array(
				'orderBy'          => 'meta_value',
				'orderby_meta_key' => '_is_ns_featured_post',
				'meta_query'       => array(
					'relation' => 'AND',
					'queries'  => array(
						array(
							'meta_key'     => 'color',
							'meta_value'   => 'blue',
							'meta_compare' => '=',
						),
					),
				),
			)
		);

		// Outer wrapper is AND of ( user query, ordering clause pair ).
		$this->assertSame( 'AND', $args['meta_query']['relation'] );
		$this->assertCount( 3, $args['meta_query'] ); // relation + 2 groups.
		$ordering_group = end( $args['meta_query'] );
		$this->assertSame( 'OR', $ordering_group['relation'] );
		$this->assertArrayHasKey( 'aql_orderby_primary', $ordering_group );
	}

	/**
	 * The REST path (block editor preview) sends the primary sort under the
	 * lowercase 'orderby' key. Same inputs must produce identical output.
	 */
	public function test_lowercase_orderby_matches_camel_case() {
		$input = array(
			'order'             => 'desc',
			'orderby_meta_key'  => '_is_ns_featured_post',
			'secondary_orderby' => array(
				'order_by' => 'date',
				'order'    => 'desc',
			),
		);

		$camel = $this->generate( array_merge( $input, array( 'orderBy' => 'meta_value' ) ) );
		$lower = $this->generate( array_merge( $input, array( 'orderby' => 'meta_value' ) ) );

		$this->assertSame( $camel['orderby'], $lower['orderby'] );
		$this->assertSame( $camel['meta_query'], $lower['meta_query'] );
	}

	public function test_lowercase_orderby_alone_is_processed() {
		$args = $this->generate( array( 'orderby' => 'title' ) );
		$this->assertSame( 'title', $args['orderby'] );
	}

	/**
	 * A secondary sort can arrive without any primary orderBy key at all.
	 * The primary rule is skipped entirely (no broken null entry) and the
	 * secondary rule stands alone, keeping its own direction.
	 */
	public function test_secondary_without_primary_orderby_stands_alone() {
		$args = $this->generate(
			array(
				'secondary_orderby' => array(
					'order_by' => 'title',
					'order'    => 'asc',
				),
			)
		);
		$this->assertSame( array( 'title' => 'ASC' ), $args['orderby'] );
		$this->assertArrayNotHasKey( '', $args['orderby'] );
	}

	public function test_orderby_meta_key_alone_is_a_no_op() {
		// Nothing to order by: no orderby arg is emitted at all.
		$args = $this->generate( array( 'orderby_meta_key' => 'price' ) );
		$this->assertArrayNotHasKey( 'orderby', $args );
		$this->assertArrayNotHasKey( 'meta_query', $args );
	}

	/**
	 * A secondary rule that normalizes to the same orderby key as the primary
	 * (possible via saved attributes or UI resets) must not overwrite the
	 * primary's direction — the duplicate secondary is dropped instead.
	 */
	public function test_duplicate_secondary_property_is_dropped() {
		$args = $this->generate(
			array(
				'orderBy'           => 'date',
				'order'             => 'desc',
				'secondary_orderby' => array(
					'order_by' => 'date',
					'order'    => 'asc',
				),
			)
		);
		// Collapses back to the single plain primary rule (string path).
		$this->assertSame( 'date', $args['orderby'] );
	}

	public function test_duplicate_after_id_normalization_is_dropped() {
		$args = $this->generate(
			array(
				'orderBy'           => 'id',
				'order'             => 'desc',
				'secondary_orderby' => array(
					'order_by' => 'id',
					'order'    => 'asc',
				),
			)
		);
		$this->assertSame( 'ID', $args['orderby'] );
	}

	public function test_meta_orderby_without_key_falls_back_to_plain() {
		// No orderby_meta_key: keep today's behavior (plain meta_value string,
		// key supplied by the user's meta query as before).
		$args = $this->generate( array( 'orderBy' => 'meta_value' ) );
		$this->assertSame( 'meta_value', $args['orderby'] );
		$this->assertArrayNotHasKey( 'meta_query', $args );
	}
}
