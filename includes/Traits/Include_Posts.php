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
	 * Returns an array with Post IDs to be included on the Query
	 *
	 * @param array $include_posts Array of posts to include.
	 *
	 * @return array
	 */
	protected function get_include_ids( $include_posts ) {
		if ( is_array( $include_posts ) ) {
			return array_column( $include_posts, 'id' );
		}
		return array();
	}
}
