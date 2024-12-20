import type { AQLComponentProps } from './index';

export type TaxonomyOperators =
	| 'EXISTS'
	| 'NOT EXISTS'
	| 'AND'
	| 'IN'
	| 'NOT IN';

export interface TaxonomyQuery {
	id: 'string';
	taxonomy: string;
	terms: Array< any >;
	operator: TaxonomyOperators;
}
/**
 * This type is passed to the <SingleTaxonomyControl /> component.
 */
export interface SingleTaxonomyControlProps< T extends Record< string, any > >
	extends TaxonomyQuery,
		AQLComponentProps< T > {
	includeChildren: boolean;
	availableTaxonomies: Array< { name: string; slug: string } >;
	readonly attributes: T;
	readonly setAttributes: ( attrs: Partial< T > ) => void;
}
