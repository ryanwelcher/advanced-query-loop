/**
 * WordPress dependencies
 */
import { store as blockEditorStore } from '@wordpress/block-editor';
import { ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Check for the core/query-pagination block.
 *
 * @param {Array} blocks The array of innerBlocks
 * @return {string|boolean} Return either the clientId or false if not found.
 */
const getPaginationBlockClientId = ( blocks ) => {
	return blocks.find( ( block ) => block.name === 'core/query-pagination' )
		?.clientId;
};

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
			__nextHasNoMarginBottom
		/>
	);
};
