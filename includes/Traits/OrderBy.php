<?php
/**
 * OrderBy Trait - Handles post ordering parameter normalization
 *
 * This trait processes the 'orderBy' parameter from the Query Loop block
 * and normalizes it for WP_Query compatibility. This is necessary because
 * the WordPress REST API and WP_Query handle certain parameter values
 * differently.
 *
 * Key Issue Solved:
 * - REST API (block editor): Accepts 'id' (lowercase) and normalizes internally
 * - WP_Query (frontend): Requires 'ID' (uppercase) - case-sensitive
 *
 * Without this normalization, queries can work in the editor but fail on the
 * frontend, causing posts to fall back to default date ordering instead of
 * the selected ordering method.
 *
 * @package AdvancedQueryLoop\Traits
 */

namespace AdvancedQueryLoop\Traits;

/**
 * Trait OrderBy
 *
 * Processes and normalizes the orderBy parameter from block attributes
 * to ensure compatibility with WP_Query's case-sensitive requirements.
 *
 * @since 4.4.0
 */
trait OrderBy {
	/**
	 * Process the orderBy parameter from the block query.
	 *
	 * This method retrieves the orderBy value from the block's custom parameters
	 * and normalizes it for WP_Query. Specifically, it handles the case where
	 * lowercase 'id' needs to be converted to uppercase 'ID'.
	 *
	 * WordPress WP_Query expects 'ID' (uppercase) for ordering by post ID, but
	 * the REST API accepts 'id' (lowercase). This normalization ensures consistent
	 * behavior between the block editor (which uses REST API) and the frontend
	 * (which uses WP_Query directly).
	 *
	 * Valid orderBy values (after normalization):
	 * - 'ID'             - Order by post ID (note: uppercase required)
	 * - 'author'         - Order by post author
	 * - 'title'          - Order by post title
	 * - 'name'           - Order by post name (slug)
	 * - 'date'           - Order by post date
	 * - 'modified'       - Order by last modified date
	 * - 'rand'           - Random order
	 * - 'comment_count'  - Order by number of comments
	 * - 'menu_order'     - Order by menu order
	 * - 'post__in'       - Order by post ID inclusion order
	 * - 'meta_value'     - Order by meta value (requires meta_key)
	 * - 'meta_value_num' - Order by numeric meta value (requires meta_key)
	 *
	 * @since 4.4.0
	 *
	 * @return void
	 */
	// phpcs:ignore WordPress.NamingConventions.ValidFunctionName.MethodNameInvalid
	public function process_orderBy(): void {
		// Retrieve the orderBy parameter from the block's custom parameters.
		$order_by = $this->custom_params['orderBy'] ?? null;

		// Normalize lowercase 'id' to uppercase 'ID' for WP_Query compatibility.
		// WP_Query is case-sensitive and only recognizes 'ID' (uppercase).
		$this->custom_args['orderby'] = ( 'id' === $order_by ) ? 'ID' : $order_by;
	}
}
