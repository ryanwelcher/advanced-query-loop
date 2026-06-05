/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PostPickerControl } from './post-picker-control';

/**
 * Generates a post include control component.
 *
 *@return {Element} PostIncludeControls
 */

export const PostIncludeControls = ( { allowedControls, ...props } ) => {
	return allowedControls?.includes( 'include_posts' ) ? (
		<PostPickerControl
			title={ __( 'Posts to Include', 'advanced-query-loop' ) }
			queryField="include_posts"
			{ ...props }
		/>
	) : null;
};
