/**
 * WordPress dependencies
 */
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * ExcludePasswordProtectedToggle removes password protected posts from the query results.
 *
 * @param {Object}   props                 The properties passed to the component.
 * @param {Object}   props.attributes      The block attributes.
 * @param {Function} props.setAttributes   Function to update block attributes.
 * @param {Array}    props.allowedControls Allowed controls.
 *
 * @return {Element|null} A `ToggleControl` component.
 */
export const ExcludePasswordProtectedToggle = ( {
	attributes,
	setAttributes,
	allowedControls,
} ) => {
	const {
		query: { exclude_password_protected: excludePasswordProtected } = {},
	} = attributes;

	if ( ! allowedControls.includes( 'exclude_password_protected' ) ) {
		return null;
	}

	return (
		<ToggleControl
			__nextHasNoMarginBottom
			label={ __(
				'Exclude password protected posts',
				'advanced-query-loop'
			) }
			checked={ !! excludePasswordProtected }
			onChange={ ( value ) => {
				setAttributes( {
					query: {
						...attributes.query,
						exclude_password_protected: value,
					},
				} );
			} }
			help={ __(
				'Remove password protected posts from the query results.',
				'advanced-query-loop'
			) }
		/>
	);
};
