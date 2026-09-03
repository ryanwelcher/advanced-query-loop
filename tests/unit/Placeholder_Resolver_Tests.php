<?php
/**
 * Tests for the Placeholder_Resolver class.
 */

namespace AdvancedQueryLoop\UnitTests;

use AdvancedQueryLoop\Placeholder_Resolver;
use AdvancedQueryLoop\Query_Params_Generator;
use PHPUnit\Framework\TestCase;

/**
 * Test the Placeholder_Resolver class.
 */
class Placeholder_Resolver_Tests extends TestCase {

	protected function tearDown(): void {
		$GLOBALS['aql_test_filters'] = array();
		parent::tearDown();
	}

	/**
	 * Params with no tokens must come back byte-identical (backwards compat).
	 */
	public function test_token_free_params_pass_through_unchanged() {
		$params = array(
			'postType'   => 'post',
			'perPage'    => 10,
			'exclude'    => array( 1, 2 ),
			'meta_query' => array(
				'relation' => 'AND',
				'queries'  => array(
					array(
						'meta_key'   => 'color',
						'meta_value' => 'blue',
					),
				),
			),
		);

		$this->assertSame(
			$params,
			Placeholder_Resolver::resolve_params( $params, array( 'post_id' => 42 ) )
		);
	}

	/**
	 * A token nested inside meta_query resolves from context.
	 */
	public function test_current_post_id_resolves_in_nested_meta_query() {
		$params = array(
			'meta_query' => array(
				'queries' => array(
					array(
						'meta_key'   => 'related_post',
						'meta_value' => '{aql:current_post_id}',
					),
				),
			),
		);

		$resolved = Placeholder_Resolver::resolve_params( $params, array( 'post_id' => 42 ) );

		$this->assertSame(
			'42',
			$resolved['meta_query']['queries'][0]['meta_value']
		);
	}

	/**
	 * Tokens substitute inline inside longer strings.
	 */
	public function test_inline_substitution_within_string() {
		$params   = array( 'meta_value' => 'prefix-{aql:current_post_id}-suffix' );
		$resolved = Placeholder_Resolver::resolve_params( $params, array( 'post_id' => 7 ) );

		$this->assertSame( 'prefix-7-suffix', $resolved['meta_value'] );
	}

	/**
	 * Unknown token names pass through verbatim (backwards compat).
	 */
	public function test_unknown_token_passes_through_verbatim() {
		$params   = array( 'meta_value' => '{aql:not_a_thing}' );
		$resolved = Placeholder_Resolver::resolve_params( $params, array( 'post_id' => 7 ) );

		$this->assertSame( '{aql:not_a_thing}', $resolved['meta_value'] );
	}

	/**
	 * A known token with no value in context stays in the value verbatim.
	 */
	public function test_known_token_without_context_value_stays_verbatim() {
		$params = array(
			'meta_key'   => 'related_post',
			'meta_value' => '{aql:current_post_id}',
		);

		$resolved = Placeholder_Resolver::resolve_params( $params, array( 'post_id' => 0 ) );

		$this->assertSame( '{aql:current_post_id}', $resolved['meta_value'] );
		$this->assertSame( 'related_post', $resolved['meta_key'] );
	}

	/**
	 * A param that was already an empty string is NOT dropped.
	 */
	public function test_pre_existing_empty_string_is_not_dropped() {
		$params   = array( 'meta_value' => '' );
		$resolved = Placeholder_Resolver::resolve_params( $params, array( 'post_id' => 0 ) );

		$this->assertSame( array( 'meta_value' => '' ), $resolved );
	}

	/**
	 * The aql_resolve_placeholder filter can resolve custom token names.
	 */
	public function test_filter_resolves_custom_token() {
		$GLOBALS['aql_test_filters']['aql_resolve_placeholder'][] = function ( $resolved, $name ) {
			if ( 'my_custom' === $name ) {
				return '123';
			}
			return $resolved;
		};

		$params   = array( 'meta_value' => '{aql:my_custom}' );
		$resolved = Placeholder_Resolver::resolve_params( $params, array( 'post_id' => 0 ) );

		$this->assertSame( '123', $resolved['meta_value'] );
	}

	/**
	 * The filter can override a built-in resolution.
	 */
	public function test_filter_overrides_built_in() {
		$GLOBALS['aql_test_filters']['aql_resolve_placeholder'][] = function ( $resolved, $name ) {
			if ( 'current_post_id' === $name ) {
				return '999';
			}
			return $resolved;
		};

		$params   = array( 'meta_value' => '{aql:current_post_id}' );
		$resolved = Placeholder_Resolver::resolve_params( $params, array( 'post_id' => 42 ) );

		$this->assertSame( '999', $resolved['meta_value'] );
	}

