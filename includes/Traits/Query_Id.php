<?php
/**
 * Trait for managing the query identifier.
 */

namespace AdvancedQueryLoop\Traits;

trait Query_Id {

	public function process_aql_query_id() {
		$this->custom_args['aql_query_id'] = $this->get_custom_param( 'aql_query_id' );
	}
}
