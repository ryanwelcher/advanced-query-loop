/**
 * WordPress dependencies
 */
import {
	SelectControl,
	Button,
	FormTokenField,
	BaseControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const compareMetaOptions = [
	'=',
	'!=',
	'>',
	'>=',
	'<',
	'<=',
	'LIKE',
	'NOT LIKE',
	'IN',
	'NOT IN',
	'BETWEEN',
	'NOT BETWEEN',
	'EXISTS',
	'NOT EXISTS',
	'REGEXP',
	'NOT REGEXP',
	'RLIKE',
];

const dynamicMetaValues = [
	'Current Post ID',
	'Current Author ID',
	'User ID ',
	'Current Date',
];

export const PostMetaControl = ( {
	registeredMetaKeys,
	id,
	queries,
	attributes,
	setAttributes,
	postId,
} ) => {
	const activeQuery = queries.find( ( query ) => query.id === id );

	/**
	 * Update a query param.
	 *
	 * @param {*} queries
	 * @param {*} queryId
	 * @param {*} item
	 * @param {*} value
	 * @return
	 */
	const updateQueryParam = ( queries, queryId, item, value ) => {
		return queries.map( ( query ) => {
			if ( query.id === queryId ) {
				return {
					...query,
					[ item ]: value,
					currentPost: postId,
				};
			}
			return query;
		} );
	};
	return (
		<>
			<BaseControl
				help={ __(
					'Start typing to search for a meta key or manually enter one.',
					'advanced-query-loop'
				) }
			>
				<FormTokenField
					label={ __( 'Meta Key', 'advanced-query-loop' ) }
					value={
						activeQuery?.meta_key?.length
							? [ activeQuery.meta_key ]
							: []
					}
					__experimentalShowHowTo={ false }
					suggestions={ registeredMetaKeys }
					maxLength={ 1 }
					onChange={ ( newMeta ) => {
						setAttributes( {
							query: {
								...attributes.query,
								meta_query: {
									...attributes.query.meta_query,
									queries: updateQueryParam(
										queries,
										id,
										'meta_key',
										newMeta[ 0 ]
									),
								},
							},
						} );
					} }
				/>
			</BaseControl>
			<BaseControl
				help={ __(
					'Start typing to search for a dynamic meta value or manually enter any value and press return to save it',
					'advanced-query-loop'
				) }
			>
				<FormTokenField
					label={ __( 'Meta Value', 'advanced-query-loop' ) }
					value={
						activeQuery?.meta_value?.length
							? [ activeQuery.meta_value ]
							: []
					}
					__experimentalShowHowTo={ false }
					suggestions={ dynamicMetaValues }
					maxLength={ 1 }
					onChange={ ( newValue ) => {
						setAttributes( {
							query: {
								...attributes.query,
								meta_query: {
									...attributes.query.meta_query,
									queries: updateQueryParam(
										queries,
										id,
										'meta_value',
										newValue[ 0 ]
									),
								},
							},
						} );
					} }
				/>
			</BaseControl>
			<SelectControl
				label={ __( 'Meta Compare', 'advanced-query-loop' ) }
				value={ activeQuery.meta_compare }
				options={ [
					...compareMetaOptions.map( ( operator ) => {
						return { label: operator, value: operator };
					} ),
				] }
				onChange={ ( newCompare ) => {
					setAttributes( {
						query: {
							...attributes.query,
							meta_query: {
								...attributes.query.meta_query,
								queries: updateQueryParam(
									queries,
									id,
									'meta_compare',
									newCompare
								),
							},
						},
					} );
				} }
			/>
			<Button
				size="small"
				variant="secondary"
				isDestructive
				onClick={ () => {
					const updatedQueries = queries.filter(
						( query ) => query.id !== id
					);

					setAttributes( {
						query: {
							...attributes.query,
							meta_query: {
								...attributes.query.meta_query,
								queries: updatedQueries,
							},
						},
					} );
				} }
			>
				{ __( 'Remove meta query', 'advanced-query-loop' ) }
			</Button>
		</>
	);
};
