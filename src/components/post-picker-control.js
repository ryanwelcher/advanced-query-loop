/**
 * WordPress dependencies
 */
import {
	BaseControl,
	Button,
	FormTokenField,
	Icon,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalItem as Item,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalItemGroup as ItemGroup,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalTruncate as Truncate,
} from '@wordpress/components';
import { speak } from '@wordpress/a11y';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useDebounce } from '@wordpress/compose';
import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';
import useLegacySelectedPosts from '../hooks/useLegacySelectedPosts';
import { chevronDown, chevronUp, closeSmall, dragHandle } from './icons';

// The buttons that move an included post up or down the list.
const MOVE_BUTTONS = [
	{
		direction: 'up',
		icon: chevronUp,
		step: -1,
		/* translators: 1: post title. */
		label: __( 'Move %1$s up', 'advanced-query-loop' ),
	},
	{
		direction: 'down',
		icon: chevronDown,
		step: 1,
		/* translators: 1: post title. */
		label: __( 'Move %1$s down', 'advanced-query-loop' ),
	},
];

/**
 * Generates a post picker control component.
 *
 * @param {Object}   props               Component props
 * @param {Object}   props.attributes    Block attributes
 * @param {Function} props.setAttributes Block attributes setter
 * @param {string}   props.queryField    Either include_posts or exclude_posts
 * @param {string}   props.title         Label for the picker field
 *
 * @return {Element} PostPickerControl
 */
