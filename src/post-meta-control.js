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
					const newQueries = [
						...queries.filter( ( query ) => query.id !== id ),
						{
							...activeQuery,
							meta_key: newMeta,
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
			/>
			<TextControl
				label={ __( 'Meta Value', 'advanced-query-loop' ) }
				value={ activeQuery.meta_value }
				onChange={ ( newText ) => {
					const newQueries = [
						...queries.filter( ( query ) => query.id !== id ),
						{
							...activeQuery,
							meta_value: newText,
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
					const newQueries = [
						...queries.filter( ( query ) => query.id !== id ),
						{
							...activeQuery,
							meta_compare: newCompare,
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
			/>
			<Button isSmall icon={ closeSmall } />
		</>
	);
};
