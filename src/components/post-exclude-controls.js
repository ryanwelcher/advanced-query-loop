/**
 * WordPress dependencies
 */
import {
	ToggleControl,
	FormTokenField,
	BaseControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEntityRecord, store as coreDataStore } from '@wordpress/core-data';
import { useRef, useState } from '@wordpress/element';
import { useDebounce } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * A component that lets you pick posts to be excluded from the query
 *
 * @param {Object}   props                 Component props
 * @param {Object}   props.attributes      Block attributes
 * @param {Function} props.setAttributes   Block attributes setter
 * @param {Array}    props.allowedControls Allowed controls
 *
 * @return {Element} PostExcludeControls
 */
export const PostExcludeControls = ( {
	attributes,
	setAttributes,
	allowedControls,
} ) => {
	// If the control is not allowed, return null.
	if (
		! allowedControls.includes( 'exclude_current_post' ) &&
		! allowedControls.includes( 'exclude_posts' )
	) {
		return null;
	}

	return (
		<>
			<h2> { __( 'Exclude Posts', 'advanced-query-loop' ) }</h2>
			<ExcludeCurrentPostControl
				attributes={ attributes }
				setAttributes={ setAttributes }
				allowedControls={ allowedControls }
			/>
			<ExcludePostsControl
				attributes={ attributes }
				setAttributes={ setAttributes }
				allowedControls={ allowedControls }
			/>
		</>
	);
};

/**
 * ExcludeCurrentPostControl is a React functional component used within the context
 * of advanced query loop settings. It toggles the exclusion of the current post
 * or content associated with the current template from query results.
 *
 * @param {Object}   props                 The properties passed to the component.
 * @param {Object}   props.attributes      The block attributes.
 * @param {Function} props.setAttributes   Function to update block attributes.
 * @param {Array}    props.allowedControls List of control identifiers that are allowed for this block.
 *
 * @return {Element|null} A `ToggleControl` component if the control is allowed, or `null` if not.
 */
const ExcludeCurrentPostControl = ( {
	attributes,
	setAttributes,
	allowedControls,
} ) => {
	const { query: { exclude_current: excludeCurrent } = {} } = attributes;

	const { record: siteOptions } = useEntityRecord( 'root', 'site' );
	const { currentPost, isAdmin } = useSelect( ( select ) => {
		return {
			currentPost: select( 'core/editor' ).getCurrentPost(),
			isAdmin: select( coreDataStore ).canUser( 'update', {
				kind: 'root',
				name: 'site',
			} ),
		};
	}, [] );

	if ( ! allowedControls.includes( 'exclude_current_post' ) ) {
		return null;
	}

	if ( ! currentPost ) {
		return <div>{ __( 'Loading…', 'advanced-query-loop' ) }</div>;
	}

	const isDisabled = () => {
		// If the user is not an admin, they cannot edit template anyway
		if ( ! isAdmin || ! currentPost ) {
			return false;
		}

		// Only disable if we're editing a template AND it's in the list
		if ( currentPost.type !== 'wp_template' ) {
			return false;
		}

		const templatesToExclude = [ 'archive', 'search' ];
		const {
			show_on_front: showOnFront, // What is the front page set to show? Options: 'posts' or 'page'
		} = siteOptions;
		const disabledTemplates = [
			...templatesToExclude,
			...( showOnFront === 'posts' ? [ 'home', 'front-page' ] : [] ),
		];
		return disabledTemplates.includes( currentPost.slug );
	};

	return (
		<ToggleControl
			__nextHasNoMarginBottom
			label={ __( 'Exclude Current Post', 'advanced-query-loop' ) }
			checked={ !! excludeCurrent }
			disabled={ isDisabled() }
			onChange={ ( value ) => {
				setAttributes( {
					query: {
						...attributes.query,
						exclude_current: value,
					},
				} );
			} }
			help={
				isDisabled()
					? __(
							'This option is disabled for this template as there is no dedicated post to exclude.',
							'advanced-query-loop'
					  )
					: __(
							'Remove the associated post for this template/content from the query results.',
							'advanced-query-loop'
					  )
			}
		/>
	);
};

/**
 * The ExcludePostsControl component allows users to exclude specific posts
 * from queries based on post titles, providing search and selection
 * functionality in the form of a token field.
 *
 * @param {Object}   props                 The component props.
 * @param {Object}   props.attributes      The block attributes.
 * @param {Function} props.setAttributes   Function to update the block attributes.
 * @param {Array}    props.allowedControls List of controls allowed for the current context.
 *
 * @return {Element|null} Returns the control for selecting excluded posts,
 *                             or null if the 'exclude_posts' control is not allowed.
 */