export const PostPickerControl = ( {
	attributes,
	setAttributes,
	queryField,
	title,
} ) => {
	const {
		query: {
			[ queryField ]: selectedPosts = [],
			postType,
			multiple_posts: multiplePosts = [],
			orderBy,
		} = {},
	} = attributes;
	useLegacySelectedPosts( queryField, attributes, setAttributes );
	const [ searchArg, setSearchArg ] = useState( '' );
	const debouncedSetSearchArg = useDebounce( setSearchArg, 500 ); // Debouncing so fast typers don't flood the server with requests.
	const [ multiplePostsState, setMultiplePostsState ] =
		useState( multiplePosts );
	const [ dragIndex, setDragIndex ] = useState( null );
	const moveButtons = useRef( {} );
	const focusAfterMove = useRef( null );

	const { encodedPosts, isLoading } = useSelect(
		( select ) => {
			if ( ! searchArg ) {
				// Save the initial call to the server if they haven't searched for anything.
				return { encodedPosts: '[]', isLoading: false };
			}

			const { getEntityRecords } = select( 'core' );
			const result = [ ...multiplePosts, postType ].reduce(
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
						isLoading: accumulator.isLoading || records === null, // if getEntityRecords is calling the server, records will be null until it returns
					};
				},
				{ posts: [], isLoading: false }
			);
			return {
				encodedPosts: JSON.stringify( result.posts ), // We're returning a primitive string for the posts to avoid unnecessary re-renders from a different array object being returned.
				isLoading: result.isLoading,
			};
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
					[ queryField ]: [],
				},
			} );
			setMultiplePostsState( multiplePosts );
		}
	}, [ multiplePosts ] );

	// Moving a post re-renders the list, so put focus back on the button that moved it.
	useEffect( () => {
		if ( focusAfterMove.current ) {
			moveButtons.current[ focusAfterMove.current ]?.focus();
			focusAfterMove.current = null;
		}
	}, [ selectedPosts ] );

	// In the context of this control, queryField must be include_posts or exclude_posts.
	if ( ! [ 'include_posts', 'exclude_posts' ].includes( queryField ) ) {
		return null;
	}

	const posts = JSON.parse( encodedPosts );
	if ( ! posts ) {
		return <div>{ __( 'Loading…', 'advanced-query-loop' ) }</div>;
	}

	// If the first post in the posts array does not have a title, don't render the component.
	if ( posts.length > 0 && ! posts[ 0 ].title ) {
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

	// We're going to handle a couple of cases for the suggestions in order to improve the user experience.
	let suggestions;
	if ( isLoading && searchArg ) {
		// There's a search arg and the useSelect hook is still fetching. Show a message saying we're searching.
		// Note, we include the searchArg in the string because the FormTokenField component does its own filtering
		// if it has a search term, so our placeholder must match something, otherwise "No items found" shows.
		suggestions = [
			sprintf(
				/* translators: 1: search string. */
				__( 'Searching "%1$s"', 'advanced-query-loop' ),
				searchArg
			),
		];
	} else if ( ! searchArg ) {
		// We don't have a search arg, and we're not loading. Show an instruction.
		suggestions = [
			__( 'Type to search by title', 'advanced-query-loop' ),
		];
	} else {
		// User has searched and we have results.  Casting the results into a spread set to eliminate duplicates,
		// which cause problems in the control.
		suggestions = [
			...new Set(
				posts.map( ( post ) =>
					decodeEntities( post?.title?.rendered || '' )
				)
			),
		];
	}

	// Only the order of included posts matters, so only included posts are shown as a sortable list.
	// The token field is then used for searching only, and the selected posts are listed below it.
	const isSortable = queryField === 'include_posts';

	// Legacy posts are plain IDs until useLegacySelectedPosts converts them, so skip anything without a title.
	const selectedTitles = selectedPosts
		.map( ( item ) => ( item.title ? decodeEntities( item.title ) : null ) )
		.filter( ( t ) => !! t );

	if ( isSortable ) {
		// The token field doesn't know about the selected posts, so don't suggest them again.
		suggestions = suggestions.filter(
			( suggestion ) => ! selectedTitles.includes( suggestion )
		);
	}

	const setSelectedPosts = ( newPosts ) =>
		setAttributes( {
			query: {
				...attributes.query,
				[ queryField ]: newPosts,
			},
		} );

	/**
	 * Moves an included post to a new position.
	 *
	 * @param {number} from The current index of the post.
	 * @param {number} to   The new index of the post.
	 */
	const movePost = ( from, to ) => {
		if ( from === to || to < 0 || to >= selectedPosts.length ) {
			return;
		}
		const reordered = [ ...selectedPosts ];
		reordered.splice( to, 0, ...reordered.splice( from, 1 ) );
		setSelectedPosts( reordered );
		speak(
			sprintf(
				/* translators: 1: post title, 2: new position, 3: number of posts. */
				__(
					'%1$s moved to position %2$d of %3$d',
					'advanced-query-loop'
				),
				decodeEntities( selectedPosts[ from ].title ),
				to + 1,
				selectedPosts.length
			)
		);
	};

	let help = __(
		'Start typing to search for a post title or manually enter one.',
		'advanced-query-loop'
	);
	if ( isSortable && selectedTitles.length > 1 ) {
		help =
			orderBy === 'post__in'
				? __(
						'Drag posts, or use the arrow buttons, to change their order.',
						'advanced-query-loop'
				  )
				: __(
						'To show posts in this order, set Order By to Included Posts.',
						'advanced-query-loop'
				  );
	}

	return (
		<>
			<BaseControl help={ help } __nextHasNoMarginBottom>
				<FormTokenField
					label={ title }
					value={ isSortable ? [] : selectedTitles }
					suggestions={ suggestions }
					onInputChange={ ( searchPost ) =>
						debouncedSetSearchArg( searchPost )
					}
					onChange={ ( titles ) => {
						const newPosts =
							titles
								.map( ( t ) => getPostId( t ) )
								.filter( ( t ) => !! t ) || [];
						// When sorting, the token field only holds the newly picked posts, so add them to the end of the list.
						setSelectedPosts(
							isSortable
								? [
										...selectedPosts,
										...newPosts.filter(
											( post ) =>
												! selectedPosts.some(
													( selected ) =>
														selected.id === post.id
												)
										),
								  ]
								: newPosts
						);
						setSearchArg( '' );
					} }
					__experimentalExpandOnFocus
					__experimentalShowHowTo={ false }
					__nextHasNoMarginBottom
				/>
				{ isSortable && selectedTitles.length > 0 && (
					<ItemGroup isBordered isSeparated size="small">
						{ selectedPosts.map( ( post, index ) =>
							post.title ? (
								<Item
									key={ post.id }
									draggable
									onDragStart={ ( event ) => {
										event.dataTransfer.effectAllowed =
											'move';
										// Firefox won't start a drag without some data.
										event.dataTransfer.setData(
											'text/plain',
											''
										);
										// The browser captures the drag image once this handler returns, so give the row a solid
										// background for the capture and only dim it in the list afterwards.
										const row = event.currentTarget;
										row.style.background =
											'var(--wp-components-color-background, #fff)';
										setTimeout( () => {
											row.style.background = '';
											setDragIndex( index );
										} );
									} }
									onDragOver={ ( event ) =>
										event.preventDefault()
									}
									onDrop={ ( event ) => {
										event.preventDefault();
										// Ignore anything dropped from outside the list.
										if ( dragIndex !== null ) {
											movePost( dragIndex, index );
										}
									} }
									onDragEnd={ () => setDragIndex( null ) }
									style={ {
										cursor: 'grab',
										opacity: dragIndex === index ? 0.5 : 1,
									} }
								>
									<HStack spacing={ 1 }>
										<Icon icon={ dragHandle } />
										<Truncate>
											{ decodeEntities( post.title ) }
										</Truncate>
										<HStack
											spacing={ 0 }
											expanded={ false }
										>
											{ MOVE_BUTTONS.map(
												( {
													direction,
													icon,
													step,
													label,
												} ) => (
													<Button
														key={ direction }
														ref={ ( node ) => {
															moveButtons.current[
																`${ post.id }-${ direction }`
															] = node;
														} }
														icon={ icon }
														size="small"
														label={ sprintf(
															label,
															decodeEntities(
																post.title
															)
														) }
														disabled={
															index + step < 0 ||
															index + step >=
																selectedPosts.length
														}
														accessibleWhenDisabled
														onClick={ () => {
															focusAfterMove.current = `${ post.id }-${ direction }`;
															movePost(
																index,
																index + step
															);
														} }
													/>
												)
											) }
											<Button
												icon={ closeSmall }
												size="small"
												label={ sprintf(
													/* translators: 1: post title. */
													__(
														'Remove %1$s',
														'advanced-query-loop'
													),
													decodeEntities( post.title )
												) }
												onClick={ () =>
													setSelectedPosts(
														selectedPosts.filter(
															( selected ) =>
																selected.id !==
																post.id
														)
													)
												}
											/>
										</HStack>
									</HStack>
								</Item>
							) : null
						) }
					</ItemGroup>
				) }
			</BaseControl>
		</>
	);
};
