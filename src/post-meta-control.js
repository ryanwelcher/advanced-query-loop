/**
 * WordPress dependencies
 */
import { SelectControl, TextControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';

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
	'NOT EXISTS',
	'REGEXP',
	'NOT REGEXP',
	'RLIKE',
];

const updateQueryParams = () => {};

export const PostMetaControl = ( {
	registeredMetaKeys,
	id,
	queries,
	metaKey,
	metaValue,
	metaCompare,
	attributes,
	setAttributes,
} ) => {
	const activeQuery = queries.find( ( query ) => query.id === id );

	/**
	 *
	 * @param {*} queries
	 * @param {*} queryId
	 * @param {*} item
	 * @param {*} value
	 * @returns
	 */
	const updateQueryParam = ( queries, queryId, item, value ) => {
		return queries.map( ( query ) => {
			if ( query.id === queryId ) {
				return {
					...query,
					[ item ]: value,
				};
			}
			return query;
		} );
	};

	return (
		<>
			<SelectControl
				label={ __( 'Meta Key', 'advanced-query-loop' ) }
				value={ activeQuery.meta_key }
				options={ [
					{ label: 'Choose Meta', value: '' },
					...Object.keys( registeredMetaKeys ).map(
						( selectedKey ) => {
							return {
								label: selectedKey,
								value: selectedKey,
							};
						}
					),
				] }
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
									newMeta
								),
							},
						},
					} );
				} }
			/>
			<TextControl
				label={ __( 'Meta Value', 'advanced-query-loop' ) }
				value={ activeQuery.meta_value }
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
									newValue
								),
							},
						},
					} );
				} }
			/>
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
				isSmall
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
