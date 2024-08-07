/**
 * WordPress dependencies
 */
import { FormTokenField, BaseControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

export const MultiplePostSelect = ( { attributes, setAttributes } ) => {
	const { query: { multiple_posts: multiplePosts = [], postType } = {} } =
		attributes;

	const postTypes = useSelect( ( select ) =>
		select( coreStore )
			.getPostTypes( { per_page: 50 } )
			?.filter( ( { viewable } ) => viewable )
			?.map( ( { slug } ) => slug )
	);

	if ( ! postTypes ) {
		return <div>{ __( 'Loading…', 'advanced-query-loop' ) }</div>;
	}
	return (
		<BaseControl
			help={ __(
				'These post types will be queried in addition to the main post type.',
				'advanced-query-loop'
			) }
		>
			<FormTokenField
				label={ __( 'Additional Post Types', 'advanced-query-loop' ) }
				value={ [
					...multiplePosts.filter( ( type ) => type !== postType ),
				] }
				suggestions={ [
					...postTypes?.filter( ( type ) => type !== postType ),
				] }
				onChange={ ( posts ) => {
					// filter the tokens to remove wrong items.
					setAttributes( {
						query: {
							...attributes.query,
							multiple_posts: posts || [],
						},
					} );
				} }
				__experimentalExpandOnFocus
				__experimentalShowHowTo={ false }
			/>
		</BaseControl>
	);
};
