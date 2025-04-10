/**
 * WordPress dependencies
 */
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { store as editorStore } from '@wordpress/editor';

export const ChildItemsToggle = ( { attributes, setAttributes } ) => {
	const { query: { post_parent: postParent } = {} } = attributes;

	const { isHierarchial, postTypeName, postID } = useSelect( ( select ) => {
		const post = select( editorStore ).getCurrentPost();
		const postType = select( editorStore ).getCurrentPostType();
		const postTypeObject = select( coreStore ).getPostType( postType );

		return {
			isHierarchial: postTypeObject?.hierarchical,
			postTypeName: postType,
			postID: post?.id,
		};
	}, [] );

	return (
		<ToggleControl
			__nextHasNoMarginBottom
			label={ __( 'Show child items only', 'advanced-query-loop' ) }
			help={ __(
				'Only show child items of this item. This option is only available for hierarchical post types such as pages.',
				'advanced-query-loop'
			) }
			disabled={ ! isHierarchial && postTypeName !== 'wp_template' }
			checked={ !! postParent }
			onChange={ ( value ) =>
				setAttributes( {
					query: {
						...attributes.query,
						post_parent: value ? postID : 0,
					},
				} )
			}
		/>
	);
};
