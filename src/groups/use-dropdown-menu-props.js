/**
 * WordPress dependencies
 */
import { useViewportMatch } from '@wordpress/compose';

/**
 * Mirrors Gutenberg's private useToolsPanelDropdownMenuProps so the
 * panel options popover flies out beside the sidebar like core's
 * inspector panels, instead of covering the controls.
 *
 * @return {Object} Props for ToolsPanel's dropdownMenuProps.
 */
export function useToolsPanelDropdownMenuProps() {
	const isMobile = useViewportMatch( 'medium', '<' );
	return ! isMobile
		? {
				popoverProps: {
					placement: 'left-start',
					// For non-mobile, inner sidebar width (248px) - button width (24px) - border (1px) + padding (16px) + spacing (20px)
					offset: 259,
				},
		  }
		: {};
}
