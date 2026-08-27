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
	 * This method retrieves the orderBy and optional secondary_orderby values
	 * from the block's custom parameters and normalizes them for WP_Query.
	 * Specifically, it handles the case where lowercase 'id' needs to be converted
	 * to uppercase 'ID'.
	 *
	 * When a secondary_orderby is provided with a valid order_by property,
	 * the method produces an orderby array for WP_Query with the primary property
	 * first, followed by the secondary property. Otherwise, returns a simple string.
	 *
	 * Meta-value ordering and the keyed clause
	 * ----------------------------------------
	 * To sort by a meta value WITHOUT dropping posts that lack the key, a named
	 * EXISTS / NOT EXISTS clause pair is joined under an OR relation and the
	 * orderby references one of the two clauses by name.
	 *
	 * It must reference the NOT EXISTS clause. WP_Query builds the EXISTS
	 * clause's JOIN unrestricted (`INNER JOIN wp_postmeta AS mt1 ON
	 * (wp_posts.ID = mt1.post_id)`) and pushes the key comparison into the
	 * WHERE. Because the NOT EXISTS sibling sits under OR, a post that lacks
	 * the key but has ANY other postmeta row still satisfies the WHERE via the
	 * sibling — and the unrestricted join means the EXISTS clause's meta_value
	 * for that post is an arbitrary unrelated meta row, so ordering by it is
	 * garbage.
	 *
	 * The NOT EXISTS clause's JOIN, by contrast, IS restricted to the key
	 * (`LEFT JOIN wp_postmeta AS mt2 ON (wp_posts.ID = mt2.post_id AND
	 * mt2.meta_key = 'K')`), so its meta_value is either the post's real value
	 * for that key or NULL. That is the column worth sorting on.
	 *
	 * Therefore the referenced clause keeps the readable name
	 * (aql_orderby_primary / aql_orderby_secondary) and carries the
	 * 'NOT EXISTS' compare plus the 'NUMERIC' type for meta_value_num, while
	 * the sibling is named *_exists.
	 *
	 * Note: MySQL sorts NULL first in ASC, so posts without the key lead when
	 * ascending and trail when descending.
	 *
	 * If no primary property is supplied (for example a secondary sort saved
	 * without any core orderBy), the primary rule is skipped so no empty
	 * orderby entry is emitted; a lone secondary rule then stands on its own
	 * as an array so its direction survives. With no usable rule at all the
	 * method is a no-op.
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
		$primary_meta_key = $this->custom_params['orderby_meta_key'] ?? '';
		$secondary        = $this->custom_params['secondary_orderby'] ?? array();
		$has_secondary    = is_array( $secondary ) && ! empty( $secondary['order_by'] );

		// The REST path (block editor preview) sends the primary sort under the
		// lowercase 'orderby' key; the frontend block attribute is 'orderBy'.
		$primary_property = $this->custom_params['orderBy'] ?? $this->custom_params['orderby'] ?? null;

		$rules = array();

		if ( ! empty( $primary_property ) ) {
			$rules[] = array(
				'property'  => $primary_property,
				'direction' => $this->custom_params['order'] ?? null,
				'meta_key'  => $primary_meta_key,
				'name'      => 'aql_orderby_primary',
			);
		}

		if ( $has_secondary ) {
			$rules[] = array(
				'property'  => $secondary['order_by'],
				'direction' => $secondary['order'] ?? null,
				'meta_key'  => $secondary['meta_key'] ?? '',
				'name'      => 'aql_orderby_secondary',
			);
		}

		// Nothing usable to order by.
		if ( empty( $rules ) ) {
			return;
		}

		$orderby          = array();
		$ordering_clauses = array();
		$has_primary_rule = ! empty( $primary_property );

		foreach ( $rules as $rule ) {
			$is_meta = in_array( $rule['property'], array( 'meta_value', 'meta_value_num' ), true )
				&& ! empty( $rule['meta_key'] );

			if ( $is_meta ) {
				// The referenced clause: its JOIN is restricted to the key, so
				// its meta_value is the real value or NULL. See the docblock.
				$referenced_clause = array(
					'key'     => $rule['meta_key'],
					'compare' => 'NOT EXISTS',
				);
				if ( 'meta_value_num' === $rule['property'] ) {
					$referenced_clause['type'] = 'NUMERIC';
				}
				$ordering_clauses[ $rule['name'] ]             = $referenced_clause;
				$ordering_clauses[ $rule['name'] . '_exists' ] = array(
					'key'     => $rule['meta_key'],
					'compare' => 'EXISTS',
				);
				$key = $rule['name'];
			} else {
				$key = $this->normalize_orderby_property( $rule['property'] );
			}

			$orderby[ $key ] = $this->normalize_order_direction( $rule['direction'] );
		}

		if ( ! empty( $ordering_clauses ) ) {
			$this->merge_ordering_meta_clauses( $ordering_clauses );
		}

		// Preserve the string path when there's a single plain PRIMARY rule.
		// A lone secondary rule keeps the array form so its own direction is
		// not lost to the block's primary `order` value.
		$this->custom_args['orderby'] = ( $has_primary_rule && 1 === count( $orderby ) && empty( $ordering_clauses ) )
			? array_key_first( $orderby )
			: $orderby;
	}

	/**
	 * Merge ordering clause pairs into custom_args['meta_query'],
	 * preserving any user-built meta query under an outer AND.
	 *
	 * @param array $ordering_clauses Named EXISTS/NOT EXISTS clauses.
	 */
	private function merge_ordering_meta_clauses( array $ordering_clauses ): void {
		$ordering_group = array_merge( array( 'relation' => 'OR' ), $ordering_clauses );

		if ( empty( $this->custom_args['meta_query'] ) ) {
			$this->custom_args['meta_query'] = $ordering_group;
			return;
		}

		$this->custom_args['meta_query'] = array(
			'relation' => 'AND',
			$this->custom_args['meta_query'],
			$ordering_group,
		);
	}

	/**
	 * Normalize a single orderby property for WP_Query.
	 *
	 * @param mixed $property Raw property value.
	 * @return mixed Normalized property ('id' → 'ID').
	 */
	private function normalize_orderby_property( $property ) {
		return ( 'id' === $property ) ? 'ID' : $property;
	}

	/**
	 * Normalize an order direction to WP_Query's uppercase form.
	 *
	 * @param mixed $direction Raw direction value.
	 * @return string 'ASC' or 'DESC' (default).
	 */
	private function normalize_order_direction( $direction ): string {
		return ( is_string( $direction ) && 'asc' === strtolower( $direction ) ) ? 'ASC' : 'DESC';
	}
}
