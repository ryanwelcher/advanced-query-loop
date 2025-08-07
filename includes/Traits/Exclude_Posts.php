<?php
/**
 * Exclude_Posts
 */

namespace AdvancedQueryLoop\Traits;

/**
 * Trait
 */
trait Exclude_Posts {

	/**
	 * Main processing function.
	 */
	public function process_exclude_posts(): void {
		$this->custom_args['post__not_in'] = $this->get_excluded_post_ids( $this->custom_params['exclude_posts'] );
	}

	/**
	 * Helper to generate the array
	 *
	 * @param mixed $to_exclude The value to be excluded.
	 *
	 * @return array The ids to exclude
	 */
	public function get_excluded_post_ids( $to_exclude ) {
		// If there are already posts to be excluded, we need to add to them.
		$exclude_ids = $this->custom_args['post__not_in'] ?? array();

		$exclude_ids = array_unique( array_merge( $exclude_ids, (array) $to_exclude ) );

		return $exclude_ids;
	}
}
