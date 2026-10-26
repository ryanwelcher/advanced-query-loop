/**
 * WordPress dependencies
 */
import {
	DropdownMenu,
	MenuGroup,
	MenuItem,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import usePlaceholders from '../hooks/usePlaceholders';

/**
 * A text input with an "Insert dynamic value" menu that appends the chosen
 * placeholder's {aql:name} token to the value. The value is stored as typed,
 * so commas (e.g. for IN or BETWEEN compares) are preserved. Any control —
 * including third-party SlotFill controls — can use this to become
 * placeholder-aware.
 *
 * @param {Object}   props
 * @param {string}   props.label    Field label.
 * @param {string}   props.value    Current value.
 * @param {Function} props.onChange Change handler receiving the new value.
 * @param {string}   props.help     Optional help text.
 */
export const PlaceholderTextControl = ( { label, value, onChange, help } ) => {
	const placeholders = usePlaceholders();

	return (
		<div className="aql-placeholder-text-control">
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ label }
				value={ value ?? '' }
				onChange={ onChange }
				help={ help }
			/>
			<DropdownMenu
				icon={ null }
				text={ __( 'Insert dynamic value', 'advanced-query-loop' ) }
				label={ __( 'Insert dynamic value', 'advanced-query-loop' ) }
				toggleProps={ { variant: 'link' } }
			>
				{ ( { onClose } ) => (
					<MenuGroup>
						{ placeholders.map( ( placeholder ) => (
							<MenuItem
								key={ placeholder.name }
								info={ placeholder.description }
								onClick={ () => {
									onChange(
										`${ value ?? '' }{aql:${
											placeholder.name
										}}`
									);
									onClose();
								} }
							>
								{ placeholder.label }
							</MenuItem>
						) ) }
					</MenuGroup>
				) }
			</DropdownMenu>
		</div>
	);
};
