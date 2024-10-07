/**
 * WordPress dependencies
 */
/**
 * WordPress dependencies
 */
import { FormTokenField, BaseControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';

/**
 * A helper to retrieve the correct items to display or save in the token field
 *
 * @param {Array}  subSet
 * @param {Array}  fullSet
 * @param {string} lookupProperty
 * @param {string} returnProperty
 * @return {Array} The correct items to display or save in the token field
 */
function prepDataFromTokenField(
	subSet,
	fullSet,
	lookupProperty,
	returnProperty
) {
	const subsetFullObjects = fullSet.filter( ( item ) =>
		subSet.includes( item[ lookupProperty ] )
	);
	return subsetFullObjects.map(
		( { [ returnProperty ]: returnVal } ) => returnVal
	);
}

export const ExcludeTaxonomies = ( { attributes, setAttributes } ) => {
	const {
		query: {
			multiple_posts: multiplePosts = [],
			postType,
			excluded_taxonomies: excludedTaxonomies = [],
		} = {},
	} = attributes;

	const taxonomies = useSelect(
		( select ) => {
			const knownTaxes = select( coreDataStore ).getTaxonomies();
			return knownTaxes.filter(
				( { types } ) =>
					types.includes( postType ) ||
					types.some( ( i ) => multiplePosts.includes( i ) )
			);
		},
		[ multiplePosts, postType ]
	);

	return (
		<BaseControl
			help={ __(
				'Choose taxonomies to exclude from the query.',
				'advanced-query-loop'
			) }
		>
			<FormTokenField
				label={ __( 'Exclude Taxonomies', 'advanced-query-loop' ) }
				value={
					prepDataFromTokenField(
						excludedTaxonomies,
						taxonomies,
						'slug',
						'name'
					) || []
				}
				suggestions={ [ ...taxonomies?.map( ( { name } ) => name ) ] }
				onChange={ ( selectedTaxonomies ) => {
					setAttributes( {
						query: {
							...attributes.query,
							excluded_taxonomies:
								prepDataFromTokenField(
									selectedTaxonomies,
									taxonomies,
									'name',
									'slug'
								) || [],
						},
					} );
				} }
				__experimentalExpandOnFocus
				__experimentalShowHowTo={ false }
			/>
		</BaseControl>
	);
};
