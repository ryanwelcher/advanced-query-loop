/**
 * WordPress dependencies
 */

// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const PostOffsetControls = ( { attributes, setAttributes } ) => {
	const { query: { offset = 0 } = {} } = attributes;
	return (
		<NumberControl
			label={ __( 'Post Offset', 'advanced-query-loop' ) }
			value={ offset }
			min={ 0 }
			onChange={ ( newOffset ) => {
				setAttributes( {
					query: {
						...attributes.query,
						offset: newOffset,
					},
				} );
			} }
		/>
	);
};
