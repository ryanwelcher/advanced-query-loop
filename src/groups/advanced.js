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
import { HideIfEmptyToggle } from '../components/hide-if-empty';

export const AdvancedControls = ( props ) => {
	const { attributes, setAttributes, allowedControls } = props;
	const { query } = attributes;
	const dropdownMenuProps = useToolsPanelDropdownMenuProps();

	// Skip the whole panel when none of its controls are allowed.
	if (
		! allowedControls.includes( 'query_id' ) &&
		! allowedControls.includes( 'hide_empty' )
	) {
		return null;
	}

	const resetQueryKeys = ( keys ) => {
		const newQuery = { ...attributes.query };
		keys.forEach( ( key ) => delete newQuery[ key ] );
		setAttributes( { query: newQuery } );
	};

	return (
		<ToolsPanel
			label={ __( 'AQL: Advanced', 'advanced-query-loop' ) }
			resetAll={ () =>
				resetQueryKeys( [ 'aql_query_id', 'hide_if_empty' ] )
			}
			dropdownMenuProps={ dropdownMenuProps }
		>
			{ allowedControls.includes( 'query_id' ) && (
				<ToolsPanelItem
					label={ __( 'Query ID', 'advanced-query-loop' ) }
					hasValue={ () => !! query.aql_query_id }
					onDeselect={ () => resetQueryKeys( [ 'aql_query_id' ] ) }
				>
					<QueryIdControl { ...props } />
				</ToolsPanelItem>
			) }
			{ allowedControls.includes( 'hide_empty' ) && (
				<ToolsPanelItem
					label={ __( 'Hide if Empty', 'advanced-query-loop' ) }
					hasValue={ () => !! query.hide_if_empty }
					onDeselect={ () => resetQueryKeys( [ 'hide_if_empty' ] ) }
				>
					<HideIfEmptyToggle { ...props } />
				</ToolsPanelItem>
			) }
		</ToolsPanel>
	);
};
