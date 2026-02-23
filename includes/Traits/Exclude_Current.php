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
	 * @param int $exclude_current_post The value to be excluded.
	 *
	 * @return array The ids to exclude
	 */
	public function get_exclude_ids( $exclude_current_post ) {
		// If there are already posts to be excluded, we need to add to them.
		$exclude_ids     = $this->custom_args['post__not_in'] ?? array();
		$post_to_exclude = 0;
		if ( true !== $exclude_current_post && is_numeric( $exclude_current_post ) && $exclude_current_post >= 1 ) {
			$post_to_exclude = intval( $exclude_current_post );
		} else {
			// Try to get the queried object ID (frontend context)
			if ( function_exists( 'get_queried_object_id' ) ) {
				$post_to_exclude = get_queried_object_id();
			}

			// Fallback to global $post (editor, unit tests, etc.)
			if ( ! $post_to_exclude ) {
				global $post;
				if ( $post && isset( $post->ID ) ) {
					$post_to_exclude = $post->ID;
				}
			}
		}

		if ( $post_to_exclude > 0 ) {
			array_push( $exclude_ids, intval( $post_to_exclude ) );
		}

		return $exclude_ids;
	}
}
