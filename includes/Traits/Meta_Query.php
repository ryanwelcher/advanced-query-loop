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
}
