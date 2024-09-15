/**
 * External dependencies
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * WordPress dependencies
 */
import { Button, SelectControl, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEntityRecords, store as coreStore } from '@wordpress/core-data';
import { useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { PostMetaControl } from './post-meta-control';

/**
 * Converts the meta keys from the all sources into a single array.
 *
 * @param {Array} records
 * @return {Array} meta keys
 */
const combineMetaKeys = ( records ) => {
	return {
		...records?.[ 0 ]?.meta,
		...records?.[ 0 ]?.acf,
	};
};

// A component to render a select control for the post meta query.
export const PostMetaQueryControls = ( { attributes, setAttributes } ) => {
	const {
		query: {
			postType,
			meta_query: { relation: relationFromQuery = '', queries = [] } = {},
		} = {},
	} = attributes;

	const { currentPostId, currentAuthorId } = useSelect( ( select ) => {
		return {
			currentPostId: select( editorStore ).getCurrentPostId(),
			currentAuthorId: select( coreStore ).getCurrentUser()?.id,
		};
	}, [] );

	const { records } = useEntityRecords( 'postType', postType, {
		per_page: 1,
	} );

	const [ selectedPostType ] = useState( postType );

	const registeredMeta = combineMetaKeys( records );

	useEffect( () => {
		// If the post type changes, reset the meta query.
		if ( postType !== selectedPostType ) {
			setAttributes( {
				query: {
					...attributes.query,
					include_posts: [],
					meta_query: {},
				},
			} );
		}
	}, [ postType ] );
	return (
		<>
			<h2>{ __( 'Post Meta Query', 'advanced-query-loop' ) }</h2>
			<>
				{ queries.length > 1 && (
					<SelectControl
						label={ __(
							'Query Relationship',
							'advanced-query-loop'
						) }
						value={ relationFromQuery }
						options={ [
							{ label: 'Choose relationship', value: '' },
							{ label: 'AND', value: 'AND' },
							{ label: 'OR', value: 'OR' },
						] }
						onChange={ ( relation ) =>
							setAttributes( {
								query: {
									...attributes.query,
									meta_query: {
										...attributes.query.meta_query,
										relation,
									},
								},
							} )
						}
					/>
				) }

				{ queries.length < 1 && (
					<p>
						{ __(
							'Add a meta query to select post meta to query',
							'advanced-query-loop'
						) }
					</p>
				) }

				{ queries.map(
					( {
						id,
						meta_key: metaKey,
						meta_value: metaValue,
						compare,
					} ) => {
						return (
							<PanelBody key={ id }>
								<PostMetaControl
									postId={ currentPostId }
									id={ id }
									metaKey={ metaKey }
									metaValue={ metaValue }
									metaCompare={ compare }
									registeredMetaKeys={ Object.keys(
										registeredMeta
									) }
									queries={ queries }
									attributes={ attributes }
									setAttributes={ setAttributes }
								/>
							</PanelBody>
						);
					}
				) }
				<Button
					isSmall
					variant="primary"
					onClick={ () => {
						const newQueries = [
							...queries,
							{
								id: uuidv4(),
								meta_key: '',
								meta_value: '',
								meta_compare: '',
							},
						];
						setAttributes( {
							query: {
								...attributes.query,
								meta_query: {
									...attributes.query.meta_query,
									queries: newQueries,
								},
							},
						} );
					} }
				>
					{ __( 'Add meta query', 'advanced-query-loop' ) }
				</Button>
			</>
		</>
	);
};
