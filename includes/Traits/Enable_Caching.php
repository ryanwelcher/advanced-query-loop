<?php
/**
 * Trait for managing pagination.
 */

namespace AdvancedQueryLoop\Traits;

trait Enable_Caching {

	public function process_enable_caching() {
		$this->custom_args['enable_caching'] = $this->get_custom_param( 'enable_caching' );
	}
}
