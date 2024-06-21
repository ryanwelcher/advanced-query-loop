/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';
/**
 *  Internal dependencies
 */
import { AQL } from '.';
import AQLControls from '../slots/aql-controls';
import AQLControlsInheritedQuery from '../slots/aql-controls-inherited-query';
import { PostCountControls } from '../components/post-count-controls';
import { PostOffsetControls } from '../components/post-offset-controls';
import { PostMetaQueryControls } from '../components/post-meta-query-controls';
import { PostDateQueryControls } from '../components/post-date-query-controls';
import { MultiplePostSelect } from '../components/multiple-post-select';
import { PostOrderControls } from '../components/post-order-controls';
import { PostExcludeControls } from '../components/post-exclude-controls';
import { PostIncludeControls } from '../components/post-include-controls';

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
		const { attributes } = props;
		if ( attributes.query.inherit === false ) {
			return (
				<>
					<BlockEdit { ...props } />
					<InspectorControls>
						<PanelBody
							title={ __(
								'Advanced Query Settings',
								'advanced-query-loop'
							) }
						>
							<MultiplePostSelect { ...props } />
							<PostCountControls { ...props } />
							<PostOffsetControls { ...props } />
							<PostOrderControls { ...props } />
							<PostExcludeControls { ...props } />
							<PostIncludeControls { ...props } />
							<PostMetaQueryControls { ...props } />
							<PostDateQueryControls { ...props } />
							<AQLControls.Slot fillProps={ { ...props } } />
						</PanelBody>
					</InspectorControls>
				</>
			);
		}
		// Add some controls if the inherit prop is true.
		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody
						title={ __(
							'Advanced Query Settings',
							'advanced-query-loop'
						) }
					>
						<PostOrderControls { ...props } />
						<AQLControlsInheritedQuery.Slot
							fillProps={ { ...props } }
						/>
					</PanelBody>
				</InspectorControls>
			</>
		);
	}
	return <BlockEdit { ...props } />;
};

addFilter(
	'editor.BlockEdit',
	'aql/add-add-controls/core/query',
	withAdvancedQueryControls
);

/**
 * Filter to add AQL transform to core/query block
 *
 * @param {Object} settings
 * @param {string} name
 * @return {Object} settings
 */
function addAQLTransforms( settings, name ) {
	if ( name !== 'core/query' ) {
		return settings;
	}

	return {
		...settings,
		keywords: [ ...settings.keywords, 'AQL', 'aql' ],
		transforms: {
			to: settings?.transforms?.to || [],
			from: [
				...( settings?.transforms?.from || [] ),
				{
					type: 'enter',
					regExp: /^(AQL|aql)$/,
					transform: () => {
						return createBlock(
							'core/query',
							{
								namespace: 'advanced-query-loop',
							},
							[]
						);
					},
				},
			],
		},
	};
}

addFilter(
	'blocks.registerBlockType',
	'aql/add-transforms/query-block',
	addAQLTransforms
);
