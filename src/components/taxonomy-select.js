/**
 * WordPress dependencies
 */
import {
	FormTokenField,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as coreStore, useEntityRecords } from '@wordpress/core-data';
import { useState, useMemo, useEffect } from '@wordpress/element';
import { useDebounce } from '@wordpress/compose';

const operatorOptions = [ 'IN', 'NOT IN', 'EXISTS', 'NOT EXISTS', 'AND' ];

export const TaxonomySelect = ( { attributes, setAttributes } ) => {
	const { query: { postType, tax_query: taxQuery = {} } = {} } = attributes;
	const {
		taxonomy = '',
		terms = [],
		operator,
		include_children: includeChildren = true,
	} = taxQuery;

	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ isHierarchical, setIsHierarchical ] = useState( false );
	const debouncedSetSearchTerm = useDebounce( setSearchTerm, 500 );

	// When there is only 1 term, we need to use the IN operator.
	useEffect( () => {
		if ( taxonomy && terms.length < 2 && operator !== 'IN' ) {
			setAttributes( {
				query: {
					...attributes.query,
					tax_query: {
						...attributes.query.tax_query,
						operator: 'IN',
					},
				},
			} );
		}
	}, [ attributes, terms, setAttributes, operator, taxonomy ] );

	useEffect( () => {
		if ( ! taxonomy ) {
			setAttributes( {
				query: {
					...attributes.query,
					tax_query: {},
				},
			} );
		}
	}, [ taxonomy, setAttributes ] );

	const taxonomies = useSelect( ( select ) =>
		select( coreStore )
			.getTaxonomies()
			.filter( ( { types } ) => types.includes( postType ) )
	);

	const { records } = useEntityRecords( 'taxonomy', taxonomy, {
		per_page: 10,
		search: searchTerm,
		_fields: 'id,name',
		context: 'view',
	} );

	const suggestions = useMemo( () => {
		return ( records ?? [] ).map( ( term ) => term.name );
	}, [ records ] );

	return (
		<>
			<h2>{ __( 'Taxonomy Query', 'advanced-query-loop' ) }</h2>
			<SelectControl
				label={ __( 'Taxonomy', 'advanced-query-loop' ) }
				value={ taxQuery?.taxonomy }
				options={ [
					{ label: 'Choose taxonomy', value: '' },
					...taxonomies.map( ( { name, slug } ) => {
						return { label: name, value: slug };
					} ),
				] }
				onChange={ ( newTaxonomy ) => {
					setAttributes( {
						query: {
							...attributes.query,
							tax_query: {
								...attributes.query.taxQuery,
								taxonomy: newTaxonomy,
							},
						},
					} );
				} }
			/>
			{ taxonomy.length > 1 && (
				<>
					<FormTokenField
						label={ __( 'Term(s)', 'advanced-query-loop' ) }
						suggestions={ suggestions }
						value={ terms }
						onInputChange={ ( newInput ) => {
							debouncedSetSearchTerm( newInput );
						} }
						onChange={ ( newTerms ) => {
							setAttributes( {
								query: {
									...attributes.query,
									tax_query: {
										...attributes.query.tax_query,
										terms: newTerms,
									},
								},
							} );
						} }
					/>
					<ToggleControl
						label={ __(
							'Include children?',
							'advanced-query-loop'
						) }
						checked={ includeChildren }
						onChange={ () => {
							setAttributes( {
								query: {
									...attributes.query,
									tax_query: {
										...attributes.query.tax_query,
										include_children: ! includeChildren,
									},
								},
							} );
						} }
						help={ __(
							'For hierarchical taxonomies only',
							'advanced-query-loop'
						) }
						disabled={ ! isHierarchical }
					/>
					<SelectControl
						label={ __( 'Operator', 'advanced-query-loop' ) }
						value={ operator }
						options={ [
							...operatorOptions.map( ( value ) => {
								return { label: value, value };
							} ),
						] }
						disabled={ terms.length < 2 }
						onChange={ ( newOperator ) => {
							setAttributes( {
								query: {
									...attributes.query,
									tax_query: {
										...attributes.query.tax_query,
										operator: newOperator,
									},
								},
							} );
						} }
					/>
				</>
			) }
		</>
	);
};
