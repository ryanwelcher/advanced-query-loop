/**
 * WordPress dependencies
 */
import {
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
 * @return {Element} PostOrderControls
 */
export const PostOrderControls = ( {
	attributes,
	setAttributes,
	allowedControls,
} ) => {
	const { query: { order, orderBy } = {} } = attributes;

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
					orderBy === 'meta_value' || orderBy === 'meta_value_num'
						? __(
								'Meta Value and Meta Value Num require that Meta Key is set in the Meta Query section.',
								'advanced-query-loop'
						  )
						: ''
				}
				options={ sortOptions.sort( ( a, b ) =>
					a.label.localeCompare( b.label )
				) }
				onChange={ ( newOrderBy ) => {
					setAttributes( {
						query: {
							...attributes.query,
							orderBy: newOrderBy,
							...( newOrderBy === 'rand' && {
								enable_caching: false,
							} ),
						},
					} );
				} }
				__nextHasNoMarginBottom
			/>
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
