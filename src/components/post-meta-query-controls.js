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
import { useEntityRecords } from '@wordpress/core-data';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { PostMetaControl } from './post-meta-control';
import useRegisteredMeta from '../hooks/useRegisteredMeta';

/**
 * Converts the meta keys from the all sources into a single array.
 *
 * @param {Array} records
 * @return {Array} meta keys
 */
const combineMetaKeys = ( records ) => {
	return {
		...records?.[ 0 ]?.meta,
		...records?.[ 0 ]?.acf,
	};
};

// A component to render a select control for the post meta query.
export const PostMetaQueryControls = ( {
	attributes,
	setAttributes,
	allowedControls,
} ) => {
	const {
		query: {
			postType,
			meta_query: { relation: relationFromQuery = '', queries = [] } = {},
		} = {},
	} = attributes;

	const { records } = useEntityRecords( 'postType', postType, {
		per_page: 1,
	} );
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

	const registeredMeta = combineMetaKeys( records );

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
						disabled={ Object.keys( registeredMeta ).length === 0 }
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
												'Match Any Filter',
												'advanced-query-loop'
											) }
											help={ __(
												'By default, filters are combined using the AND operator, meaning all filter conditions must be met. Enable this option to use the OR operator instead, allowing results that match any of the filter conditions.',
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
												registeredMetaKeys={ Object.keys(
													registeredMeta
												) }
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
