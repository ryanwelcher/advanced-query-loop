/**
 * WordPress dependencies
 */
import {
	PanelBody,
	__experimentalNumberControl as NumberControl,
	RangeControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * PostCountControls component
 *
 * @param {*} param0
 * @return {Element} PostCountControls
 */
export const PostCountControls = ( { attributes, setAttributes } ) => {
	const { query: { perPage, offset = 0 } = {} } = attributes;

	return (
		<PanelBody
			title={ __( 'Post Count and offset', 'advanced-query-loop' ) }
		>
			<RangeControl
				label={ __( 'Posts Per Page', 'advanced-query-loop' ) }
				min={ 1 }
				max={ 10 }
				onChange={ ( newCount ) => {
					setAttributes( {
						query: {
							...attributes.query,
							perPage: newCount,
							offset,
						},
					} );
				} }
				value={ perPage }
			/>
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
