/**
 * External dependencies
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * WordPress dependencies
 */
import { Button, SelectControl, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEntityRecords } from '@wordpress/core-data';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { PostMetaControl } from './post-meta-control';

// A component to render a select control for the post meta query.
export const PostMetaQueryControls = ( { attributes, setAttributes } ) => {
	const {
		query: {
			postType,
			meta_query: { relation: relationFromQuery = '', queries = [] } = {},
		} = {},
	} = attributes;

	const { records } = useEntityRecords( 'postType', postType, {
		per_page: 1,
	} );

	const [ selectedPostType ] = useState( postType );

	const registeredMeta = records?.[ 0 ]?.meta || {};

	useEffect( () => {
		// If the post type changes, reset the meta query.
		if ( postType !== selectedPostType ) {
			setAttributes( {
				query: {
					...attributes.query,
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
