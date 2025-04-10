<?php
/**
 * Manage parsing the meta query information
 */

namespace AdvancedQueryLoop\Traits;

trait Tax_Query {

	public function process_tax_query() {
		$this->custom_args['tax_query'] = $this->parse_tax_query( $this->custom_params['tax_query'] );
	}

	public function parse_tax_query( $queries ) {
		$tax_query = array();
		// Don't process empty array of queries.
		if ( isset( $queries['queries'] ) && count( $queries['queries'] ) > 0 ) {
			// Handle the relation parameter.
			if ( isset( $queries['relation'] ) && count( $queries['queries'] ) > 1 ) {
				$tax_query['relation'] = $queries['relation'];
			}
			// Loop the queries
			foreach ( $queries['queries'] as $query ) {
				if ( isset( $query['taxonomy'] ) && isset( $query['terms'] ) && count( $query['terms'] ) > 0 ) {
					$processed_query                     = array_filter( $query, fn( $key ) => 'id' !== $key, ARRAY_FILTER_USE_KEY );
					$processed_query['include_children'] = filter_var( $query['include_children'], FILTER_VALIDATE_BOOLEAN );
					$processed_query['terms']            = array_filter(
						array_map(
							function ( $term ) use ( $query ) {
								$term_obj = get_term_by( 'name', $term, $query['taxonomy'] );
								return $term_obj ? $term_obj->term_id : null;
							},
							$query['terms']
						)
					);
					$tax_query[]                         = $processed_query;
				}
			}
		}
		return $tax_query;
	}
}

/**
 * Example complex query:
 * $tax_query = array(
 *     'relation' => 'OR',
 *     array(
 *         'taxonomy' => 'category',
 *         'field'    => 'slug',
 *         'terms'    => array( 'quotes' ),
 *     ),
 *     array(
 *         'taxonomy' => 'tag',
 *         'field'    => 'slug',
 *         'terms'    => array( 2 ),
 *     ),
 *     array(
 *         'relation' => 'AND',
 *         array(
 *             'taxonomy' => 'post_format',
 *             'field'    => 'slug',
 *             'terms'    => array( 'post-format-quote' ),
 *         ),
 *         array(
 *             'taxonomy' => 'category',
 *             'field'    => 'slug',
 *             'terms'    => array( 'wisdom' ),
 *         ),
 *     ),
 * );
 */
