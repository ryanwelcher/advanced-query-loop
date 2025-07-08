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
import AQLLegacyControls from '../slots/aql-legacy-controls';
import { PostMetaQueryControls } from '../components/post-meta-query-controls';
import { PostDateQueryControls } from '../components/post-date-query-controls';
import { MultiplePostSelect } from '../components/multiple-post-select';
import { PostOrderControls } from '../components/post-order-controls';
import { PostExcludeControls } from '../components/post-exclude-controls';
import { TaxonomyQueryControl } from '../components/taxonomy-query-control';
import { PostIncludeControls } from '../components/post-include-controls';
import { PaginationToggle } from '../components/pagination-toggle';
import { ChildItemsToggle } from '../components/child-items-toggle';

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
		const { allowedControls } = window?.aql;
		const { attributes } = props;
		const allowedControlsArray = allowedControls.split( ',' );
		const propsWithControls = {
			...props,
			allowedControls: allowedControlsArray,
		};
		// If the inherit prop is false or undefined, add all the controls.
		if ( ! attributes.query.inherit ) {
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
							<AQLLegacyControls.Slot
								fillProps={ { ...propsWithControls } }
							/>

							<MultiplePostSelect { ...propsWithControls } />
							<TaxonomyQueryControl { ...propsWithControls } />
							<PostMetaQueryControls { ...propsWithControls } />
							<PostOrderControls { ...propsWithControls } />
							<PostExcludeControls { ...propsWithControls } />
							<PostIncludeControls { ...propsWithControls } />
							<ChildItemsToggle { ...propsWithControls } />
							<PostDateQueryControls { ...propsWithControls } />
							<PaginationToggle { ...propsWithControls } />
							<AQLControls.Slot
								fillProps={ { ...propsWithControls } }
							/>
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
						<PostOrderControls { ...propsWithControls } />
						<AQLControlsInheritedQuery.Slot
							fillProps={ { ...propsWithControls } }
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
