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
 * @param {string[]} props.registeredMetaKeys Meta keys to suggest.
 * @param {string}   props.id                 Condition ID.
 * @param {Array}    props.queries            All conditions.
 * @param {Object}   props.attributes         Block attributes.
 * @param {Function} props.setAttributes      Block attribute setter.
 * @param {Function} props.onValueFocus       Called when the value field gains focus.
 * @return {Element} The condition card.
 */
export const PostMetaControl = ( {
	registeredMetaKeys,
	id,
	queries,
	attributes,
	setAttributes,
	onValueFocus,
} ) => {
	const activeQuery = queries.find( ( query ) => query.id === id );
	const hasKey = activeQuery?.meta_key?.length > 0;

	/**
	 * Write one field of this condition back to the block.
	 *
	 * @param {string} item  The condition key to update.
	 * @param {string} value The new value.
	 */
	const updateQueryParam = ( item, value ) => {
		setAttributes( {
			query: {
				...attributes.query,
				meta_query: {
					...attributes.query.meta_query,
					queries: queries.map( ( query ) =>
						query.id === id ? { ...query, [ item ]: value } : query
					),
				},
			},
		} );
	};

	const removeCondition = () => {
		setAttributes( {
			query: {
				...attributes.query,
				meta_query: {
					...attributes.query.meta_query,
					queries: queries.filter( ( query ) => query.id !== id ),
				},
			},
		} );
	};

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
								value={ activeQuery.meta_compare || '=' }
								options={ compareMetaOptions.map(
									( operator ) => ( {
										label: operator,
										value: operator,
									} )
								) }
								onChange={ ( newCompare ) =>
									updateQueryParam(
										'meta_compare',
										newCompare
									)
								}
								__nextHasNoMarginBottom
							/>
							<SelectControl
								label={ __(
									'Meta Type',
									'advanced-query-loop'
								) }
								value={ activeQuery.meta_type || 'CHAR' }
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
					onClick={ removeCondition }
					className="aql-condition__remove"
				>
					{ __( 'Remove query', 'advanced-query-loop' ) }
				</Button>
			</HStack>
			{ hasKey && (
				<PlaceholderTextControl
					label={ __( 'Meta Value', 'advanced-query-loop' ) }
					value={ activeQuery.meta_value }
					onChange={ ( newValue ) =>
						updateQueryParam( 'meta_value', newValue )
					}
					onFocus={ onValueFocus }
				/>
			) }
		</div>
	);
};
