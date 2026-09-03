/* eslint-disable @wordpress/no-unsafe-wp-apis */
/**
 * External dependencies
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * WordPress dependencies
 */
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { PostMetaControl } from './post-meta-control';
import { QueryBuilderModal } from './query-builder-modal';
import usePostTypeMetaFields from '../hooks/usePostTypeMetaFields';

// A component to render a select control for the post meta query.
export const PostMetaQueryControls = ( {
	attributes,
	setAttributes,
	allowedControls,
} ) => {
	const {
		query: {
			postType,
			multiple_posts: multiplePosts = [],
			meta_query: { relation: relationFromQuery = '', queries = [] } = {},
		} = {},
	} = attributes;

	const registeredMetaKeys = usePostTypeMetaFields( [
		postType,
		...multiplePosts,
	] );

	const [ selectedPostType ] = useState( postType );

	useEffect( () => {
		// If the post type changes, reset the meta query.
		if ( postType !== selectedPostType ) {
			setAttributes( {
				query: {
					...attributes.query,
					// include_posts: [],
					meta_query: {},
				},
			} );
		}
	}, [ postType ] );

	// If the control is not allowed, return null.
	if ( ! allowedControls.includes( 'post_meta_query' ) ) {
		return null;
	}

	const relation = relationFromQuery === 'OR' ? 'OR' : 'AND';

	const setRelation = ( newRelation ) => {
		setAttributes( {
			query: {
				...attributes.query,
				meta_query: {
					...attributes.query.meta_query,
					relation: newRelation,
				},
			},
		} );
	};

	const addCondition = () => {
		setAttributes( {
			query: {
				...attributes.query,
				meta_query: {
					...attributes.query.meta_query,
					queries: [
						...queries,
						{
							id: uuidv4(),
							meta_key: '',
							meta_value: '',
							meta_compare: '',
						},
					],
				},
			},
		} );
	};

	const resetConditions = () => {
		setAttributes( {
			query: { ...attributes.query, meta_query: {} },
		} );
	};

	let summary = null;
	if ( queries.length === 1 ) {
		summary = __( '1 condition', 'advanced-query-loop' );
	} else if ( queries.length > 1 ) {
		summary = sprintf(
			/* translators: 1: number of conditions, 2: "all" or "any" */
			__( '%1$d conditions, match %2$s', 'advanced-query-loop' ),
			queries.length,
			relation === 'OR'
				? __( 'any', 'advanced-query-loop' )
				: __( 'all', 'advanced-query-loop' )
		);
	}

	return (
		<QueryBuilderModal
			title={ __( 'Meta Query Builder', 'advanced-query-loop' ) }
			openLabel={ __(
				'Open Post Meta query builder',
				'advanced-query-loop'
			) }
			summary={ summary }
			footer={
				<HStack justify="flex-start">
					<Button variant="primary" onClick={ addCondition }>
						{ __( 'Add new query', 'advanced-query-loop' ) }
					</Button>
					{ queries.length > 0 && (
						<Button
							variant="secondary"
							isDestructive
							onClick={ resetConditions }
						>
							{ __( 'Reset queries', 'advanced-query-loop' ) }
						</Button>
					) }
				</HStack>
			}
		>
			{ queries.length > 1 && (
				<ToggleGroupControl
					label={ __( 'Match', 'advanced-query-loop' ) }
					help={ __(
						'Whether a post must satisfy every condition or any one of them.',
						'advanced-query-loop'
					) }
					value={ relation }
					onChange={ setRelation }
					isBlock
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				>
					<ToggleGroupControlOption
						value="AND"
						label={ __( 'All conditions', 'advanced-query-loop' ) }
					/>
					<ToggleGroupControlOption
						value="OR"
						label={ __( 'Any condition', 'advanced-query-loop' ) }
					/>
				</ToggleGroupControl>
			) }
			{ queries.map( ( { id } ) => (
				<PostMetaControl
					key={ id }
					id={ id }
					registeredMetaKeys={ registeredMetaKeys }
					queries={ queries }
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			) ) }
		</QueryBuilderModal>
	);
};
