/**
 * WordPress dependencies
 */
import {
	DropdownMenu,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { shortcode } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import usePlaceholders from '../hooks/usePlaceholders';

/**
 * A TextControl with a picker that inserts dynamic placeholder tokens.
 *
 * Users choose by label (e.g. "Current Post ID"); the stored value is
 * the {aql:name} token, which may be mixed with literal text. Any
 * control — including third-party SlotFill controls — can use this to
 * become placeholder-aware.
 *
 * @param {Object}   props
 * @param {string}   props.label    Field label.
 * @param {string}   props.value    Current value.
 * @param {Function} props.onChange Change handler receiving the new value.
 */
export const PlaceholderTextControl = ( { label, value, onChange } ) => {
	const placeholders = usePlaceholders();

	if ( ! placeholders.length ) {
		return (
			<TextControl
				label={ label }
				value={ value }
				onChange={ onChange }
			/>
		);
	}

	return (
		<HStack alignment="flex-end" spacing={ 1 }>
			<div style={ { flexGrow: 1 } }>
				<TextControl
					label={ label }
					value={ value }
					onChange={ onChange }
				/>
			</div>
			<DropdownMenu
				icon={ shortcode }
				label={ __( 'Insert dynamic value', 'advanced-query-loop' ) }
				controls={ placeholders.map(
					( { name, label: placeholderLabel } ) => ( {
						title: placeholderLabel,
						onClick: () =>
							onChange( `${ value ?? '' }{aql:${ name }}` ),
					} )
				) }
			/>
		</HStack>
	);
};
