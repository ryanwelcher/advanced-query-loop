<?php
/**
 * Processing multiple post types
 */

namespace AdvancedQueryLoop\Traits;

/**
 * Trait
 */
trait Multiple_Posts {
	/**
	 * Main processing function.
	 */
	public function process_multiple_posts(): void {
		$this->custom_args['post_type'] = array_unique( array_merge( array( $this->default_params['post_type'] ), $this->custom_params['multiple_posts'] ), SORT_REGULAR );
	}
}
