/**
 * Helper function to update taxonomy queries.
 *
 * @param {Array}  queries The current queries.
 * @param {string} queryId The query ID to update.
 * @param {string} item    The key to update.
 * @param {string} value   The value to update.
 *
 * @return {Array} The updated queries.
 */
export const updateTaxonomyQuery = ( queries, queryId, item, value ) => {
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

/**
 * A helper to retrieve the correct items to display or save in the token field
 *
 * @param {Array}  subSet
 * @param {Array}  fullSet
 * @param {string} lookupProperty
 * @param {string} returnProperty
 * @return {Array} The correct items to display or save in the token field
 */
export const prepDataFromTokenField = (
	subSet,
	fullSet,
	lookupProperty,
	returnProperty
) => {
	const subsetFullObjects = fullSet.filter( ( item ) =>
		subSet.includes( item[ lookupProperty ] )
	);
	return subsetFullObjects.map(
		( { [ returnProperty ]: returnVal } ) => returnVal
	);
};
