<?php
/**
 * Manage parsing the meta query information
 */

namespace AdvancedQueryLoop\Traits;

trait Meta_Query {

	public function process_meta_query() {
		$this->custom_args['meta_query'] = $this->parse_meta_query( $this->custom_params['meta_query'] );
	}

	public function parse_meta_query( $meta_query_data ) {
		$meta_queries = array();
		if ( isset( $meta_query_data ) ) {
			$meta_queries = array(
				'relation' => isset( $meta_query_data['relation'] ) ? $meta_query_data['relation'] : '',
			);

			if ( isset( $meta_query_data['queries'] ) ) {
				foreach ( $meta_query_data['queries'] as $query ) {
					if ( in_array( $query['meta_type'] ?? '', [ 'DATETIME', 'DATE', 'TIME' ], true ) ) {
						$query['meta_value'] = $this->map_date_functions( $query['meta_value'] ?? '' );
					}
					
					$meta_queries[] = array_filter(
						array(
							'key'     => $query['meta_key'] ?? '',
							'value'   => $query['meta_value'] ?? '',
							'compare' => $query['meta_compare'] ?? '',
							'type'    => $query['meta_type'] ?? '',
						)
					);
				}
			}
		}

		return array_filter( $meta_queries );
	}

	/**
	 * Enable a selection of dynamic date functions for meta queries.
	 *
	 * @param string $value Argument to be passed to WP_Meta_Query.
	 */
	protected function map_date_functions( $value ) {
		$value = str_ireplace(
			[
				'NOW()',
				'HOUR()',
				'DAY()',
				'MONTH()',
				'YEAR()',
				'WEEK()',
				'UNIX_TIMESTAMP()',
			],
			[
				current_time( 'Y-m-d H:i:s' ),
				intval( date( 'H' ) ),
				intval( date( 'd' ) ),
				intval( date( 'm' ) ),
				intval( date( 'Y' ) ),
				intval( date( 'W' ) ),
				time(),
			],
			$value
		);
	
		return $value;
	}
}
