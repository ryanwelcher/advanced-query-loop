/**
 * WordPress dependencies
 */
import { FormTokenField, BaseControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
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
	const [ searchArg, setSearchArg ] = useState( '' );
	const [ multiplePostsState, setMultiplePostsState ] =
		useState( multiplePosts );
	const [ excludeCurrentState, setExcludeCurrentState ] =
		useState( excludeCurrent );

	const posts = useSelect(
		( select ) => {
			const { getEntityRecords } = select( 'core' );

			return [ ...multiplePosts, postType ].reduce(
				( totalRecords, currentPostType ) => {
					const records = getEntityRecords(
						'postType',
						currentPostType,
						{
							per_page: 10,
							search: searchArg,
							exclude: excludeCurrent ? [ excludeCurrent ] : [],
						}
					);
					return [ ...totalRecords, ...( records || [] ) ];
				},
				[]
			);
		},
		[ postType, multiplePosts, excludeCurrent, searchArg ]
	);

	/**
	 * This useEffect hook is triggered whenever the multiplePosts variable changes.
	 * It checks if the value of multiplePosts is different from the value of multiplePostsState.
	 * If the condition is true, it updates the query attribute using the setAttributes function, setting include_posts to an empty array.
	 */
	useEffect( () => {
		if (
			JSON.stringify( multiplePosts ) !==
				JSON.stringify( multiplePostsState ) ||
			excludeCurrent !== excludeCurrentState
		) {
			setAttributes( {
				query: {
					...attributes.query,
					include_posts: [],
				},
			} );
			setMultiplePostsState( multiplePosts );
			setExcludeCurrentState( excludeCurrent );
		}
	}, [ multiplePosts, excludeCurrent ] );
	
	/**
	 * Retrieves the ID of a post based on its title.
	 *
	 * @param {string} postTitle - The title of the post.
	 * @return {Array} An array containing the ID of the post.
	 */
	const getPostId = ( postTitle ) => {
		const foundPost =
			includePosts.find( ( post ) => post.title === postTitle ) ||
			posts.find( ( post ) => post.title.rendered === postTitle );

		return foundPost.title.rendered
			? { id: foundPost.id, title: foundPost.title.rendered }
			: foundPost;
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
					value={ includePosts.map( ( item ) => item.title ) }
					suggestions={ posts.map( ( post ) => post.title.rendered ) }
					onInputChange={ ( searchPost ) =>
						setSearchArg( searchPost )
					}
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
						setSearchArg( '' );
					} }
					__experimentalExpandOnFocus
					__experimentalShowHowTo={ false }
				/>
			</BaseControl>
		</>
	);
};
