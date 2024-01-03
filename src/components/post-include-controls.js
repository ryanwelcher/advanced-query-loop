/**
 * WordPress dependencies
 */
import { FormTokenField, BaseControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Generates a post include control component.
 *
 *@return {Element} PostIncludeControls
 */

export const PostIncludeControls = ( { attributes, setAttributes } ) => {
	const {
		query: {
			include_posts: includePosts = [],
			postType,
			multiple_posts: multiplePosts = [],
			exclude_current: excludeCurrent = 0,
		} = {},
	} = attributes;

	const posts = useSelect(
		( select ) => {
			const { getEntityRecords } = select( 'core' );

			return [ ...multiplePosts, postType ].reduce(
				( totalRecords, currentPostType ) => {
					const records = getEntityRecords(
						'postType',
						currentPostType,
						{
							per_page: -1,
							exclude: excludeCurrent ? [ excludeCurrent ] : [],
						}
					);
					return [ ...totalRecords, ...( records || [] ) ];
				},
				[]
			);
		},
		[ postType, multiplePosts, excludeCurrent ]
	);

	/**
	 * Retrieves the title of a post based on its ID.
	 *
	 * @param {number} id - The ID of the post.
	 * @return {Array} - An array containing the title of the post, or an empty array if the post is not found.
	 */
	const getPostTitle = ( id ) => {
		const foundPost = posts.find( ( post ) => post.id === id );
		return foundPost ? foundPost.title.rendered : '';
	};

	/**
	 * Retrieves the ID of a post based on its title.
	 *
	 * @param {string} postTitle - The title of the post.
	 * @return {Array} An array containing the ID of the post.
	 */
	const getPostId = ( postTitle ) => {
		const foundPost = posts.find(
			( post ) => post.title.rendered === postTitle
		);
		return foundPost ? foundPost.id : '';
	};

	if ( ! posts ) {
		return <div>{ __( 'Loading…', 'advanced-query-loop' ) }</div>;
	}

	return (
		<>
			<h2> { __( 'Include Posts', 'advanced-query-loop' ) }</h2>
			<BaseControl
				help={ __(
					'Start typing to search for a post title or manually enter one.',
					'advanced-query-loop'
				) }
			>
				<FormTokenField
					label={ __( 'Posts', 'advanced-query-loop' ) }
					value={ includePosts.map( ( id ) => getPostTitle( id ) ) }
					suggestions={ posts.map( ( post ) => post.title.rendered ) }
					onChange={ ( titles ) => {
						setAttributes( {
							query: {
								...attributes.query,
								include_posts:
									titles.map( ( title ) =>
										getPostId( title )
									) || [],
							},
						} );
					} }
					__experimentalExpandOnFocus
					__experimentalShowHowTo={ false }
				/>
			</BaseControl>
		</>
	);
};