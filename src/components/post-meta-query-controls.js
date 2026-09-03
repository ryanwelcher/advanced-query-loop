/* eslint-disable @wordpress/no-unsafe-wp-apis */
/**
 * WordPress dependencies
 */
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { MetaConditionList } from './meta-condition-list';
import { QueryBuilderModal } from './query-builder-modal';
import { PlaceholderReference } from './placeholder-reference';
import {
	countConditions,
	createCondition,
	createGroup,
	findConditionById,
	updateConditionById,
} from '../utils/meta-query-tree';
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
	const [ activeConditionId, setActiveConditionId ] = useState( null );
	const [ insertNotice, setInsertNotice ] = useState( null );

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

	const setQueries = ( newQueries ) => {
		setAttributes( {
			query: {
				...attributes.query,
				meta_query: {
					...attributes.query.meta_query,
					queries: newQueries,
				},
			},
		} );
	};

	const addCondition = () => setQueries( [ ...queries, createCondition() ] );
	const addGroup = () => setQueries( [ ...queries, createGroup() ] );

	/**
	 * Write a placeholder token into the most recently focused value field.
	 *
	 * @param {string} name The placeholder name.
	 */
	const insertPlaceholder = ( name ) => {
		const target = findConditionById( queries, activeConditionId );
		if ( ! target?.meta_key ) {
			setInsertNotice(
				__(
					'Select a Meta Value field first, then click a placeholder to insert it there.',
					'advanced-query-loop'
				)
			);
			return;
		}
		setInsertNotice( null );
		setQueries(
			updateConditionById( queries, target.id, {
				meta_value: `{aql:${ name }}`,
			} )
		);
	};

	const resetConditions = () => {
		setAttributes( {
			query: { ...attributes.query, meta_query: {} },
		} );
	};

	const conditionCount = countConditions( queries );

	let summary = null;
	if ( conditionCount === 1 ) {
		summary = __( '1 condition', 'advanced-query-loop' );
	} else if ( conditionCount > 1 ) {
		summary = sprintf(
			/* translators: 1: number of conditions, 2: "all" or "any" */
			__( '%1$d conditions, match %2$s', 'advanced-query-loop' ),
			conditionCount,
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
					<Button variant="secondary" onClick={ addGroup }>
						{ __( 'Add group', 'advanced-query-loop' ) }
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
			<div className="aql-meta-builder">
				<div className="aql-meta-builder__conditions">
					<MetaConditionList
						entries={ queries }
						relation={ relation }
						onChange={ setQueries }
						onRelationChange={ setRelation }
						registeredMetaKeys={ registeredMetaKeys }
						onValueFocus={ setActiveConditionId }
					/>
				</div>
				<PlaceholderReference
					onInsert={ insertPlaceholder }
					notice={ insertNotice }
				/>
			</div>
		</QueryBuilderModal>
	);
};