	/**
	 * Non-string scalars (bools, ints) pass through untouched.
	 */
	public function test_non_string_values_untouched() {
		$params   = array(
			'is_aql'   => true,
			'per_page' => 5,
			'offset'   => null,
		);
		$resolved = Placeholder_Resolver::resolve_params( $params, array( 'post_id' => 42 ) );

		$this->assertSame( $params, $resolved );
	}

	/**
	 * Data provider: context-backed tokens.
	 */
	public function data_context_tokens() {
		return array(
			'author_id resolves'                           => array(
				array( 'meta_value' => '{aql:author_id}' ),
				array( 'author_id' => 12 ),
				array( 'meta_value' => '12' ),
			),
			'user_id resolves'                             => array(
				array( 'meta_value' => '{aql:user_id}' ),
				array( 'user_id' => 3 ),
				array( 'meta_value' => '3' ),
			),
			'user_id empty when logged out stays verbatim' => array(
				array( 'meta_value' => '{aql:user_id}' ),
				array( 'user_id' => 0 ),
				array( 'meta_value' => '{aql:user_id}' ),
			),
			'current_post_parent_id resolves'              => array(
				array( 'post_parent' => '{aql:current_post_parent_id}' ),
				array( 'post_parent_id' => 42 ),
				array( 'post_parent' => '42' ),
			),
			'current_post_parent_id on top-level post stays verbatim' => array(
				array( 'meta_value' => '{aql:current_post_parent_id}' ),
				array( 'post_parent_id' => 0 ),
				array( 'meta_value' => '{aql:current_post_parent_id}' ),
			),
			'current_term_id resolves'                     => array(
				array( 'meta_value' => '{aql:current_term_id}' ),
				array( 'term_id' => 7 ),
				array( 'meta_value' => '7' ),
			),
			'current_term_id outside archive stays verbatim' => array(
				array( 'meta_value' => '{aql:current_term_id}' ),
				array( 'term_id' => 0 ),
				array( 'meta_value' => '{aql:current_term_id}' ),
			),
		);
	}

	/**
	 * Test context-backed tokens.
	 *
	 * @dataProvider data_context_tokens
	 *
	 * @param array $params   The params array.
	 * @param array $context  The context array.
	 * @param array $expected The expected resolved params.
	 */
	public function test_context_tokens( $params, $context, $expected ) {
		$this->assertSame(
			$expected,
			Placeholder_Resolver::resolve_params( $params, $context )
		);
	}

	/**
	 * Data provider: date tokens and their strtotime modifiers.
	 */
	public function data_date_tokens() {
		return array(
			'current_date'         => array( 'current_date', 'now', 'Y-m-d' ),
			'current_date_compact' => array( 'current_date_compact', 'now', 'Ymd' ),
			'current_datetime'     => array( 'current_datetime', 'now', 'Y-m-d H:i:s' ),
			'current_time'         => array( 'current_time', 'now', 'H:i:s' ),
			'current_year'         => array( 'current_year', 'now', 'Y' ),
			'current_month'        => array( 'current_month', 'now', 'm' ),
			'current_day'          => array( 'current_day', 'now', 'd' ),
			'current_hour'         => array( 'current_hour', 'now', 'H' ),
			'current_week'         => array( 'current_week', 'now', 'W' ),
			'date_minus_1_month'   => array( 'date_minus_1_month', '-1 month', 'Y-m-d' ),
			'date_minus_3_months'  => array( 'date_minus_3_months', '-3 months', 'Y-m-d' ),
			'date_minus_6_months'  => array( 'date_minus_6_months', '-6 months', 'Y-m-d' ),
			'date_minus_12_months' => array( 'date_minus_12_months', '-12 months', 'Y-m-d' ),
			'date_plus_1_month'    => array( 'date_plus_1_month', '+1 month', 'Y-m-d' ),
			'date_plus_3_months'   => array( 'date_plus_3_months', '+3 months', 'Y-m-d' ),
			'date_plus_6_months'   => array( 'date_plus_6_months', '+6 months', 'Y-m-d' ),
			'date_plus_12_months'  => array( 'date_plus_12_months', '+12 months', 'Y-m-d' ),
		);
	}

	/**
	 * Test date tokens resolve to the expected format.
	 *
	 * @dataProvider data_date_tokens
	 *
	 * @param string $token_name The token name.
	 * @param string $modifier   The strtotime modifier.
	 * @param string $format     The expected date() format.
	 */
	public function test_date_tokens( $token_name, $modifier, $format ) {
		$params   = array( 'meta_value' => '{aql:' . $token_name . '}' );
		$resolved = Placeholder_Resolver::resolve_params( $params, array() );

		// Computed the same way as the implementation to avoid midnight flakes.
		$expected = gmdate( $format, strtotime( $modifier, time() ) );

		$this->assertSame( $expected, $resolved['meta_value'] );
	}

