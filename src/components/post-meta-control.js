/**
 * WordPress dependencies
 */
import {
	Button,
	FormTokenField,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,
	SelectControl,
	TextControl,
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

const toggleMargin = {
	marginTop: '1.5em',
	marginBottom: '0.75em',
};

export const PostMetaControl = ( {
	registeredMetaKeys,
	id,
	queries,
	attributes,
	setAttributes,
} ) => {
	const activeQuery = queries.find( ( query ) => query.id === id );

	/**
	 * Update a query param.
	 *
	 * @param {Array} currentQueries The current queries array
	 * @param {string} queryId       The query ID to update
	 * @param {string} item The key to update
	 * @param {string} value The value to update
	 * @return {Array} The updated queries array
	 */
	const updateQueryParam = ( currentQueries, queryId, item, value ) => {
		return currentQueries.map( ( query ) => {
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
				__nextHasNoMarginBottom
			/>
			{ activeQuery?.meta_key?.length > 0 && (
				<>
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
						__nextHasNoMarginBottom
					/>
				</>
			) }
			<hr />
			<HStack
				alignment={ activeQuery?.meta_key ? 'edge' : 'right' }
				style={ toggleMargin }
			>
				<Button
					key={ id }
					variant="secondary"
					size="small"
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
					{ __( 'Remove query', 'advanced-query-loop' ) }
				</Button>
			</HStack>
			<hr />
			<br />
		</>
	);
};
