/**
 * WordPress dependencies
 */
import {
	PanelBody,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const PostOffsetControls = ( { attributes, setAttributes } ) => {
	const { query: { offset = 0 } = {} } = attributes;
	return (
		<PanelBody title={ __( 'Post Offset', 'advanced-query-loop' ) }>
			<NumberControl
				label={ __( 'Offset', 'advanced-query-loop' ) }
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
		</PanelBody>
	);
};
