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
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

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
 * A single meta query condition rendered as a card: the key (with compare
 * and type beside it in Advanced mode), the value below, and a footer with
 * the Advanced mode toggle and the remove action.
 *
 * @param {Object}   props
 * @param {Object}   props.condition          The condition entry.
 * @param {string[]} props.registeredMetaKeys Meta keys to suggest.
 * @param {Function} props.onChange           Receives an object of changed fields.
 * @param {Function} props.onRemove           Removes this condition.
 * @return {Element} The condition card.
 */
export const PostMetaControl = ( {
	condition,
	registeredMetaKeys,
	onChange,
	onRemove,
} ) => {
	const activeQuery = condition;
	const hasKey = activeQuery?.meta_key?.length > 0;
	const [ advancedOpen, setAdvancedOpen ] = useState( false );

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

	// Compare and type only matter when they leave the defaults, so they
	// stay tucked behind Advanced mode. A condition that already uses
	// non-default values keeps them visible so nothing is hidden.
	const hasNonDefault =
		( activeQuery?.meta_compare && activeQuery.meta_compare !== '=' ) ||
		( activeQuery?.meta_type && activeQuery.meta_type !== 'CHAR' );
	const showAdvanced = hasKey && ( advancedOpen || !! hasNonDefault );

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
			<Grid
				columns={ showAdvanced ? 3 : 1 }
				templateColumns={ showAdvanced ? '2fr 1fr 1fr' : '1fr' }
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
							updateQueryParam( 'meta_key', newMeta[ 0 ] ?? '' )
						}
					/>
					<p className="components-form-token-field__help">
						{ __(
							'Pick from the list, or type a key and press Enter.',
							'advanced-query-loop'
						) }
					</p>
				</div>
				{ showAdvanced && (
					<>
						<SelectControl
							label={ __(
								'Meta Compare',
								'advanced-query-loop'
							) }
							value={ metaCompare }
							options={ compareOptions.map( ( operator ) => ( {
								label: operator,
								value: operator,
							} ) ) }
							onChange={ ( newCompare ) =>
								updateQueryParam(
									valuelessOperators.includes( newCompare )
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
							label={ __( 'Meta Type', 'advanced-query-loop' ) }
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
						help={ valueHelp }
					/>
				</>
			) }
			<HStack
				justify={ hasKey ? 'space-between' : 'flex-end' }
				alignment="center"
				className="aql-condition__footer"
			>
				{ hasKey && (
					<ToggleControl
						label={ __( 'Advanced mode', 'advanced-query-loop' ) }
						checked={ showAdvanced }
						disabled={ !! hasNonDefault }
						onChange={ () => setAdvancedOpen( ! advancedOpen ) }
						__nextHasNoMarginBottom
					/>
				) }
				<Button
					variant="secondary"
					size="small"
					isDestructive
					onClick={ onRemove }
				>
					{ __( 'Remove query', 'advanced-query-loop' ) }
				</Button>
			</HStack>
		</div>
	);
};
