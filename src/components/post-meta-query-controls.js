/* eslint-disable @wordpress/no-unsafe-wp-apis */
/**
 * External dependencies
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * WordPress dependencies
 */
import {
	Button,
	Dropdown,
	__experimentalDropdownContentWrapper as DropdownContentWrapper,
	PanelBody,
	ToggleControl,
	Panel,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { PostMetaControl } from './post-meta-control';
import usePostTypeMetaFields from '../hooks/usePostTypeMetaFields';

// A component to render a select control for the post meta query.
export const PostMetaQueryControls = ( {
	attributes,
	setAttributes,
	allowedControls,
} ) => {
	const {
		query: {
			postType,
			multiple_posts: multiplePosts = [],
			meta_query: { relation: relationFromQuery = '', queries = [] } = {},
		} = {},
	} = attributes;

	const registeredMetaKeys = usePostTypeMetaFields( [
		postType,
		...multiplePosts,
	] );

	const [ selectedPostType ] = useState( postType );

	useEffect( () => {
		// If the post type changes, reset the meta query.
		if ( postType !== selectedPostType ) {
			setAttributes( {
				query: {
					...attributes.query,
					// include_posts: [],
					meta_query: {},
				},
			} );
		}
	}, [ postType ] );

	// If the control is not allowed, return null.
	if ( ! allowedControls.includes( 'post_meta_query' ) ) {
		return null;
	}

	return (
		<>
			<Dropdown
				popoverProps={ {
					placement: 'left-start',
					offset: 36,
				} }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						variant={ isOpen ? 'primary' : 'secondary' }
						onClick={ onToggle }
						aria-haspopup="true"
						aria-expanded={ isOpen }
					>
						{ isOpen
							? __(
									'Close Post meta query builder',
									'advanced-query-loop'
							  )
							: __(
									'Open Post Meta query builder',
									'advanced-query-loop'
							  ) }
					</Button>
				) }
				renderContent={ () => (
					<DropdownContentWrapper
						paddingSize="none"
						style={ { width: '30rem' } }
					>
						<Panel
							header={ __(
								'Meta Query Builder',
								'advanced-query-loop'
							) }
						>
							<PanelBody>
								{ queries.length > 1 && (
									<>
										<ToggleControl
											label={ __(
												'Match Any Condition',
												'advanced-query-loop'
											) }
											help={ __(
												'By default, conditions are combined using the AND operator, meaning all conditions must be met. Enable this option to use the OR operator instead, allowing results that match any of the conditions.',
												'advanced-query-loop'
											) }
											checked={
												relationFromQuery === 'OR'
											}
											onChange={ () => {
												setAttributes( {
													query: {
														...attributes.query,
														meta_query: {
															...attributes.query
																.meta_query,
															relation:
																attributes.query
																	.meta_query
																	.relation ===
																'OR'
																	? 'AND'
																	: 'OR',
														},
													},
												} );
											} }
											__nextHasNoMarginBottom={ false }
										/>
										<hr />
									</>
								) }

								{ queries.map(
									( {
										id,
										meta_key: metaKey,
										meta_value: metaValue,
										compare,
									} ) => {
										return (
											<PostMetaControl
												key={ id }
												id={ id }
												metaKey={ metaKey }
												metaValue={ metaValue }
												metaCompare={ compare }
												registeredMetaKeys={
													registeredMetaKeys
												}
												queries={ queries }
												attributes={ attributes }
												setAttributes={ setAttributes }
											/>
										);
									}
								) }

								<HStack>
									<Button
										variant="primary"
										onClick={ () => {
											const newQueries = [
												...queries,
												{
													id: uuidv4(),
													meta_key: '',
													meta_value: '',
													meta_compare: '',
												},
											];
											setAttributes( {
												query: {
													...attributes.query,
													meta_query: {
														...attributes.query
															.meta_query,
														queries: newQueries,
													},
												},
											} );
										} }
									>
										{ __(
											'Add new query',
											'advanced-query-loop'
										) }
									</Button>
									{ queries.length > 0 && (
										<Button
											variant="primary"
											isDestructive
											onClick={ () => {
												setAttributes( {
													query: {
														...attributes.query,
														meta_query: {},
													},
												} );
											} }
										>
											{ __(
												'Reset queries',
												'advanced-query-loop'
											) }
										</Button>
									) }
								</HStack>
							</PanelBody>
						</Panel>
					</DropdownContentWrapper>
				) }
			/>
		</>
	);
};
