<?php
/**
 * Exclude_Taxonomies
 */

namespace AdvancedQueryLoop\Traits;

/**
 * Trait
 */
trait Exclude_Taxonomies {

	/**
	 * Main processing function.
	 */
	public function process_exclude_taxonomies(): void {
		$taxonomies_to_exclude = $this->custom_params['exclude_taxonomies'];
		if( count( $taxonomies_to_exclude ) ) {
			$tax_query = [];
			foreach ( $taxonomies_to_exclude as $slug ) {
				$tax_query[]  = [
					'taxonomy' => $slug,
					'operator' => 'NOT EXISTS'
				];
			}
			$this->custom_args['tax_query'] = $tax_query;
		}
	}
}

