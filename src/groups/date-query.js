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
import {
	DateDynamicRangeControls,
	DateRelationshipControls,
} from '../components/post-date-query-controls';

// Deletes the given keys from the date_query attribute, removing date_query
// entirely once it no longer has any keys left.
const removeDateQueryKeys = ( attributes, setAttributes, keys ) => {
	const newDateQuery = { ...( attributes.query.date_query || {} ) };
	keys.forEach( ( key ) => delete newDateQuery[ key ] );

	const newQuery = { ...attributes.query };
	if ( Object.keys( newDateQuery ).length === 0 ) {
		delete newQuery.date_query;
	} else {
		newQuery.date_query = newDateQuery;
	}
	setAttributes( { query: newQuery } );
};

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
			label={ __( 'AQL: Date', 'advanced-query-loop' ) }
			resetAll={ resetDateQuery }
		>
			{ allowedControls.includes( 'date_query_dynamic_range' ) && (
				<ToolsPanelItem
					label={ __( 'Dynamic range', 'advanced-query-loop' ) }
					hasValue={ () => !! query.date_query?.range }
					onDeselect={ () =>
						removeDateQueryKeys( attributes, setAttributes, [
							'range',
							'current_date_in_range',
						] )
					}
				>
					<DateDynamicRangeControls { ...props } />
				</ToolsPanelItem>
			) }
			{ allowedControls.includes( 'date_query_relationship' ) && (
				<ToolsPanelItem
					label={ __( 'Date relationship', 'advanced-query-loop' ) }
					hasValue={ () => !! query.date_query?.relation }
					onDeselect={ () =>
						removeDateQueryKeys( attributes, setAttributes, [
							'relation',
							'date_primary',
							'date_secondary',
							'inclusive',
						] )
					}
				>
					<DateRelationshipControls { ...props } />
				</ToolsPanelItem>
			) }
		</ToolsPanel>
	);
};
