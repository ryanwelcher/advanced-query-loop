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

const isMetaSort = ( value ) =>
	value === 'meta_value' || value === 'meta_value_num';

/**
 * Sort a copy of the options alphabetically by label.
 *
 * The shared `sortOptions` export must not be mutated in place.
 *
 * @param {Array} options Options to sort.
 * @return {Array} A sorted copy.
 */
const alphabetical = ( options ) =>
	[ ...options ].sort( ( a, b ) => a.label.localeCompare( b.label ) );

/**
 * Help text for a meta-key field, worded for the active sort direction.
 *
 * MySQL sorts NULL first in ASC, so posts missing the key lead when the
 * sort is ascending and trail when it is descending.
 *
 * @param {string} order The sort direction ('asc' or 'desc').
 * @return {string} The direction-aware help text.
 */
const metaKeyHelp = ( order ) =>
	order === 'asc'
		? __(
				'Set the meta key to sort by. Posts without the key are included before posts that have it.',
				'advanced-query-loop'
		  )
		: __(
				'Set the meta key to sort by. Posts without the key are included after posts that have it.',
				'advanced-query-loop'
		  );

/**
 * PostOrderControls component — the primary sort.
 *
 * @param {*} param0
 * @return {Element} PostOrderControls
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

	// If the control is not allowed, return null.
	if ( ! allowedControls.includes( 'post_order' ) ) {
		return null;
	}

	const showMetaKeyField = isMetaSort( orderBy );

	return (
		<VStack spacing={ 4 }>
			<SelectControl
				label={ __( 'Post Order By', 'advanced-query-loop' ) }
				value={ orderBy }
				help={
					showMetaKeyField && ! orderbyMetaKey
						? metaKeyHelp( order )
						: ''
				}
				options={ alphabetical( sortOptions ) }
				onChange={ ( newOrderBy ) => {
					const newQuery = {
						...attributes.query,
						orderBy: newOrderBy,
						...( newOrderBy === 'rand' && {
							enable_caching: false,
						} ),
					};
					// A random primary sort makes any secondary sort moot, and
					// a secondary sort duplicating the primary is a no-op.
					if (
						newOrderBy === 'rand' ||
						newOrderBy === secondaryOrderby?.order_by
					) {
						delete newQuery.secondary_orderby;
					}
					if ( ! isMetaSort( newOrderBy ) ) {
						delete newQuery.orderby_meta_key;
					}
					setAttributes( { query: newQuery } );
				} }
				__nextHasNoMarginBottom
			/>
			{ showMetaKeyField && (
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
		</VStack>
	);
};

/**
 * SecondaryOrderControls component — the secondary sort.
 *
 * Rendered inside its own ToolsPanelItem, which owns adding and removing the
 * `secondary_orderby` attribute, so this component assumes it exists.
 *
 * @param {*} param0
 * @return {Element} SecondaryOrderControls
 */
export const SecondaryOrderControls = ( {
	attributes,
	setAttributes,
	allowedControls,
} ) => {
	const { query: { orderBy, secondary_orderby: secondaryOrderby } = {} } =
		attributes;

	if ( ! allowedControls.includes( 'post_order' ) ) {
		return null;
	}

	if ( ! secondaryOrderby ) {
		return null;
	}

	const updateSecondary = ( next ) =>
		setAttributes( {
			query: {
				...attributes.query,
				secondary_orderby: next,
			},
		} );

	return (
		<VStack spacing={ 4 }>
			<SelectControl
				label={ __( 'Secondary Order By', 'advanced-query-loop' ) }
				value={ secondaryOrderby.order_by }
				help={
					isMetaSort( secondaryOrderby.order_by ) &&
					! secondaryOrderby.meta_key
						? metaKeyHelp( secondaryOrderby.order )
						: ''
				}
				options={ alphabetical(
					sortOptions.filter(
						( { value } ) =>
							value !== 'rand' &&
							value !== 'post__in' &&
							value !== orderBy
					)
				) }
				onChange={ ( newOrderBy ) => {
					const next = {
						...secondaryOrderby,
						order_by: newOrderBy,
					};
					// Drop a now-stale meta key when moving off a meta sort.
					if ( ! isMetaSort( newOrderBy ) ) {
						delete next.meta_key;
					}
					updateSecondary( next );
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
						updateSecondary( next );
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
					updateSecondary( {
						...secondaryOrderby,
						order:
							secondaryOrderby.order === 'asc' ? 'desc' : 'asc',
					} );
				} }
				__nextHasNoMarginBottom
			/>
		</VStack>
	);
};
