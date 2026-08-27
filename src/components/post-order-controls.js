/**
 * WordPress dependencies
 */
import {
	FormTokenField,
	SelectControl,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const sortOptions = [
	{
		label: __( 'Name', 'advanced-query-loop' ),
		value: 'name',
	},
	{
		label: __( 'Author', 'advanced-query-loop' ),
		value: 'author',
	},
	{
		label: __( 'Comment Count', 'advanced-query-loop' ),
		value: 'comment_count',
	},
	{
		label: __( 'Date', 'advanced-query-loop' ),
		value: 'date',
	},
	{
		label: __( 'Included Posts', 'advanced-query-loop' ),
		value: 'post__in',
	},
	{
		label: __( 'Last Modified Date', 'advanced-query-loop' ),
		value: 'modified',
	},
	{
		label: __( 'Menu Order', 'advanced-query-loop' ),
		value: 'menu_order',
	},
	{
		label: __( 'Meta Value', 'advanced-query-loop' ),
		value: 'meta_value',
	},
	{
		label: __( 'Meta Value Num', 'advanced-query-loop' ),
		value: 'meta_value_num',
	},
	{
		label: __( 'Post ID', 'advanced-query-loop' ),
		value: 'id',
	},
	{
		label: __( 'Random', 'advanced-query-loop' ),
		value: 'rand',
	},
	{
		label: __( 'Title', 'advanced-query-loop' ),
		value: 'title',
	},
];

/**
 * PostOrderControls component
 *
 * @param {*} param0
 * @return {Element} PostCountControls
 */
export const PostOrderControls = ( {
	attributes,
	setAttributes,
	allowedControls,
} ) => {
	const {
		query: {
			order,
			orderBy,
			orderby_meta_key: orderbyMetaKey,
			secondary_orderby: secondaryOrderby,
		} = {},
	} = attributes;

	const isMetaSort = ( value ) =>
		value === 'meta_value' || value === 'meta_value_num';

	// If the control is not allowed, return null.
	if ( ! allowedControls.includes( 'post_order' ) ) {
		return null;
	}

	return (
		<VStack spacing={ 4 }>
			<SelectControl
				label={ __( 'Post Order By', 'advanced-query-loop' ) }
				value={ orderBy }
				help={
					isMetaSort( orderBy ) && ! orderbyMetaKey
						? __(
								'Set the meta key to sort by. Posts without the key are included after posts that have it.',
								'advanced-query-loop'
						  )
						: ''
				}
				options={ sortOptions.sort( ( a, b ) =>
					a.label.localeCompare( b.label )
				) }
				onChange={ ( newOrderBy ) => {
					const newQuery = {
						...attributes.query,
						orderBy: newOrderBy,
						...( newOrderBy === 'rand' && {
							enable_caching: false,
						} ),
					};
					if ( newOrderBy === 'rand' ) {
						delete newQuery.secondary_orderby;
					}
					if ( ! isMetaSort( newOrderBy ) ) {
						delete newQuery.orderby_meta_key;
					}
					setAttributes( { query: newQuery } );
				} }
				__nextHasNoMarginBottom
			/>
			{ isMetaSort( orderBy ) && (
				<FormTokenField
					label={ __( 'Meta key to sort by', 'advanced-query-loop' ) }
					value={ orderbyMetaKey ? [ orderbyMetaKey ] : [] }
					maxLength={ 1 }
					onChange={ ( [ newKey ] ) => {
						const newQuery = { ...attributes.query };
						if ( newKey ) {
							newQuery.orderby_meta_key = newKey;
						} else {
							delete newQuery.orderby_meta_key;
						}
						setAttributes( { query: newQuery } );
					} }
					__nextHasNoMarginBottom
				/>
			) }
			<ToggleControl
				label={ __( 'Ascending Order', 'advanced-query-loop' ) }
				checked={ order === 'asc' }
				onChange={ () => {
					setAttributes( {
						query: {
							...attributes.query,
							order: order === 'asc' ? 'desc' : 'asc',
						},
					} );
				} }
				__nextHasNoMarginBottom
			/>
			{ orderBy !== 'rand' && (
				<ToggleControl
					label={ __( 'Add secondary sort', 'advanced-query-loop' ) }
					checked={ !! secondaryOrderby }
					onChange={ () => {
						const newQuery = { ...attributes.query };
						if ( secondaryOrderby ) {
							delete newQuery.secondary_orderby;
						} else {
							newQuery.secondary_orderby = {
								order_by: 'date',
								order: 'desc',
							};
						}
						setAttributes( { query: newQuery } );
					} }
					__nextHasNoMarginBottom
				/>
			) }
			{ orderBy !== 'rand' && !! secondaryOrderby && (
				<>
					<SelectControl
						label={ __(
							'Secondary Order By',
							'advanced-query-loop'
						) }
						value={ secondaryOrderby.order_by }
						options={ sortOptions
							.filter(
								( { value } ) =>
									value !== 'rand' &&
									value !== 'post__in' &&
									value !== orderBy
							)
							.sort( ( a, b ) =>
								a.label.localeCompare( b.label )
							) }
						onChange={ ( newOrderBy ) => {
							setAttributes( {
								query: {
									...attributes.query,
									secondary_orderby: {
										...secondaryOrderby,
										order_by: newOrderBy,
									},
								},
							} );
						} }
						__nextHasNoMarginBottom
					/>
					{ isMetaSort( secondaryOrderby.order_by ) && (
						<FormTokenField
							label={ __(
								'Secondary meta key to sort by',
								'advanced-query-loop'
							) }
							value={
								secondaryOrderby.meta_key
									? [ secondaryOrderby.meta_key ]
									: []
							}
							maxLength={ 1 }
							onChange={ ( [ newKey ] ) => {
								const next = { ...secondaryOrderby };
								if ( newKey ) {
									next.meta_key = newKey;
								} else {
									delete next.meta_key;
								}
								setAttributes( {
									query: {
										...attributes.query,
										secondary_orderby: next,
									},
								} );
							} }
							__nextHasNoMarginBottom
						/>
					) }
					<ToggleControl
						label={ __(
							'Secondary Ascending Order',
							'advanced-query-loop'
						) }
						checked={ secondaryOrderby.order === 'asc' }
						onChange={ () => {
							setAttributes( {
								query: {
									...attributes.query,
									secondary_orderby: {
										...secondaryOrderby,
										order:
											secondaryOrderby.order === 'asc'
												? 'desc'
												: 'asc',
									},
								},
							} );
						} }
						__nextHasNoMarginBottom
					/>
				</>
			) }
		</VStack>
	);
};
