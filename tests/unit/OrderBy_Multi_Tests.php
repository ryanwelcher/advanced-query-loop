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
}
