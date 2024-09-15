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
							'value'   => $this->replace_dynamic_meta_values( $query ),
							'compare' => $query['meta_compare'],
							'type'    => 'NUMERIC',
						)
					);
				}
			}
		}

		return array_filter( $meta_queries );
	}


	/**
	 * Helper to return the list of dynamic meta values
	 *
	 * @return array
	 */
	public function get_dynamic_meta_values() {
		return array(
			'Current Post ID',
			'Current Author ID',
			'User ID ',
			'Current Date',
		);
	}

	/**
	 * Replace the meta value key with the dynamic value.
	 *
	 * @param array $query The full meta query.
	 *
	 * @return mixed. The replaced value.
	 */
	public function replace_dynamic_meta_values( $query ) {
		$dynamic_meta_values = $this->get_dynamic_meta_values();
		$context             = $this->context;

		if ( in_array( $query['meta_value'], $dynamic_meta_values, true ) ) {
			switch ( $query['meta_value'] ) {
				case 'Current Post ID':
					global $post;
					return isset( $post ) ? $post->ID : $query['currentPost'];
				case 'Current Author ID':
					return '0';
				case 'User ID':
					if ( is_user_logged_in() ) {
						$user = get_current_user();
						return $user;
					}
					return 0;
				case 'Current Date':
					return 0;
			}
		}
		return $meta_value;
	}
}
