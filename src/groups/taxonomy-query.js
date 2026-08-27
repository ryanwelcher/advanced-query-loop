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
import { TaxonomyQueryControl } from '../components/taxonomy-query-control';
import { ExcludeTaxonomies } from '../components/exclude-taxonomies';

export const TaxonomyQueryGroupControls = ( props ) => {
	const { attributes, setAttributes, allowedControls } = props;
	const { query } = attributes;

	if ( ! allowedControls.includes( 'taxonomy_query_builder' ) ) {
		return null;
	}

	const removeKey = ( key ) => {
		const newQuery = { ...attributes.query };
		delete newQuery[ key ];
		setAttributes( { query: newQuery } );
	};

	return (
		<ToolsPanel
			label={ __( 'AQL: Taxonomy Query', 'advanced-query-loop' ) }
			resetAll={ () => {
				const newQuery = { ...attributes.query };
				delete newQuery.tax_query;
				delete newQuery.exclude_taxonomies;
				setAttributes( { query: newQuery } );
			} }
		>
			<ToolsPanelItem
				label={ __( 'Taxonomy filters', 'advanced-query-loop' ) }
				isShownByDefault
				hasValue={ () => !! query.tax_query?.queries?.length }
				onDeselect={ () => removeKey( 'tax_query' ) }
			>
				<TaxonomyQueryControl { ...props } />
			</ToolsPanelItem>
			<ToolsPanelItem
				label={ __( 'Exclude taxonomy terms', 'advanced-query-loop' ) }
				hasValue={ () => !! query.exclude_taxonomies?.length }
				onDeselect={ () => removeKey( 'exclude_taxonomies' ) }
			>
				<ExcludeTaxonomies { ...props } />
			</ToolsPanelItem>
		</ToolsPanel>
	);
};
