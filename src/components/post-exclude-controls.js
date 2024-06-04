/**
 * WordPress dependencies
 */
import {
	ToggleControl,
	FormTokenField,
	BaseControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEntityRecord } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';

/**
 * A component that lets you pick posts to be excluded from the query
 *
 * @param {Object}   props               Component props
 * @param {Object}   props.attributes    Block attributes
 * @param {Function} props.setAttributes Block attributes setter
 *
 * @return {Element} PostExcludeControls
 */
export const PostExcludeControls = ( { attributes, setAttributes } ) => {
	const {
		query: {
			exclude_posts: excludePosts = [],
			exclude_current: excludeCurrent,
			postType,
			multiple_posts: multiplePosts = [],
		} = {},
	} = attributes;
	const { record: siteOptions } = useEntityRecord( 'root', 'site' );
	const currentPost = useSelect( ( select ) => {
		return select( 'core/editor' ).getCurrentPost();
	}, [] );

	// Get the posts for all post types used in the query.
	const posts = useSelect(
		( select ) => {
			const { getEntityRecords } = select( 'core' );

			// Fetch posts for each post type and combine them into one array
			return [ ...multiplePosts, postType ].reduce(
				( accumulator, postType ) => {
					// Depending on the number of posts this could take a while, since we can't paginate here
					const records = getEntityRecords( 'postType', postType, {
						per_page: -1,
					} );
					return [ ...accumulator, ...( records || [] ) ];
				},
				[]
			);
		},
		[ postType, multiplePosts ]
	);

	// For use with flatMap(), as this lets us remove elements during a map()
	const idToTitle = ( id ) => {
		const post = posts.find( ( p ) => p.id === id );
		return post ? [ post.title.rendered ] : [];
	};

	const titleToId = ( title ) => {
		const post = posts.find( ( p ) => p.title.rendered === title );
		return post ? [ post.id ] : [];
	};

	if ( ! currentPost || ! posts ) {
		return <div>{ __( 'Loading…', 'advanced-query-loop' ) }</div>;
	}

	const isDisabled = () => {
		const templatesToExclude = [ 'archive', 'search' ];

		const {
			show_on_front: showOnFront, // What is the front page set to show? Options: 'posts' or 'page'
		} = siteOptions;

		const disabledTemplates = [
			...templatesToExclude,
			...( showOnFront === 'posts' ? [ 'home', 'front-page' ] : [] ),
		];

		return (
			currentPost.type === 'wp_template' &&
			disabledTemplates.includes( currentPost.slug )
		);
	};

	return (
		<>
			<h2> { __( 'Exclude Posts', 'advanced-query-loop' ) }</h2>
			<BaseControl
				help={ __(
					'Start typing to search for a post title or manually enter one.',
					'advanced-query-loop'
				) }
			>
				<FormTokenField
					label={ __( 'Posts', 'advanced-query-loop' ) }
					value={ excludePosts.flatMap( ( id ) => idToTitle( id ) ) }
					suggestions={ posts.map( ( post ) => post.title.rendered ) }
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
			<ToggleControl
				label={ __( 'Exclude Current Post', 'advanced-query-loop' ) }
				checked={ !! excludeCurrent }
				disabled={ isDisabled() }
				onChange={ ( value ) => {
					setAttributes( {
						query: {
							...attributes.query,
							exclude_current: value ? currentPost.id : 0,
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
		</>
	);
};
