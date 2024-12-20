/**
 * Base types for AQL
 */
import type { TaxonomyQuery } from './taxonomy';

export interface AQLQueryAttributes {
	tax_query: {
		relation: 'AND' | 'OR';
		queries: Array< TaxonomyQuery >;
	};
}

export interface AQLAttributes {
	query: AQLQueryAttributes;
}
