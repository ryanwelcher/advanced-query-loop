/**
 * WordPress dependencies
 */
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * PostOrderControls component
 *
 * @param {*} param0
 * @return {Element} PostCountControls
 */
export const PostOrderControls = ( { attributes, setAttributes } ) => {
	const { query: { order, orderBy } = {} } = attributes;
	return (
		<PanelBody title={ __( 'Post Order', 'advanced-query-loop' ) }>
			<SelectControl
				label={ __( 'Order By', 'advanced-query-loop' ) }
				value={ orderBy }
				options={ [
					{
						label: __( 'Author', 'advanced-query-loop' ),
						value: 'author',
					},
					{
						label: __( 'Date', 'advanced-query-loop' ),
						value: 'date',
					},
					{
						label: __(
							'Last Modified Date',
							'advanced-query-loop'
						),
						value: 'modified',
					},
					{
						label: __( 'Title', 'advanced-query-loop' ),
						value: 'title',
					},
				] }
				onChange={ ( newOrderBy ) => {
					setAttributes( {
						query: {
							...attributes.query,
							orderBy: newOrderBy,
						},
					} );
				} }
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
			/>
		</PanelBody>
	);
};
