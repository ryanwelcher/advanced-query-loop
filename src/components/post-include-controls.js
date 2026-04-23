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

export const PostIncludeControls = ( props ) => (
	<PostPickerControl
		title={ __( 'Include Posts', 'advanced-query-loop' ) }
		queryField="include_posts"
		{ ...props }
	/>
);
