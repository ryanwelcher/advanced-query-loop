export type TaxonomyOperators =
	| 'EXISTS'
	| 'NOT EXISTS'
	| 'AND'
	| 'IN'
	| 'NOT IN';

export interface TaxonomyQuery {
	id: 'string';
	taxonomy: string;
	terms: Array< string >;
	operator: TaxonomyOperators;
}

export interface SingleTaxonomyControlProps< T extends Record< string, any > >
	extends TaxonomyQuery {
	includeChildren: boolean;
	availableTaxonomies: Array< { name: string; slug: string } >;
	readonly attributes: T;
	readonly setAttributes: ( attrs: Partial< T > ) => void;
}

export interface TermRecord {
	name: string;
}