	/**
	 * Date parts are zero-padded so they compose into valid dates.
	 */
	public function test_date_parts_are_zero_padded() {
		$resolved = Placeholder_Resolver::resolve_params(
			array( 'meta_value' => '{aql:current_year}-{aql:current_month}-{aql:current_day}' ),
			array()
		);

		$this->assertRegExp( '/^\d{4}-\d{2}-\d{2}$/', $resolved['meta_value'] );
		$this->assertSame( gmdate( 'Y-m-d' ), $resolved['meta_value'] );
	}

	/**
	 * The timestamp token is a Unix timestamp close to now.
	 */
	public function test_current_timestamp_token() {
		$before   = time();
		$resolved = Placeholder_Resolver::resolve_params(
			array( 'meta_value' => '{aql:current_timestamp}' ),
			array()
		);

		$this->assertRegExp( '/^\d+$/', $resolved['meta_value'] );
		$this->assertGreaterThanOrEqual( $before, (int) $resolved['meta_value'] );
		$this->assertLessThanOrEqual( time(), (int) $resolved['meta_value'] );
	}

	/**
	 * Every built-in placeholder has a list entry with label and description,
	 * and every list entry resolves (no orphans in either direction).
	 */
	public function test_placeholder_list_matches_built_ins() {
		$list  = Placeholder_Resolver::get_placeholder_list();
		$names = array_column( $list, 'name' );

		$expected_names = array(
			'current_post_id',
			'current_post_parent_id',
			'author_id',
			'user_id',
			'current_term_id',
			'current_date',
			'current_date_compact',
			'current_datetime',
			'current_time',
			'current_timestamp',
			'current_year',
			'current_month',
			'current_day',
			'current_hour',
			'current_week',
			'date_minus_1_month',
			'date_minus_3_months',
			'date_minus_6_months',
			'date_minus_12_months',
			'date_plus_1_month',
			'date_plus_3_months',
			'date_plus_6_months',
			'date_plus_12_months',
		);

		$this->assertSame( $expected_names, $names );

		foreach ( $list as $row ) {
			$this->assertNotEmpty( $row['label'] );
			$this->assertNotEmpty( $row['description'] );
		}
	}

	/**
	 * The aql_placeholder_list filter can append rows.
	 */
	public function test_placeholder_list_is_filterable() {
		$GLOBALS['aql_test_filters']['aql_placeholder_list'][] = function ( $items ) {
			$items[] = array(
				'name'        => 'my_custom',
				'label'       => 'My Custom',
				'description' => 'A custom placeholder.',
			);
			return $items;
		};

		$names = array_column( Placeholder_Resolver::get_placeholder_list(), 'name' );

		$this->assertContains( 'my_custom', $names );
	}

	/**
	 * Integration: resolved params feed into Query_Params_Generator and produce
	 * a meta_query clause with the resolved value.
	 */
	public function test_resolved_meta_query_reaches_query_params_generator() {
		$block_query = array(
			'meta_query' => array(
				'relation' => 'AND',
				'queries'  => array(
					array(
						'meta_key'   => 'related_post',
						'meta_value' => '{aql:current_post_id}',
					),
				),
			),
		);

		$resolved = Placeholder_Resolver::resolve_params( $block_query, array( 'post_id' => 42 ) );

		$qpg = new Query_Params_Generator( array(), $resolved );
		$qpg->process_all();
		$query_args = $qpg->get_query_args();

		$this->assertSame( '42', $query_args['meta_query'][0]['value'] );
	}

	/**
	 * Regression test for Finding 1: with no context post_id, the meta_query
	 * clause carries the literal unresolved token rather than being dropped.
	 */
	public function test_unresolved_meta_query_stays_verbatim_in_query_params_generator() {
		$block_query = array(
			'meta_query' => array(
				'relation' => 'AND',
				'queries'  => array(
					array(
						'meta_key'   => 'related_post',
						'meta_value' => '{aql:current_post_id}',
					),
				),
			),
		);

		$resolved = Placeholder_Resolver::resolve_params( $block_query, array( 'post_id' => 0 ) );

		$qpg = new Query_Params_Generator( array(), $resolved );
		$qpg->process_all();
		$query_args = $qpg->get_query_args();

		$this->assertSame( '{aql:current_post_id}', $query_args['meta_query'][0]['value'] );
	}
}
