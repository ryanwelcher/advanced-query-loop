/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * This hook is here to help convert legacy selected posts (in the form of int[]) into the
 * newer form which is {id: int, title: string}[].
 *
 * @param {string}                            queryField    - The query field name.
 * @param {{ query: object }}                 attributes    - Attributes object containing the query key.
 * @param {function({ query: object }): void} setAttributes - Function to update attributes.
 */
const useLegacySelectedPosts = ( queryField, attributes, setAttributes ) => {
	const {
		query: {
			[ queryField ]: selectedPosts = [],
			postType,
			multiple_posts: multiplePosts = [],
		} = {},
	} = attributes;

	// For backwards compatibility, if selectedPosts is an array of post ids, we're going to select them and then
	// update the attributes to have the newer form of {id,title}
	const { encodedNormalizedLegacyPosts, normalizedLegacyIsLoading } =
		useSelect(
			( select ) => {
				if (
					! selectedPosts.length ||
					typeof selectedPosts[ 0 ] === 'object'
				) {
					// Nothing to do, either empty or already in the shape we want.
					return {
						encodedNormalizedLegacyPosts: '[]',
						normalizedLegacyIsLoading: true, // explicitly prevents the setAttributes in the subsequent useEffect from firing.
					};
				}

				const { getEntityRecords } = select( 'core' );
				const reduced = [ ...multiplePosts, postType ].reduce(
					( accumulator, currentPostType ) => {
						const records = getEntityRecords(
							'postType',
							currentPostType,
							{
								per_page: selectedPosts.length,
								include: selectedPosts,
								_fields: 'id,title',
							}
						);
						return {
							posts: [
								...accumulator.posts,
								...( records || [] ),
							],
							isLoading:
								accumulator.isLoading || records === null, // if getEntityRecords is calling the server, records will be null until it returns
						};
					},
					{
						posts: [],
						isLoading: false,
					}
				);

				return {
					encodedNormalizedLegacyPosts: JSON.stringify(
						reduced.posts
					),
					normalizedLegacyIsLoading: reduced.isLoading,
				};
			},
			[ postType, multiplePosts, selectedPosts ]
		);
	useEffect( () => {
		if ( ! normalizedLegacyIsLoading ) {
			const posts = JSON.parse( encodedNormalizedLegacyPosts );
			if ( posts.length ) {
				setAttributes( {
					query: {
						...attributes.query,
						[ queryField ]: posts.map( ( post ) => {
							return post.id && post.title.rendered
								? { id: post.id, title: post.title.rendered }
								: post;
						} ),
					},
				} );
			}
		}
	}, [ encodedNormalizedLegacyPosts, normalizedLegacyIsLoading ] );
};

export default useLegacySelectedPosts;
