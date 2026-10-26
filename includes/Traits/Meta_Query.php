<?php
/**
 * Manage parsing the meta query information
 */

namespace AdvancedQueryLoop\Traits;

use AdvancedQueryLoop\Placeholder_Resolver;

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
					// A placeholder with no current value: use a clause that never matches.
					if ( $this->has_valueless_placeholder( $query ) ) {
						$meta_queries[] = array(
							'key'     => Placeholder_Resolver::NO_VALUE,
							'compare' => 'EXISTS',
						);
						continue;
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
	 * Whether a meta query clause's key or value holds a valueless placeholder.
	 *
	 * @param array $query The meta query clause from the block.
	 *
	 * @return bool
	 */
	private function has_valueless_placeholder( $query ) {
		foreach ( array( 'meta_key', 'meta_value' ) as $field ) {
			foreach ( (array) ( $query[ $field ] ?? array() ) as $value ) {
				if ( is_string( $value ) && false !== strpos( $value, Placeholder_Resolver::NO_VALUE ) ) {
					return true;
				}
			}
		}
		return false;
	}
}
