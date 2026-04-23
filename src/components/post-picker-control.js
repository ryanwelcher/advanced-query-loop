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
 * Generates a post picker control component.
 *
 *@return {Element} PostPickerControl
 */
export const PostPickerControl = ( {
	attributes,
	setAttributes,
	allowedControls,
	queryField,
	title,
} ) => {
	const {
		query: {
			[queryField]: selectedPosts = [],
			postType,
			multiple_posts: multiplePosts = [],
		} = {},
	} = attributes;
	const [ searchArg, setSearchArg ] = useState( '' );
	const debouncedSetSearchArg = useDebounce( setSearchArg, 500 ); // Debouncing so fast typers don't flood the server with requests.
	const [ multiplePostsState, setMultiplePostsState ] =
		useState( multiplePosts );

	// For backwards compatibility, if selectedPosts is an array of post ids, we're going to select them and then
	// update the attributes to have the newer form of {id,title}
	useSelect(
		( select ) => {

			if ( ! selectedPosts.length || typeof selectedPosts[0] === 'object' ) {
				// Nothing to do, either empty or already in the shape we want.
				return;
			}

			const { getEntityRecords } = select( 'core' );
			const reduced = [ ...multiplePosts, postType ].reduce(
				( accumulator, currentPostType ) => {
					const records = getEntityRecords(
						'postType',
						currentPostType,
						{
							per_page: selectedPosts.length,
							include_posts: selectedPosts,
							_fields: 'id,title',
						}
					);
					return {
						posts: [ ...accumulator.posts, ...( records || [] ) ],
						isLoading: accumulator.isLoading || records === null // if getEntityRecords is calling the server, records will be null until it returns
					}
				},
				{
					posts: [],
					isLoading: false,
				}
			);

			// Once it's done loading, we can update the attributes.
			if ( ! reduced.isLoading ) {
				setAttributes( {
					query: {
						...attributes.query,
						[queryField]: reduced.posts.map( post => {
							return ( post.id && post.title.rendered  )
								? { id: post.id, title: post.title.rendered }
								: post
						})
					},
				} );
			}
		},
		[ postType, multiplePosts, selectedPosts ]
	);

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
		[ postType, multiplePosts, searchArg ]
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
					[queryField]: [],
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
			selectedPosts.find(
				( post ) => decodeEntities( post.title ) === postTitle
			) ||
			posts.find(
				( post ) =>
					decodeEntities( post.title.rendered.trim() ) === postTitle
			);

		return foundPost?.title.rendered
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
			<h2>{title}</h2>
			<BaseControl
				help={ __(
					'Start typing to search for a post title or manually enter one.',
					'advanced-query-loop'
				) }
				__nextHasNoMarginBottom
			>
				<FormTokenField
					label={ __( 'Posts', 'advanced-query-loop' ) }
					value={ selectedPosts.map( ( item ) =>
						item.title ? decodeEntities( item.title ) : null
					).filter( t => !!t ) }
					suggestions={suggestions}
					onInputChange={ ( searchPost ) =>
						debouncedSetSearchArg( searchPost )
					}
					onChange={ ( titles ) => {
						setAttributes( {
							query: {
								...attributes.query,
								[queryField]:
									titles.map( ( title ) =>
										getPostId( title )
									).filter( t => !!t ) || [],
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
