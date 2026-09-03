/**
 * External dependencies
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Helpers for the meta query entry tree. An entry is either a condition
 * ({ id, meta_key, meta_value, meta_compare, meta_type }) or a group
 * ({ id, relation, queries }) whose queries hold further entries.
 */

/**
 * @param {Object} entry The entry.
 * @return {boolean} Whether the entry is a group.
 */
export const isGroup = ( entry ) => Array.isArray( entry?.queries );

/**
 * @return {Object} A blank condition.
 */
export const createCondition = () => ( {
	id: uuidv4(),
	meta_key: '',
	meta_value: '',
	meta_compare: '',
} );

/**
 * @return {Object} A group holding one blank condition.
 */
export const createGroup = () => ( {
	id: uuidv4(),
	relation: 'AND',
	queries: [ createCondition() ],
} );

/**
 * Count the conditions at every depth.
 *
 * @param {Array} entries The entries.
 * @return {number} The condition count.
 */
export const countConditions = ( entries = [] ) =>
	entries.reduce(
		( total, entry ) =>
			total + ( isGroup( entry ) ? countConditions( entry.queries ) : 1 ),
		0
	);

/**
 * Find a condition by ID at any depth.
 *
 * @param {Array}  entries The entries.
 * @param {string} id      The condition ID.
 * @return {Object|null} The condition.
 */
export const findConditionById = ( entries = [], id ) => {
	for ( const entry of entries ) {
		if ( isGroup( entry ) ) {
			const found = findConditionById( entry.queries, id );
			if ( found ) {
				return found;
			}
		} else if ( entry.id === id ) {
			return entry;
		}
	}
	return null;
};

/**
 * Return a copy of the tree with changes merged into one condition.
 *
 * @param {Array}  entries The entries.
 * @param {string} id      The condition ID.
 * @param {Object} changes Fields to merge.
 * @return {Array} The updated entries.
 */
export const updateConditionById = ( entries = [], id, changes ) =>
	entries.map( ( entry ) => {
		if ( isGroup( entry ) ) {
			return {
				...entry,
				queries: updateConditionById( entry.queries, id, changes ),
			};
		}
		return entry.id === id ? { ...entry, ...changes } : entry;
	} );
