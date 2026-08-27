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
import { QueryIdControl } from '../components/query-id-control';
import { useToolsPanelDropdownMenuProps } from './use-dropdown-menu-props';

export const AdvancedControls = ( props ) => {
	const { attributes, setAttributes, allowedControls } = props;
	const { query } = attributes;
	const dropdownMenuProps = useToolsPanelDropdownMenuProps();

	// Skip the whole panel when none of its controls are allowed.
	if ( ! allowedControls.includes( 'query_id' ) ) {
		return null;
	}

	const resetQueryId = () => {
		const newQuery = { ...attributes.query };
		delete newQuery.aql_query_id;
		setAttributes( { query: newQuery } );
	};

	return (
		<ToolsPanel
			label={ __( 'AQL: Advanced', 'advanced-query-loop' ) }
			resetAll={ resetQueryId }
			dropdownMenuProps={ dropdownMenuProps }
		>
			<ToolsPanelItem
				label={ __( 'Query ID', 'advanced-query-loop' ) }
				hasValue={ () => !! query.aql_query_id }
				onDeselect={ resetQueryId }
			>
				<QueryIdControl { ...props } />
			</ToolsPanelItem>
		</ToolsPanel>
	);
};
