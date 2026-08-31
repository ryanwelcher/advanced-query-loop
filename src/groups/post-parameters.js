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
import { MultiplePostSelect } from '../components/multiple-post-select';
import { PostIncludeControls } from '../components/post-include-controls';
import { ExcludeCurrentPostToggle } from '../components/post-exclude-controls';
import { PostPickerControl } from '../components/post-picker-control';
import { ChildItemsToggle } from '../components/child-items-toggle';
import { useToolsPanelDropdownMenuProps } from './use-dropdown-menu-props';

const GROUP_CONTROLS = [
	'additional_post_types',
	'include_posts',
	'exclude_posts',
	'exclude_current_post',
	'child_items_only',
];

// Deletes AQL-owned keys from the query attribute.
const removeKeys = ( attributes, setAttributes, keys ) => {
	const query = { ...attributes.query };
	keys.forEach( ( key ) => delete query[ key ] );
	setAttributes( { query } );
};

export const PostParametersControls = ( props ) => {
	const { attributes, setAttributes, allowedControls } = props;
	const { query } = attributes;
	const dropdownMenuProps = useToolsPanelDropdownMenuProps();

	if ( ! GROUP_CONTROLS.some( ( c ) => allowedControls.includes( c ) ) ) {
		return null;
	}

	return (
		<ToolsPanel
			label={ __( 'AQL: Post', 'advanced-query-loop' ) }
			dropdownMenuProps={ dropdownMenuProps }
			resetAll={ () =>
				removeKeys( attributes, setAttributes, [
					'multiple_posts',
					'include_posts',
					'exclude_posts',
					'exclude_current',
					'post_parent',
				] )
			}
		>
			{ allowedControls.includes( 'additional_post_types' ) && (
				<ToolsPanelItem
					label={ __( 'Post types', 'advanced-query-loop' ) }
					isShownByDefault
					hasValue={ () => !! query.multiple_posts?.length }
					onDeselect={ () =>
						removeKeys( attributes, setAttributes, [
							'multiple_posts',
						] )
					}
				>
					<MultiplePostSelect { ...props } />
				</ToolsPanelItem>
			) }
			{ allowedControls.includes( 'include_posts' ) && (
				<ToolsPanelItem
					label={ __( 'Include posts', 'advanced-query-loop' ) }
					hasValue={ () => !! query.include_posts?.length }
					onDeselect={ () =>
						removeKeys( attributes, setAttributes, [
							'include_posts',
						] )
					}
				>
					<PostIncludeControls { ...props } />
				</ToolsPanelItem>
			) }
			{ allowedControls.includes( 'exclude_posts' ) && (
				<ToolsPanelItem
					label={ __( 'Exclude posts', 'advanced-query-loop' ) }
					hasValue={ () => !! query.exclude_posts?.length }
					onDeselect={ () =>
						removeKeys( attributes, setAttributes, [
							'exclude_posts',
						] )
					}
				>
					<PostPickerControl
						{ ...props }
						queryField="exclude_posts"
						title={ __(
							'Posts to Exclude',
							'advanced-query-loop'
						) }
					/>
				</ToolsPanelItem>
			) }
			{ allowedControls.includes( 'exclude_current_post' ) && (
				<ToolsPanelItem
					label={ __(
						'Exclude current post',
						'advanced-query-loop'
					) }
					hasValue={ () => !! query.exclude_current }
					onDeselect={ () =>
						removeKeys( attributes, setAttributes, [
							'exclude_current',
						] )
					}
				>
					<ExcludeCurrentPostToggle { ...props } />
				</ToolsPanelItem>
			) }
			{ allowedControls.includes( 'child_items_only' ) && (
				<ToolsPanelItem
					label={ __( 'Child items only', 'advanced-query-loop' ) }
					hasValue={ () => !! query.post_parent }
					onDeselect={ () =>
						removeKeys( attributes, setAttributes, [
							'post_parent',
						] )
					}
				>
					<ChildItemsToggle { ...props } />
				</ToolsPanelItem>
			) }
		</ToolsPanel>
	);
};
