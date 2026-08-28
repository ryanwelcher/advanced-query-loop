/**
 * WordPress dependencies
 */
import { FormTokenField } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import usePlaceholders from '../hooks/usePlaceholders';

/**
 * A single-value FormTokenField that suggests dynamic placeholder values by
 * label (e.g. "Current Post ID"). Picking a suggestion stores the
 * corresponding {aql:name} token; typing anything else stores it verbatim.
 * Any control — including third-party SlotFill controls — can use this to
 * become placeholder-aware.
 *
 * @param {Object}   props
 * @param {string}   props.label    Field label.
 * @param {string}   props.value    Current value.
 * @param {Function} props.onChange Change handler receiving the new value.
 */
export const PlaceholderTextControl = ( { label, value, onChange } ) => {
	const placeholders = usePlaceholders();

	/**
	 * Map a stored value to its display chip: a token maps to its
	 * placeholder label, everything else displays as itself.
	 *
	 * @param {string} val The stored value.
	 * @return {string} The display value.
	 */
	const labelForToken = ( val ) =>
		placeholders.find(
			( placeholder ) => `{aql:${ placeholder.name }}` === val
		)?.label ?? val;

	/**
	 * Map user input to the value that should be stored: an input that
	 * exactly matches a placeholder label is stored as its token,
	 * everything else is stored as a literal.
	 *
	 * @param {string} input The token field's input.
	 * @return {string} The value to store.
	 */
	const tokenForLabel = ( input ) => {
		const match = placeholders.find(
			( placeholder ) => placeholder.label === input
		);
		return match ? `{aql:${ match.name }}` : input;
	};

	return (
		<div className="aql-token-field">
			<FormTokenField
				label={ label }
				value={ value ? [ labelForToken( value ) ] : [] }
				suggestions={ placeholders.map(
					( placeholder ) => placeholder.label
				) }
				maxLength={ 1 }
				__experimentalExpandOnFocus
				__experimentalShowHowTo={ false }
				onChange={ ( newValue ) =>
					onChange(
						newValue.length ? tokenForLabel( newValue[ 0 ] ) : ''
					)
				}
			/>
			<p className="components-form-token-field__help">
				{ __(
					'Select a dynamic value from the list, or type a custom value and press Enter to apply it.',
					'advanced-query-loop'
				) }
			</p>
		</div>
	);
};
