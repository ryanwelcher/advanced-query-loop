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
import { __ } from '@wordpress/i18n';
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

	// Get the posts for all post types used in the query.
	const posts = useSelect(
		( select ) => {
			const { getEntityRecords } = select( 'core' );

			// Fetch posts for each post type and combine them into one array
			return [ ...multiplePosts, postType ].reduce(
				( accumulator, type ) => {
					// Depending on the number of posts this could take a while, since we can't paginate here
					const records = getEntityRecords( 'postType', type, {
						per_page: -1,
					} );
					return [ ...accumulator, ...( records || [] ) ];
				},
				[]
			);
		},
		[ postType, multiplePosts ]
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
		const post = posts.find(
			( p ) => decodeEntities( p.title.rendered.trim() ) === title
		);
		return post ? [ post.id ] : [];
	};

	if ( ! posts ) {
		return <div>{ __( 'Loading…', 'advanced-query-loop' ) }</div>;
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
				suggestions={ posts.map( ( post ) =>
					decodeEntities( post.title.rendered.trim() )
				) }
				onChange={ ( titles ) => {
					// Converts the Titles to Post IDs before saving them
					setAttributes( {
						query: {
							...attributes.query,
							exclude_posts:
								titles.flatMap( ( title ) =>
									titleToId( title )
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
