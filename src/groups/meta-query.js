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
import { PostMetaQueryControls } from '../components/post-meta-query-controls';
import { useToolsPanelDropdownMenuProps } from './use-dropdown-menu-props';

export const MetaQueryGroupControls = ( props ) => {
	const { attributes, setAttributes, allowedControls } = props;
	const { query } = attributes;
	const dropdownMenuProps = useToolsPanelDropdownMenuProps();

	if ( ! allowedControls.includes( 'post_meta_query' ) ) {
		return null;
	}

	const resetMetaQuery = () => {
		const newQuery = { ...attributes.query };
		delete newQuery.meta_query;
		setAttributes( { query: newQuery } );
	};

	return (
		<ToolsPanel
			label={ __( 'AQL: Meta', 'advanced-query-loop' ) }
			resetAll={ resetMetaQuery }
			dropdownMenuProps={ dropdownMenuProps }
		>
			<ToolsPanelItem
				label={ __( 'Meta filters', 'advanced-query-loop' ) }
				isShownByDefault
				hasValue={ () => !! query.meta_query?.queries?.length }
				onDeselect={ resetMetaQuery }
			>
				<PostMetaQueryControls { ...props } />
			</ToolsPanelItem>
		</ToolsPanel>
	);
};
