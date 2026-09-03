<?php
/**
 * Handles the filters we need to add to the query.
 *
 * @package AdvancedQueryLoop
 */

namespace AdvancedQueryLoop;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	return;
}

// Bail on unit tests.
if ( ! function_exists( 'add_filter' ) ) {
	return;
}

/**
 * Build the context array used to resolve dynamic placeholders.
 *
 * @param array $block_query       The query attribute from the block.
 * @param bool  $inherited         Whether the query is inherited from the template.
 * @param bool  $is_editor_preview Whether this is a REST editor-preview request.
 * @param int   $preview_post_id   The edited post ID sent by the editor (REST only).
 *
 * @return array
 */
function build_placeholder_context( array $block_query, bool $inherited, bool $is_editor_preview = false, int $preview_post_id = 0 ): array {
	if ( $is_editor_preview ) {
		$post_id = $preview_post_id;
	} else {
		$post_id = \is_singular() ? (int) \get_queried_object_id() : 0;
	}

	// Only real taxonomy archives have a current term; the editor preview has none.
	$term_id = ( ! $is_editor_preview && ( \is_tax() || \is_category() || \is_tag() ) ) ? (int) \get_queried_object_id() : 0;

	return array(
		'post_id'           => $post_id,
		'post_type'         => $post_id ? (string) \get_post_type( $post_id ) : '',
		'post_parent_id'    => $post_id ? (int) \wp_get_post_parent_id( $post_id ) : 0,
		'author_id'         => $post_id ? (int) \get_post_field( 'post_author', $post_id ) : 0,
		'user_id'           => (int) \get_current_user_id(),
		'term_id'           => $term_id,
		'is_editor_preview' => $is_editor_preview,
		'block_query'       => $block_query,
		'inherited'         => $inherited,
	);
}

/**
 * Updates the query on the front end based on custom query attributes.
 */
\add_filter(
	'pre_render_block',
	function ( $pre_render, $parsed_block ) {
		if ( isset( $parsed_block['attrs']['namespace'] ) && 'advanced-query-loop' === $parsed_block['attrs']['namespace'] ) {

			// Hijack the global query. It's a hack, but it works.
			if ( isset( $parsed_block['attrs']['query']['inherit'] ) && true === $parsed_block['attrs']['query']['inherit'] ) {
				global $wp_query;
				$query_args = array_merge(
					$wp_query->query_vars,
					array(
						'posts_per_page' => $parsed_block['attrs']['query']['perPage'],
						'order'          => $parsed_block['attrs']['query']['order'],
						'orderby'        => $parsed_block['attrs']['query']['orderBy'],
					)
				);

				/**
				 * Filter the query vars.
				 *
				 * Allows filtering query params when the query is being inherited.
				 *
				 * @since 1.5
				 *
				 * @param array   $query_args  Arguments to be passed to WP_Query.
				 * @param array   $block_query The query attribute retrieved from the block.
				 * @param boolean $inherited   Whether the query is being inherited.
				 *
				 * @param array $filtered_query_args Final arguments list.
				 */
				$filtered_query_args = \apply_filters(
					'aql_query_vars',
					$query_args,
					$parsed_block['attrs']['query'],
					true,
				);

				$wp_query = new \WP_Query( array_filter( $filtered_query_args ) );
			} else {
				\add_filter(
					'query_loop_block_query_vars',
					function ( $default_query, $block ) {
						// Retrieve the query from the passed block context.
						$block_query = $block->context['query'] ?? array();

						// Resolve dynamic placeholders before any processing.
						$block_query = Placeholder_Resolver::resolve_params(
							$block_query,
							build_placeholder_context( $block_query, false )
						);

						// Process all of the params
						$qpg = new Query_Params_Generator( $default_query, $block_query );
						$qpg->process_all();
						$query_args = $qpg->get_query_args();

						/** This filter is documented in includes/query-loop.php */
						$filtered_query_args = \apply_filters(
							'aql_query_vars',
							$query_args,
							$block_query,
							false
						);

						// Return the merged query.
						return array_merge(
							$default_query,
							$filtered_query_args
						);
					},
					10,
					2
				);
			}
		}

		return $pre_render;
	},
	10,
	2
);