const ExcludePostsControl = ( {
	attributes,
	setAttributes,
	allowedControls,
} ) => {
	const {
		query: {
			exclude_posts: excludePosts = [],
			multiple_posts: multiplePosts = [],
			postType,
		} = {},
	} = attributes;

	const [ searchTerm, setSearchTerm ] = useState( '' );
	const debouncedSetSearchTerm = useDebounce( setSearchTerm, 500 ); // Debouncing so fast typers don't flood the server with requests.

	// Cache every post we resolve so title lookups survive search resets.
	const postCacheRef = useRef( new Map() );

	// Get the posts for all post types used in the query.
	const { posts, isLoading } = useSelect(
		( select ) => {
			const { getEntityRecords } = select( 'core' );
			const defaultResult = {
				posts: [],
				isLoading: false
			};

			// Fetch already-selected posts by ID so saved selections are never lost.
			let selectedPosts = {
				posts: [],
				isLoading: false,
			};
			if ( excludePosts.length > 0 ) {
				const records = getEntityRecords( 'postType', postType, {
					include: excludePosts,
					per_page: excludePosts.length,
					_fields: 'id,title',
				} );
				selectedPosts = {
					posts: records || [],
					isLoading: records === null
				}
			}

			// Fetch posts for each post type and combine them into one array
			const searchResults = searchTerm ? [ ...multiplePosts, postType ].reduce(
				( accumulator, type ) => {
					const records = getEntityRecords( 'postType', type, {
						per_page: 10,
						search: searchTerm,
						search_columns: 'post_title',
						_fields: 'id,title',
					} );
					return {
						posts: [ ...accumulator.posts, ...( records || [] ) ],
						isLoading: records === null
					}
				},
				defaultResult
			) : defaultResult;

			// Merge selected posts with search results, deduplicating by ID.
			const seenIds = new Set( selectedPosts.posts.map( ( p ) => p.id ) );
			const merged = [ ...selectedPosts.posts ];
			for ( const post of searchResults.posts ) {
				if ( ! seenIds.has( post.id ) ) {
					seenIds.add( post.id );
					merged.push( post );
				}
			}

			// Update the cache with all resolved posts.
			for ( const post of merged ) {
				postCacheRef.current.set( post.id, post );
			}

			return {
				posts: merged,
				isLoading: selectedPosts.isLoading || searchResults.isLoading
			};
		},
		[ postType, multiplePosts, searchTerm, excludePosts ]
	);

	if ( ! allowedControls.includes( 'exclude_posts' ) ) {
		return null;
	}

	// For use with flatMap(), as this lets us remove elements during a map()
	const idToTitle = ( id ) => {
		const post = posts.find( ( p ) => p.id === id );
		return post ? [ decodeEntities( post.title.rendered.trim() ) ] : [];
	};

	const titleToId = ( title ) => {
		const post =
			posts.find(
				( p ) => decodeEntities( p.title.rendered.trim() ) === title
			) ||
			[ ...postCacheRef.current.values() ].find(
				( p ) => decodeEntities( p.title.rendered.trim() ) === title
			);
		return post ? [ post.id ] : [];
	};

	if ( ! posts ) {
		return <div>{ __( 'Loading…', 'advanced-query-loop' ) }</div>;
	}

	// We're going to handle a couple of cases for the suggestions in order to improve the user experience.
	let suggestions;
	if ( isLoading && searchTerm ) {
		// There's a search arg and the useSelect hook is still fetching. Show a message saying we're searching.
		// Note, we include the searchTerm in the string because the FormTokenField component does its own filtering
		// if it has a search term, so our placeholder must match something, otherwise "No items found" shows.
		/* translators: 1: search string. */
		suggestions = [ sprintf( __( 'Searching "%1$s"', 'advanced-query-loop' ), searchTerm ) ];
	} else if ( ! searchTerm ) {
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
		<BaseControl
			help={ __(
				'Start typing to search for a post title to exclude, or manually enter one.',
				'advanced-query-loop'
			) }
		>
			<FormTokenField
				label={ __( 'Posts to Exclude', 'advanced-query-loop' ) }
				value={ excludePosts.flatMap( ( id ) => idToTitle( id ) ) }
				suggestions={ suggestions }
				onInputChange={ ( value ) => debouncedSetSearchTerm( value ) }
				onChange={ ( titles ) => {
					// Converts the Titles to Post IDs before saving them
					setAttributes( {
						query: {
							...attributes.query,
							exclude_posts:
								titles.flatMap( ( title ) =>
									titleToId( title )
								).filter( t => !!t ) || [],
						},
					} );
					setSearchTerm('');
				} }
				__experimentalExpandOnFocus
				__experimentalShowHowTo={ false }
			/>
		</BaseControl>
	);
};
