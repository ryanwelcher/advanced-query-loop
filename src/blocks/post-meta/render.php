<?php
/**
 * Renders the post meta block on server.
 *
 * @package AdvancedQueryLoop
 */

namespace AdvancedQueryLoop;

// The unique identifier for the block.
$identifier  = $attributes['identifier'];
$post_meta   = $attributes['metaKey'];
$action_name = isset( $attributes['identifier'] ) ? 'aql_post_meta_render_' . $identifier : 'aql_post_meta_render';

/**
 * Action to allow customizing the post meta block.
 */
if ( ! $identifier || ! has_action( $action_name ) ) {
	do_action(
		'aql_post_meta_default_render',
		$attributes,
		$content,
		$block,
		$identifier
	);
} else {
	do_action(
		$action_name,
		$attributes,
		$content,
		$block,
		$identifier
	);
}
