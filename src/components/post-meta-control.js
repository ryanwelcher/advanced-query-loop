/**
 * WordPress dependencies
 */
import {
	Button,
	FormTokenField,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalGrid as Grid,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { PlaceholderTextControl } from './placeholder-text-control';
import { MetaValuePicker, dateTypeHint } from './meta-value-picker';

const compareMetaOptions = [
	'=',
	'!=',
	'>',
	'>=',
	'<',
	'<=',
	'LIKE',
	'NOT LIKE',
	'IN',
	'NOT IN',
	'BETWEEN',
	'NOT BETWEEN',
	'EXISTS',
	'NOT EXISTS',
	'REGEXP',
	'NOT REGEXP',
	'RLIKE',
];

/**
 * Operators that only make sense against text. They are hidden for the
 * numeric and date types, where MySQL would cast the value first.
 */
const textOnlyOperators = [
	'LIKE',
	'NOT LIKE',
	'REGEXP',
	'NOT REGEXP',
	'RLIKE',
];
const textTypes = [ '', 'CHAR', 'BINARY' ];
const valuelessOperators = [ 'EXISTS', 'NOT EXISTS' ];
const listOperators = [ 'IN', 'NOT IN' ];
const rangeOperators = [ 'BETWEEN', 'NOT BETWEEN' ];

const metaTypeOptions = [
	'CHAR',
	'NUMERIC',
	'BINARY',
	'DATE',
	'DATETIME',
	'DECIMAL',
	'SIGNED',
	'TIME',
	'UNSIGNED',
];

/**
 * A single meta query condition rendered as a card: key, compare, and type
 * on one row, the value below, and a remove action in the corner.
 *
 * @param {Object}   props
 * @param {Object}   props.condition          The condition entry.
 * @param {string[]} props.registeredMetaKeys Meta keys to suggest.
 * @param {Function} props.onChange           Receives an object of changed fields.
 * @param {Function} props.onRemove           Removes this condition.
 * @param {Function} props.onValueFocus       Called when the value field gains focus.
 * @return {Element} The condition card.
 */
export const PostMetaControl = ( {
	condition,
	registeredMetaKeys,
	onChange,
	onRemove,
	onValueFocus,
} ) => {
	const activeQuery = condition;
	const hasKey = activeQuery?.meta_key?.length > 0;

	/**
	 * Write one or more fields of this condition back to the block.
	 *
	 * @param {string|Object} item  The condition key to update, or an
	 *                              object of key/value pairs.
	 * @param {string}        value The new value when item is a key.
	 */
	const updateQueryParam = ( item, value ) => {
		onChange( typeof item === 'object' ? item : { [ item ]: value } );
	};

	const metaType = activeQuery?.meta_type || 'CHAR';
	const metaCompare = activeQuery?.meta_compare || '=';
	const isValueless = valuelessOperators.includes( metaCompare );

	// Offer only operators that suit the type, but never drop the one a
	// saved block already uses.
	const compareOptions = compareMetaOptions.filter(
		( operator ) =>
			operator === metaCompare ||
			textTypes.includes( metaType ) ||
			! textOnlyOperators.includes( operator )
	);

	let valueHelp = dateTypeHint( metaType );
	if ( listOperators.includes( metaCompare ) ) {
		valueHelp = __(
			'Separate multiple values with commas.',
			'advanced-query-loop'
		);
	} else if ( rangeOperators.includes( metaCompare ) ) {
		valueHelp = __(
			'Enter the lower and upper bounds separated by a comma, for example 10,20.',
			'advanced-query-loop'
		);
	}

	return (
		<div className="aql-condition">
			<HStack alignment="top" spacing={ 3 }>
				<Grid
					columns={ hasKey ? 3 : 1 }
					templateColumns={ hasKey ? '2fr 1fr 1fr' : '1fr' }
					gap={ 3 }
					align="start"
					className="aql-condition__row"
				>
					<div className="aql-token-field">
						<FormTokenField
							label={ __( 'Meta Key', 'advanced-query-loop' ) }
							value={ hasKey ? [ activeQuery.meta_key ] : [] }
							__experimentalExpandOnFocus
							__experimentalShowHowTo={ false }
							suggestions={ registeredMetaKeys }
							maxLength={ 1 }
							onChange={ ( newMeta ) =>
								updateQueryParam( 'meta_key', newMeta[ 0 ] )
							}
						/>
						<p className="components-form-token-field__help">
							{ __(
								'Pick from the list, or type a key and press Enter.',
								'advanced-query-loop'
							) }
						</p>
					</div>
					{ hasKey && (
						<>
							<SelectControl
								label={ __(
									'Meta Compare',
									'advanced-query-loop'
								) }
								value={ metaCompare }
								options={ compareOptions.map(
									( operator ) => ( {
										label: operator,
										value: operator,
									} )
								) }
								onChange={ ( newCompare ) =>
									updateQueryParam(
										valuelessOperators.includes(
											newCompare
										)
											? {
													meta_compare: newCompare,
													meta_value: '',
											  }
											: { meta_compare: newCompare }
									)
								}
								__nextHasNoMarginBottom
							/>
							<SelectControl
								label={ __(
									'Meta Type',
									'advanced-query-loop'
								) }
								value={ metaType }
								options={ metaTypeOptions.map( ( type ) => ( {
									label: type,
									value: type,
								} ) ) }
								onChange={ ( newType ) =>
									updateQueryParam( 'meta_type', newType )
								}
								__nextHasNoMarginBottom
							/>
						</>
					) }
				</Grid>
				<Button
					variant="tertiary"
					size="small"
					isDestructive
					onClick={ onRemove }
					className="aql-condition__remove"
				>
					{ __( 'Remove query', 'advanced-query-loop' ) }
				</Button>
			</HStack>
			{ hasKey && ! isValueless && (
				<>
					{ /*
					 * The picker sits above the value field on purpose: the
					 * field's suggestion list expands below it, and anything
					 * placed there would shift when the list collapses on blur,
					 * swallowing the click.
					 */ }
					<MetaValuePicker
						metaType={ metaType }
						value={ activeQuery.meta_value }
						onChange={ ( newValue ) =>
							updateQueryParam( 'meta_value', newValue )
						}
					/>
					<PlaceholderTextControl
						label={ __( 'Meta Value', 'advanced-query-loop' ) }
						value={ activeQuery.meta_value }
						onChange={ ( newValue ) =>
							updateQueryParam( 'meta_value', newValue )
						}
						onFocus={ onValueFocus }
						help={ valueHelp }
					/>
				</>
			) }
		</div>
	);
};
