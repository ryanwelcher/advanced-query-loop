<?php
/**
 * Exclude_Current
 */

namespace AdvancedQueryLoop\Traits;

/**
 * Trait
 */
trait Exclude_Current {

	/**
	 * Main processing function.
	 */
	public function process_exclude_current(): void {
		$this->custom_args['post__not_in'] = $this->custom_params['exclude_current'];
	}
}
