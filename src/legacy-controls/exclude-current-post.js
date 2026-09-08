/**
 * Legacy Exclude Current Post control.
 *
 * Core's Query Loop block ships its own Exclude current toggle
 * (`query.excludeCurrent`) as of WordPress 7.1. On sites without it this fill
 * keeps AQL's original toggle available inside the "AQL: Extensions" panel.
 * It is gated on the block attribute rather than a version number so
 * Gutenberg-plugin sites with the compat shim also count as supported.
 */

/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import AQLLegacyControls from '../slots/aql-legacy-controls';
import { ExcludeCurrentPostToggle } from '../components/post-exclude-controls';
import { useHasCoreExcludeCurrent } from '../hooks/useCoreExcludeCurrent';

const LegacyExcludeCurrentPostFill = () => {
	const hasCoreExcludeCurrent = useHasCoreExcludeCurrent();
	if ( hasCoreExcludeCurrent ) {
		return null;
	}
	return (
		<AQLLegacyControls>
			{ ( props ) => <ExcludeCurrentPostToggle { ...props } /> }
		</AQLLegacyControls>
	);
};

registerPlugin( 'aql-legacy-exclude-current-post', {
	render: LegacyExcludeCurrentPostFill,
} );
