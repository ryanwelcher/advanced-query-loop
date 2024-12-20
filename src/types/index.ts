/**
 * Base types for AQL
 */
import type { TaxonomyQuery } from './taxonomy';
import type { Transform } from '@wordpress/blocks';

/**
 * WordPress base types
 */
export interface WPTerm {
	id: number;
	name: string;
}

export interface AQLComponentProps< T extends Record< string, any > > {
	readonly attributes: T;
	readonly setAttributes: ( attrs: Partial< T > ) => void;
}

export interface AQLQueryProps {
	tax_query: {
		relation: 'AND' | 'OR';
		queries: Array< TaxonomyQuery >;
	};
	order: 'asc' | 'desc';
	orderBy: string;
	inherit: boolean;
}

export interface AQLAttributes {
	query: AQLQueryProps;
	namespace: string;
}

export interface BlockTransforms {
	to: Transform[];
	from: Transform[];
}
