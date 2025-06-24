/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useEffect } from '@wordpress/element';

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

export const PaginationToggle = ( { attributes, setAttributes, clientId } ) => {
	const innerBlocks = useSelect(
		( select ) =>
			select( blockEditorStore ).getBlocksByClientId( clientId )[ 0 ]
				?.innerBlocks
	);

	useEffect( () => {
		setAttributes( {
			query: {
				...attributes.query,
				disable_pagination: ! getPaginationBlockClientId( innerBlocks )
					? true
					: false,
			},
		} );
	}, [ innerBlocks, setAttributes ] );

	// There is no UI for component.
	return null;
};
