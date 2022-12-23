<?php
/**
 * Handles block related functionality.
 *
 * @package AdvancedQueryLoop
 */

namespace AdvancedQueryLoop;

/**
 * Registers the block type.
 */
\add_action(
	'init',
	function() {
		\register_block_type( BUILD_DIR_PATH . 'blocks/post-meta' );
	}
);


/**
 * Default post meta render callback.
 */
\add_action(
	'aql_post_meta_default_render',
	function( $attributes, $content, $block, $identifier ) {
		if ( isset( $attributes['metaKey'] ) ) {
			?>
				<div>
					<?php echo \wp_kses_post( \get_post_meta( $block->context['postId'], $attributes['metaKey'], true ) ); ?>
				</div>
			<?php
		}
	},
	10,
	4
);
