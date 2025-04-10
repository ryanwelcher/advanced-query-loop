/**
 * WordPress dependencies
 */
import { FormTokenField, BaseControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { prepDataFromTokenField } from '../utils';

export const ExcludeTaxonomies = ( { attributes, setAttributes } ) => {
	const {
		query: {
			multiple_posts: multiplePosts = [],
			postType,
			exclude_taxonomies: excludeTaxonomies = [],
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
			__nextHasNoMarginBottom
		>
			<FormTokenField
				label={ __( 'Exclude Taxonomies', 'advanced-query-loop' ) }
				value={
					prepDataFromTokenField(
						excludeTaxonomies,
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
							exclude_taxonomies:
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
				__nextHasNoMarginBottom
			/>
		</BaseControl>
	);
};
