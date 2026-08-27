<?php
/**
 * Trait for managing the query identifier.
 */

namespace AdvancedQueryLoop\Traits;

trait Query_Id {

	public function process_aql_query_id() {
		$query_id = $this->get_custom_param( 'aql_query_id' );

		// Only accept a non-empty string identifier.
		if ( ! is_string( $query_id ) ) {
			return;
		}

		$query_id = trim( $query_id );
		if ( '' === $query_id ) {
			return;
		}

		$this->custom_args['aql_query_id'] = $query_id;
	}
}
