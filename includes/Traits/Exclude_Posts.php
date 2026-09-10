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
		$exclude_ids = $this->get_existing_excluded_ids();

		if ( empty( $to_exclude ) ) {
			return $exclude_ids;
		}

		if ( is_numeric( $to_exclude ) ) {
			$to_exclude = [ $to_exclude ];
		} elseif ( is_array( $to_exclude ) ) {
			$normalized = [];
			foreach ( $to_exclude as $item ) {
				if ( is_numeric( $item ) ) {
					$normalized[] = $item;
				} elseif ( is_array( $item ) && isset( $item['id'] ) ) {
					$normalized[] = $item['id'];
				}
			}
			$to_exclude = $normalized;
		}
		$exclude_ids = array_values( array_unique( array_merge( $exclude_ids, array_map( 'intval', (array) $to_exclude ) ) ) );

		return $exclude_ids;
	}

	/**
	 * Retrieve the IDs already marked for exclusion.
	 *
	 * Prefers the IDs added by an earlier AQL trait, then falls back to the
	 * exclusions core has already placed on the query (e.g. the current post
	 * from core's `excludeCurrent`, or its `exclude` list) so they survive the
	 * merge of AQL's args over the defaults.
	 *
	 * @return int[]
	 */
	protected function get_existing_excluded_ids(): array {
		$existing = $this->custom_args['post__not_in'] ?? $this->default_params['post__not_in'] ?? array();

		return array_values( array_filter( array_map( 'intval', (array) $existing ) ) );
	}
}
