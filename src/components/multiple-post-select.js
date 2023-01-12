/**
 * WordPress dependencies
 */
import { PanelBody, FormTokenField } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

export const MultiplePostSelect = ( { attributes, setAttributes } ) => {
	const { query: { multiple_posts: multiplePosts = [] } = {} } = attributes;

	const postTypes = useSelect( ( select ) =>
		select( coreStore )
			.getPostTypes()
			.filter( ( { viewable } ) => viewable )
			.map( ( { slug } ) => slug )
	);

	return (
		<PanelBody
			title={ __( 'Multiple Post Select', 'advanced-query-loop' ) }
		>
			<FormTokenField
				value={ multiplePosts }
				suggestions={ postTypes }
				onChange={ ( posts ) => {
					// filter the tokens to remove wrong items.
					setAttributes( {
						query: {
							...attributes.query,
							multiple_posts: posts,
						},
					} );
				} }
				__experimentalExpandOnFocus
			/>
		</PanelBody>
	);
};