/**
 * Updates the query vars for the Query Loop block in the block editor
 */
// Add a filter to each rest endpoint to add our custom query params.
\add_action(
	'init',
	function () {
		$registered_post_types = \get_post_types(
			array(
				'show_in_rest' => true,
				'public'       => true,
			)
		);
		foreach ( $registered_post_types as $registered_post_type ) {
			\add_filter( 'rest_' . $registered_post_type . '_query', __NAMESPACE__ . '\add_custom_query_params', 10, 2 );

			// We need more sortBy options.
			\add_filter( 'rest_' . $registered_post_type . '_collection_params', __NAMESPACE__ . '\add_more_sort_by', 10, 2 );
		}
	},
	PHP_INT_MAX
);


/**
 * Override the allowed items
 *
 * @see https://developer.wordpress.org/reference/classes/wp_rest_posts_controller/get_collection_params/
 *
 * @param array $query_params The query params.
 *
 * @return array
 */
function add_more_sort_by( $query_params ) {
	$query_params['orderby']['enum'][] = 'menu_order';
	$query_params['orderby']['enum'][] = 'meta_value';
	$query_params['orderby']['enum'][] = 'meta_value_num';
	$query_params['orderby']['enum'][] = 'rand';
	$query_params['orderby']['enum'][] = 'post__in';
	$query_params['orderby']['enum'][] = 'comment_count';
	$query_params['orderby']['enum'][] = 'name';
	return $query_params;
}

/**
 * Callback to handle the custom query params. Updates the block editor.
 *
 * @param array           $args    The query args.
 * @param WP_REST_Request $request The request object.
 */
function add_custom_query_params( $args, $request ) {

	// Resolve dynamic placeholders before any processing.
	$params = $request->get_params();

	// Only honor the caller-supplied preview post ID when they're allowed to edit it.
	$preview_post_id = \absint( $request->get_param( 'aql_preview_post_id' ) ?? 0 );
	if ( $preview_post_id && ! \current_user_can( 'edit_post', $preview_post_id ) ) {
		$preview_post_id = 0;
	}

	$context = build_placeholder_context( $params, false, true, $preview_post_id );
	$params  = Placeholder_Resolver::resolve_params( $params, $context );

	// Process all of the params
	$qpg = new Query_Params_Generator( $args, $params );
	$qpg->process_all();
	$query_args = $qpg->get_query_args();

	/** This filter is documented in includes/query-loop.php */
	$filtered_query_args = \apply_filters(
		'aql_query_vars',
		$query_args,
		$params,
		false,
	);
	// Merge all queries.
	$merged = array_merge(
		$args,
		array_filter( $filtered_query_args )
	);

	return $merged;
}



/**
 * Retrieve any cached AQL instances and bypass making a query.
 */

add_filter(
	'posts_pre_query',
	function ( $null_return, $query ) {

		if ( ! $query->is_admin &&
			isset( $query->query['is_aql'] ) &&
			isset( $query->query['enable_caching'] ) &&
			true === $query->query['enable_caching'] &&
			! isset( $_GET['context'] ) && // phpcs:ignore
			! isset( $_GET['canvas'] ) // phpcs:ignore
		) {
			$cached_query = get_transient( $query->query_vars_hash );
			if ( $cached_query ) {
				$query->found_posts   = $cached_query->found_posts;
				$query->max_num_pages = $cached_query->max_num_pages;
				return $cached_query->posts;
			}
		}

		return $null_return;
	},
	10,
	2
);

/**
 * Create a cache for the Query generated by the AQL instance.
 */
add_filter(
	'the_posts',
	function ( $posts, $query ) {
		if ( ! $query->is_admin &&
			isset( $query->query['is_aql'] ) &&
			isset( $query->query['enable_caching'] ) &&
			true === $query->query['enable_caching'] &&
			! isset( $_GET['context'] ) && // phpcs:ignore
			! isset( $_GET['canvas'] ) // phpcs:ignore
		) {
			if ( ! get_transient( $query->query_vars_hash ) ) {
				set_transient( $query->query_vars_hash, $query, HOUR_IN_SECONDS );
			}
		}
		return $posts;
	},
	10,
	2
);
