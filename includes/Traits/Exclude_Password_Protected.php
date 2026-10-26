<?php
/**
 * Exclude_Password_Protected
 */

namespace AdvancedQueryLoop\Traits;

/**
 * Trait
 */
trait Exclude_Password_Protected {

	/**
	 * Main processing function.
	 */
	public function process_exclude_password_protected(): void {
		if ( $this->get_custom_param( 'exclude_password_protected' ) ) {
			$this->custom_args['has_password'] = false;
		}
	}
}
