/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';

/**
 *  Internal dependencies
 */
import { AQL } from '.';
import { PostCountControls } from '../components/post-count-controls';
import { PostOffsetControls } from '../components/post-offset-controls';
import { PostMetaQueryControls } from '../components/post-meta-query-controls';
import { PostDateQueryControls } from '../components/post-date-query-controls';

/**
 * Determines if the active variation is this one
 *
 * @param {*} props
 * @return {boolean} Is this the correct variation?
 */
const isAdvancedQueryLoop = ( props ) => {
	const {
		attributes: { namespace, query: { inherit } = {} },
	} = props;
	return namespace && namespace === AQL && inherit === false;
};

/**
 * Custom controls
 *
 * @param {*} BlockEdit
 * @return {Element} BlockEdit instance
 */
const withAdvancedQueryControls = ( BlockEdit ) => ( props ) => {
	// If the is the correct variation, add the custom controls.
	return isAdvancedQueryLoop( props ) ? (
		<>
			<BlockEdit { ...props } />
			<InspectorControls>
				<PostCountControls { ...props } />
				<PostOffsetControls { ...props } />
				<PostMetaQueryControls { ...props } />
				<PostDateQueryControls { ...props } />
			</InspectorControls>
		</>
	) : (
		<>
			<BlockEdit { ...props } />
			<InspectorControls>
				<PostCountControls { ...props } />
			</InspectorControls>
		</>
	);
};

addFilter( 'editor.BlockEdit', 'core/query', withAdvancedQueryControls );
