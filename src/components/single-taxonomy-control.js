/**
 * WordPress dependencies
 */
import {
	FormTokenField,
	SelectControl,
	Button,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEntityRecords } from '@wordpress/core-data';
import { useMemo, useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import useDebouncedInputValue from '../hooks/useDebouncedInputValue';
import { updateTaxonomyQuery } from '../utils';
const advancedOperators = [ 'EXISTS', 'NOT EXISTS', 'AND' ];
const operatorOptions = [ 'IN', 'NOT IN', ...advancedOperators ];

const toggleMargin = {
	marginTop: '1.5em',
	marginBottom: '0.75em',
};

/*
tax_query: {
	relation: 'AND',
	queries: [
		{
			taxonomy: 'category',
			terms: [ 'current events' ],
			operator: 'IN',
		},
		{
			taxonomy: 'category',
			terms: [ 'politics' ],
			operator: 'NOT_IN',
		},
	],
},
*/
const SingleTaxonomyControl = ( {
	id,
	taxonomy,
	terms,
	operator,
	includeChildren,
	availableTaxonomies,
	attributes,
	setAttributes,
} ) => {
	const [ searchTerm, setSearchTerm ] = useDebouncedInputValue( '', 500 );

	const [ advancedMode, setAdvancedMode ] = useState( false );
	const [ disableAdvancedToggle, setDisableAdvancedToggle ] =
		useState( false );
	const { records } = useEntityRecords( 'taxonomy', taxonomy, {
		per_page: 10,
		search: searchTerm,
		_fields: 'id,name',
		context: 'view',
	} );

	const suggestions = useMemo( () => {
		return ( records ?? [] ).map( ( term ) => term.name );
	}, [ records ] );

	useEffect( () => {
		if (
			advancedOperators.includes( operator ) ||
			includeChildren === false
		) {
			setAdvancedMode( true );
			setDisableAdvancedToggle( true );
		} else {
			setDisableAdvancedToggle( false );
		}
	}, [ operator, includeChildren ] );

	return (
		<>
			<SelectControl
				label={ __( 'Taxonomy', 'advanced-query-loop' ) }
				value={ taxonomy }
				options={ [
					{ label: 'Choose taxonomy', value: '' },
					...availableTaxonomies.map( ( { name, slug } ) => {
						return {
							label: name,
							value: slug,
						};
					} ),
				] }
				onChange={ ( newTaxonomy ) => {
					setAttributes( {
						query: {
							...attributes.query,
							tax_query: {
								...attributes.query.tax_query,
								queries: updateTaxonomyQuery(
									attributes.query.tax_query.queries,
									id,
									'taxonomy',
									newTaxonomy
								),
							},
						},
					} );
				} }
				__next40pxDefaultSize
			/>
			{ taxonomy.length > 1 && (
				<>
					<FormTokenField
						label={ __( 'Terms', 'advanced-query-loop' ) }
						suggestions={ suggestions }
						value={ terms }
						onInputChange={ ( newInput ) => {
							setSearchTerm( newInput );
						} }
						onChange={ ( newTerms ) => {
							setAttributes( {
								query: {
									...attributes.query,
									tax_query: {
										...attributes.query.tax_query,
										queries: updateTaxonomyQuery(
											attributes.query.tax_query.queries,
											id,
											'terms',
											newTerms,
											'include'
										),
									},
								},
							} );
						} }
						__next40pxDefaultSize
					/>
					{ advancedMode ? (
						<>
							<SelectControl
								label={ __(
									'Operator',
									'advanced-query-loop'
								) }
								value={ operator }
								options={ [
									...operatorOptions.map( ( value ) => {
										return { label: value, value };
									} ),
								] }
								onChange={ ( newOperator ) => {
									setAttributes( {
										query: {
											...attributes.query,
											tax_query: {
												...attributes.query.tax_query,
												queries: updateTaxonomyQuery(
													attributes.query.tax_query
														.queries,
													id,
													'operator',
													newOperator
												),
											},
										},
									} );
								} }
								__next40pxDefaultSize
							/>
							<div style={ toggleMargin }>
								<ToggleControl
									label={ __(
										'Include children',
										'advanced-query-loop'
									) }
									className="advanced-query-loop__include-children"
									checked={ includeChildren }
									onChange={ ( include ) => {
										setAttributes( {
											query: {
												...attributes.query,
												tax_query: {
													...attributes.query
														.tax_query,
													queries:
														updateTaxonomyQuery(
															attributes.query
																.tax_query
																.queries,
															id,
															'include_children',
															include
														),
												},
											},
										} );
									} }
									__next40pxDefaultSize
								/>
							</div>
						</>
					) : (
						<ToggleControl
							label={ __(
								'Exclude these terms from the query',
								'advanced-query-loop'
							) }
							checked={ operator === 'NOT IN' }
							onChange={ () => {
								const currentQuery =
									attributes.query.tax_query.queries.find(
										( query ) => query.id === id
									);

								setAttributes( {
									query: {
										...attributes.query,
										tax_query: {
											...attributes.query.tax_query,
											queries: updateTaxonomyQuery(
												attributes.query.tax_query
													.queries,
												id,
												'operator',
												currentQuery.operator === 'IN'
													? 'NOT IN'
													: 'IN'
											),
										},
									},
								} );
							} }
							__next40pxDefaultSize
						/>
					) }
				</>
			) }
			<hr />
			<HStack
				alignment={ taxonomy ? 'edge' : 'right' }
				style={ toggleMargin }
			>
				{ taxonomy && (
					<ToggleControl
						checked={ advancedMode }
						label={ __( 'Advanced mode', 'advanced-query-loop' ) }
						onChange={ () => setAdvancedMode( ! advancedMode ) }
						disabled={ disableAdvancedToggle }
						__nextHasNoMarginBottom
					/>
				) }
				<Button
					key={ id }
					variant="secondary"
					size="small"
					isDestructive
					onClick={ () =>
						setAttributes( {
							query: {
								...attributes.query,
								tax_query: {
									...attributes.query.tax_query,
									queries:
										attributes.query.tax_query.queries.filter(
											( { id: queryId } ) =>
												queryId !== id
										),
								},
							},
						} )
					}
				>
					{ __( 'Remove query', 'advanced-query-loop' ) }
				</Button>
			</HStack>
			<hr />
			<br />
		</>
	);
};

export default SingleTaxonomyControl;
