/**
 * WordPress dependencies
 */
import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel as ToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { PostDateQueryControls } from '../components/post-date-query-controls';

export const DateQueryControls = ( props ) => {
	const { attributes, setAttributes, allowedControls } = props;
	const { query } = attributes;

	if (
		! allowedControls.includes( 'date_query_dynamic_range' ) &&
		! allowedControls.includes( 'date_query_relationship' )
	) {
		return null;
	}

	const resetDateQuery = () => {
		const newQuery = { ...attributes.query };
		delete newQuery.date_query;
		setAttributes( { query: newQuery } );
	};

	return (
		<ToolsPanel
			label={ __( 'AQL: Date Query', 'advanced-query-loop' ) }
			resetAll={ resetDateQuery }
		>
			<ToolsPanelItem
				label={ __( 'Date filters', 'advanced-query-loop' ) }
				isShownByDefault
				hasValue={ () =>
					!! query.date_query &&
					Object.keys( query.date_query ).length > 0
				}
				onDeselect={ resetDateQuery }
			>
				<PostDateQueryControls { ...props } />
			</ToolsPanelItem>
		</ToolsPanel>
	);
};
