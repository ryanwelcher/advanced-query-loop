/**
 * WordPress dependencies
 */
import {
	Button,
	DatePicker,
	DateTimePicker,
	TimePicker,
} from '@wordpress/components';
import { format } from '@wordpress/date';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Storage formats WP_Query expects for each date-like meta type, and the
 * pattern a stored value must match to seed the picker.
 */
const PICKERS = {
	DATE: {
		format: 'Y-m-d',
		pattern: /^\d{4}-\d{2}-\d{2}$/,
		label: __( 'Pick a date', 'advanced-query-loop' ),
		hint: __( 'Stored as YYYY-MM-DD.', 'advanced-query-loop' ),
	},
	DATETIME: {
		format: 'Y-m-d H:i:s',
		pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
		label: __( 'Pick a date and time', 'advanced-query-loop' ),
		hint: __( 'Stored as YYYY-MM-DD HH:MM:SS.', 'advanced-query-loop' ),
	},
	TIME: {
		format: 'H:i:s',
		pattern: /^\d{2}:\d{2}:\d{2}$/,
		label: __( 'Pick a time', 'advanced-query-loop' ),
		hint: __( 'Stored as HH:MM:SS.', 'advanced-query-loop' ),
	},
};

/**
 * Hint text for a date-like meta type, or null.
 *
 * @param {string} metaType The meta type.
 * @return {string|null} The hint.
 */
export const dateTypeHint = ( metaType ) => PICKERS[ metaType ]?.hint ?? null;

/**
 * An inline date, date-time, or time picker for DATE, DATETIME, and TIME
 * meta types. Writes the value in the format WP_Query compares against.
 * Renders nothing for other types.
 *
 * @param {Object}   props
 * @param {string}   props.metaType The meta type.
 * @param {string}   props.value    The current stored value.
 * @param {Function} props.onChange Receives the formatted value.
 * @return {Element|null} The picker toggle and, when open, the picker.
 */
export const MetaValuePicker = ( { metaType, value, onChange } ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const picker = PICKERS[ metaType ];

	if ( ! picker ) {
		return null;
	}

	// Seed the picker from a value already in the stored format; a TIME
	// value needs a date in front of it to parse.
	let current;
	if ( value && picker.pattern.test( value ) ) {
		current =
			metaType === 'TIME' ? `${ format( 'Y-m-d' ) }T${ value }` : value;
	}

	const handleChange = ( picked ) => {
		if ( picked ) {
			onChange( format( picker.format, picked ) );
		}
	};

	return (
		<div className="aql-meta-value-picker">
			<Button
				variant="tertiary"
				size="small"
				isPressed={ isOpen }
				onClick={ () => setIsOpen( ! isOpen ) }
				aria-expanded={ isOpen }
			>
				{ picker.label }
			</Button>
			{ isOpen && metaType === 'DATE' && (
				<DatePicker currentDate={ current } onChange={ handleChange } />
			) }
			{ isOpen && metaType === 'DATETIME' && (
				<DateTimePicker
					currentDate={ current }
					onChange={ handleChange }
					is12Hour={ false }
				/>
			) }
			{ isOpen && metaType === 'TIME' && (
				<TimePicker
					currentTime={ current }
					onChange={ handleChange }
					is12Hour={ false }
				/>
			) }
		</div>
	);
};
