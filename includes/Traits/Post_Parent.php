<?php
/**
 * Post Parent Processing
 */

namespace AdvancedQueryLoop\Traits;

/**
 * Trait
 */
trait Post_Parent {

	/**
	 * Main processing function.
	 */
	public function process_post_parent(): void {
		$parent = $this->custom_params['post_parent'];

		if ( $this->is_post_id( $parent ) ) {
			$this->custom_args['post_parent'] = $parent;
		} else {
			// This is usually when this was set on a template.
			global $post;
			if ( isset( $post ) ) {
				$this->custom_args['post_parent'] = $post->ID;
			}
		}
	}
}
