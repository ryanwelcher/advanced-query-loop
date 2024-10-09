/**
 * WordPress dependencies
 */
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const PaginationToggle = ( { attributes, setAttributes } ) => {
	const { query: { disable_pagination: disablePagination } = {} } =
		attributes;

	return (
		<ToggleControl
			label={ __( 'Disable pagination', 'advanced-query-loop' ) }
			help={ __(
				'Disabling pagination will not show any pagination controls on the front end. It can also provide a performance improvement for complicated queries.',
				'advanced-query-loop'
			) }
			checked={ !! disablePagination }
			onChange={ () => {
				setAttributes( {
					query: {
						...attributes.query,
						disable_pagination: ! disablePagination,
					},
				} );
			} }
		/>
	);
};
