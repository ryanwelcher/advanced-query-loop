/* eslint-disable @wordpress/no-unsafe-wp-apis */
/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import {
	PanelBody,
	__experimentalVStack as VStack,
	BaseControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';
import { store as editorStore } from '@wordpress/editor';

/**
 *  Internal dependencies
 */
import { AQL } from '.';
import AQLControls from '../slots/aql-controls';
import AQLControlsInheritedQuery from '../slots/aql-controls-inherited-query';
import AQLLegacyControls from '../slots/aql-legacy-controls';
import { PostMetaQueryControls } from '../components/post-meta-query-controls';
import { PostOrderControls } from '../components/post-order-controls';
import { TaxonomyQueryControl } from '../components/taxonomy-query-control';
import { PerformanceControls } from '../components/performance-controls';
import { OrderControls } from '../groups/order';
import { PostParametersControls } from '../groups/post-parameters';
import { DateQueryControls } from '../groups/date-query';
import { AdvancedControls } from '../groups/advanced';

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
 * Fallback list of all control identifiers, used when window.aql.allowedControls
 * is not available (e.g. due to script loading order issues from caching plugins).
 */
const ALL_CONTROLS = [
	'additional_post_types',
	'taxonomy_query_builder',
	'post_meta_query',
	'post_order',
	'exclude_current_post',
	'include_posts',
	'child_items_only',
	'date_query_dynamic_range',
	'date_query_relationship',
	'pagination',
	'exclude_posts',
	'enable_caching',
	'query_id',
];

/**
 * Custom controls
 *
 * @param {*} BlockEdit
 * @return {Element} BlockEdit instance
 */
const withAdvancedQueryControls = ( BlockEdit ) => ( props ) => {
	const { currentPostId, currentPostType } = useSelect(
		( select ) => {
			if ( ! isAdvancedQueryLoop( props ) ) {
				return {
					currentPostId: undefined,
					currentPostType: undefined,
				};
			}
			const editor = select( editorStore );
			return {
				currentPostId: editor.getCurrentPostId(),
				currentPostType: editor.getCurrentPostType(),
			};
		},
		[ props?.attributes?.namespace ]
	);

	// If the is the correct variation, add the custom controls.
	if ( isAdvancedQueryLoop( props ) ) {
		const { allowedControls } = window?.aql ?? {};
		const { attributes } = props;
		const allowedControlsArray =
			allowedControls?.split( ',' ) ?? ALL_CONTROLS;
		const propsWithControls = {
			...props,
			allowedControls: allowedControlsArray,
			context: {
				...props.context,
				currentPostId,
				currentPostType,
			},
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

							<BaseControl
								label={ __(
									'Query Builders',
									'advanced-query-loop'
								) }
								id="query-builders"
							>
								<VStack alignment="center">
									<TaxonomyQueryControl
										{ ...propsWithControls }
									/>
									<PostMetaQueryControls
										{ ...propsWithControls }
									/>
								</VStack>
							</BaseControl>
							<AQLControls.Slot
								fillProps={ { ...propsWithControls } }
							/>
						</PanelBody>
						<PostParametersControls { ...propsWithControls } />
						<OrderControls { ...propsWithControls } />
						<DateQueryControls { ...propsWithControls } />
						<PerformanceControls { ...propsWithControls } />
						<AdvancedControls { ...propsWithControls } />
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
