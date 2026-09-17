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
 * Number of AQL blocks currently rendering that rely on the query_loop_block_query_vars filter.
 */
$GLOBALS['aql_query_vars_filter_depth'] = 0;

/**
 * Applies the AQL params to a non-inherited Query Loop block query.
 *
 * @param array     $default_query The query vars built by core.
 * @param \WP_Block $block         The block instance running the query.
 *
 * @return array
 */
function filter_query_loop_block_query_vars( $default_query, $block ) {
	// Retrieve the query from the passed block context.
	$block_query = $block->context['query'] ?? array();

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
				++$GLOBALS['aql_query_vars_filter_depth'];
				\add_filter( 'query_loop_block_query_vars', __NAMESPACE__ . '\filter_query_loop_block_query_vars', 10, 2 );
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

	// Process all of the params
	$qpg = new Query_Params_Generator( $args, $request->get_params() );
	$qpg->process_all();
	$query_args = $qpg->get_query_args();

	/** This filter is documented in includes/query-loop.php */
	$filtered_query_args = \apply_filters(
		'aql_query_vars',
		$query_args,
		$request->get_params(),
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

		if (
			! $query->is_admin &&
			isset( $query->query['is_aql'] ) &&
			isset( $query->query['enable_caching'] ) &&
			true === $query->query['enable_caching'] &&
			! isset($_GET['context']) && // phpcs:ignore
			! isset($_GET['canvas']) // phpcs:ignore
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
		if (
			! $query->is_admin &&
			isset( $query->query['is_aql'] ) &&
			isset( $query->query['enable_caching'] ) &&
			true === $query->query['enable_caching'] &&
			! isset($_GET['context']) && // phpcs:ignore
			! isset($_GET['canvas']) // phpcs:ignore
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

/**
 * Hide an AQL block once it has rendered if its query has no results.
 */
add_filter(
	'render_block_core/query',
	function ( $block_content, $block ) {
		if ( ! isset( $block['attrs']['namespace'] ) || 'advanced-query-loop' !== $block['attrs']['namespace'] ) {
			return $block_content;
		}

		$hide_if_empty = ! empty( $block['attrs']['query']['hide_if_empty'] );
		$query         = null;

		if ( ! empty( $block['attrs']['query']['inherit'] ) ) {
			global $wp_query;
			$query = $wp_query;
		} else {
			if ( $hide_if_empty ) {
				/*
				 * Rebuild the query the same way core's inner blocks (e.g. query-no-results) do. The Query block
				 * doesn't consume its own context, so run it through a post-template block that does. The results
				 * come from the `post-queries` cache populated when the post template rendered.
				 */
				$query_id = $block['attrs']['queryId'] ?? 0;
				$template = new \WP_Block(
					array( 'blockName' => 'core/post-template' ),
					array(
						'queryId' => $query_id,
						'query'   => $block['attrs']['query'] ?? array(),
					)
				);
				$page_key = 'query-' . $query_id . '-page';
				$page     = empty( $_GET[ $page_key ] ) ? 1 : (int) $_GET[ $page_key ]; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				$query    = new \WP_Query( \build_query_vars_from_query_block( $template, $page ) );
			}

			// Stop applying the AQL params once the outermost AQL block is done.
			if ( --$GLOBALS['aql_query_vars_filter_depth'] <= 0 ) {
				$GLOBALS['aql_query_vars_filter_depth'] = 0;
				\remove_filter( 'query_loop_block_query_vars', __NAMESPACE__ . '\filter_query_loop_block_query_vars', 10 );
			}
		}

		if ( $hide_if_empty && $query instanceof \WP_Query && 0 === $query->post_count ) {
			return '';
		}

		return $block_content;
	},
	10,
	2
);
