<?php
/**
 * Trait for managing ID
 */

namespace AdvancedQueryLoop\Traits;

trait Include_Posts {

	public function process_include_posts() {
		$this->custom_args['post__in'] = $this->get_include_ids( $this->get_custom_param( 'include_posts' ) );
	}

	/**
	 * Returns an array with Post IDs that should be excluded from the Query.
	 *
	 * @param array $attributes
	 * @return array
	 */
	protected function get_exclude_ids( $attributes ) {
		$exclude_ids = array();

		// Exclude Current Post.
		if ( isset( $attributes['exclude_current'] ) && boolval( $attributes['exclude_current'] ) ) {
			array_push( $exclude_ids, $attributes['exclude_current'] );
		}

		return $exclude_ids;
	}

	/**
	 * Returns an array with Post IDs to be included on the Query
	 *
	 * @param array
	 * @return array
	 */
	protected function get_include_ids( $include_posts ) {
		return array_column( $include_posts, 'id' );
	}
}
