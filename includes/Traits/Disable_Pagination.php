<?php
/**
 * Trait for managing pagination.
 */

namespace AdvancedQueryLoop\Traits;

trait Disable_Pagination {

	public function process_disable_pagination() {
		$this->custom_args['no_found_rows'] = $this->get_custom_param( 'disable_pagination' );
	}
}
