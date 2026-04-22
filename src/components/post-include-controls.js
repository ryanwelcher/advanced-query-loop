/**
 * WordPress dependencies
 */
import { BaseControl, FormTokenField } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { useDebounce } from '@wordpress/compose';
import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Generates a post include control component.
 *
 *@return {Element} PostIncludeControls
 */

export const PostIncludeControls = ( {
	attributes,
	setAttributes,
	allowedControls,
} ) => {
	const {
		query: {
			include_posts: includePosts = [],
			postType,
			multiple_posts: multiplePosts = [],
			exclude_current: excludeCurrent = 0,
		} = {},
	} = attributes;
	const [ searchArg, setSearchArg ] = useState( '' );
	const debouncedSetSearchArg = useDebounce( setSearchArg, 500 ); // Debouncing so fast typers don't flood the server with requests.
	const [ multiplePostsState, setMultiplePostsState ] =
		useState( multiplePosts );

	const { posts, isLoading } = useSelect(
		( select ) => {
			const { getEntityRecords } = select( 'core' );
			const defaultResult = {
				posts: [],
				isLoading: false,
			};


			if ( ! searchArg ) {
				// Save the initial call to the server if they haven't searched for anything.
				return defaultResult;
			}

			return [ ...multiplePosts, postType ].reduce(
				( accumulator, currentPostType ) => {
					const records = getEntityRecords(
						'postType',
						currentPostType,
						{
							per_page: 10,
							search: searchArg,
							search_columns: 'post_title',
							_fields: 'id,title',
							exclude: excludeCurrent ? [ excludeCurrent ] : [],
						}
					);
					return {
						posts: [ ...accumulator.posts, ...( records || [] ) ],
						isLoading: accumulator.isLoading || records === null // if getEntityRecords is calling the server, records will be null until it returns
					}
				},
				defaultResult
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
			JSON.stringify( multiplePostsState )
		) {
			setAttributes( {
				query: {
					...attributes.query,
					include_posts: [],
				},
			} );
			setMultiplePostsState( multiplePosts );
		}
	}, [ multiplePosts ] );

	// If the control is not allowed, return null.``
	if ( ! allowedControls.includes( 'include_posts' ) ) {
		return null;
	}

	/**
	 * Retrieves the ID of a post based on its title.
	 *
	 * @param {string} postTitle - The title of the post.
	 * @return {Array} An array containing the ID of the post.
	 */
	const getPostId = ( postTitle ) => {
		const foundPost =
			includePosts.find(
				( post ) => decodeEntities( post.title ) === postTitle
			) ||
			posts.find(
				( post ) =>
					decodeEntities( post.title.rendered.trim() ) === postTitle
			);

		return foundPost.title.rendered
			? { id: foundPost.id, title: foundPost.title.rendered }
			: foundPost;
	};

	if ( ! posts ) {
		return <div>{ __( 'Loading…', 'advanced-query-loop' ) }</div>;
	}

	// If the first post in the posts array does not have a title, don't render the component.
	if ( posts.length > 0 && ! posts[ 0 ].title ) {
		return null;
	}

	// We're going to handle a couple of cases for the suggestions in order to improve the user experience.
	let suggestions;
	if ( isLoading && searchArg ) {
		// There's a search arg and the useSelect hook is still fetching. Show a message saying we're searching.
		// Note, we include the searchArg in the string because the FormTokenField component does its own filtering
		// if it has a search term, so our placeholder must match something, otherwise "No items found" shows.
		/* translators: 1: search string. */
		suggestions = [ sprintf( __( 'Searching "%1$s"', 'advanced-query-loop' ), searchArg ) ];
	} else if ( ! searchArg ) {
		// We don't have a search arg, and we're not loading. Show an instruction.
		suggestions = [ __( 'Type to search by title', 'advanced-query-loop' ) ];
	} else {
		// User has searched and we have results.  Casting the results into a spread set to eliminate duplicates,
		// which cause problems in the control.
		suggestions = [ ...new Set( posts.map( ( post ) =>
			decodeEntities( ( post?.title?.rendered ) || '' )
		) ) ];
	}

	return (
		<>
			<h2> { __( 'Include Posts', 'advanced-query-loop' ) }</h2>
			<BaseControl
				help={ __(
					'Start typing to search for a post title or manually enter one.',
					'advanced-query-loop'
				) }
				__nextHasNoMarginBottom
			>
				<FormTokenField
					label={ __( 'Posts', 'advanced-query-loop' ) }
					value={ includePosts.map( ( item ) =>
						decodeEntities( item.title )
					) }
					suggestions={suggestions}
					onInputChange={ ( searchPost ) =>
						debouncedSetSearchArg( searchPost )
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
					__nextHasNoMarginBottom
				/>
			</BaseControl>
		</>
	);
};
