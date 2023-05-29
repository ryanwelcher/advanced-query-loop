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
import { PostOrderControls } from '../components/post-order-controls';

/**
 * Determines if the active variation is this one
 *
 * @param {*} props
 * @return {boolean} Is this the correct variation?
 */
const isAdvancedQueryLoop = ( props ) => {
	const {
		attributes: { namespace },
	} = props;
	return namespace && namespace === AQL;
};

/**
 * Custom controls
 *
 * @param {*} BlockEdit
 * @return {Element} BlockEdit instance
 */
const withAdvancedQueryControls = ( BlockEdit ) => ( props ) => {
	// If the is the correct variation, add the custom controls.
	if ( isAdvancedQueryLoop( props ) ) {
		// If the inherit prop is false, add all the controls.
		if ( props.inherit === false ) {
			return (
				<>
					<BlockEdit { ...props } />
					<InspectorControls>
						<PostCountControls { ...props } />
						<PostOffsetControls { ...props } />
						<PostOrderControls { ...props } />
						<PostMetaQueryControls { ...props } />
						<PostDateQueryControls { ...props } />
					</InspectorControls>
				</>
			);
		}
		// Add some controls if the inherit prop is true.
		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PostCountControls { ...props } />
					<PostOrderControls { ...props } />
				</InspectorControls>
			</>
		);
	}
	return <BlockEdit { ...props } />;
};

addFilter( 'editor.BlockEdit', 'core/query', withAdvancedQueryControls );
