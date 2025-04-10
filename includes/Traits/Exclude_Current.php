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
		$this->custom_args['post__not_in'] = $this->get_exclude_ids( $this->custom_params['exclude_current'] );
	}

	/**
	 * Helper to generate the array
	 *
	 * @param mixed $to_exclude The value to be excluded.
	 *
	 * @return array The ids to exclude
	 */
	public function get_exclude_ids( $to_exclude ) {
		// If there are already posts to be excluded, we need to add to them.
		$exclude_ids = $this->custom_args['post__not_in'] ?? array();

		if ( $this->is_post_id( $to_exclude ) ) {
			array_push( $exclude_ids, intval( $to_exclude ) );
		} else {
			// This is usually when this was set on a template.
			global $post;
			array_push( $exclude_ids, $post->ID );
		}
		return $exclude_ids;
	}
}
