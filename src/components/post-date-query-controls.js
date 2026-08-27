/**
 * WordPress dependencies
 */
import {
	DatePicker,
	SelectControl,
	CheckboxControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Removes the date-relationship keys from a date_query object so that the
 * dynamic range and date relationship families of controls never coexist.
 *
 * @param {Object} dateQuery The current date_query object.
 * @return {Object} A shallow copy of dateQuery without the relationship keys.
 */
const withoutRelationshipKeys = ( dateQuery ) => {
	const newDateQuery = { ...dateQuery };
	delete newDateQuery.relation;
	delete newDateQuery.date_primary;
	delete newDateQuery.date_secondary;
	delete newDateQuery.inclusive;
	return newDateQuery;
};

/**
 * Removes the dynamic-range keys from a date_query object so that the
 * dynamic range and date relationship families of controls never coexist.
 *
 * @param {Object} dateQuery The current date_query object.
 * @return {Object} A shallow copy of dateQuery without the dynamic range keys.
 */
const withoutDynamicRangeKeys = ( dateQuery ) => {
	const newDateQuery = { ...dateQuery };
	delete newDateQuery.range;
	delete newDateQuery.current_date_in_range;
	return newDateQuery;
};

/**
 * Controls for the dynamic date range (last month, last 3 months, etc).
 *
 * Mutually exclusive with DateRelationshipControls — setting a dynamic
 * range clears any date relationship values from the date_query attribute.
 *
 * @param {Object}   props               Component props
 * @param {Object}   props.attributes    Block attributes
 * @param {Function} props.setAttributes Block attributes setter
 *
 * @return {Element} DateDynamicRangeControls
 */
export const DateDynamicRangeControls = ( { attributes, setAttributes } ) => {
	const {
		query: {
			date_query: {
				range = '',
				current_date_in_range: currentDateInRange = false,
				relation: relationFromQuery = '',
			} = {},
		} = {},
	} = attributes;

	// A date relationship is active — lock these controls out until it's cleared.
	const isLockedByRelationship = !! relationFromQuery;

	return (
		<VStack spacing={ 4 }>
			<SelectControl
				label={ __( 'Dynamic Range', 'advanced-query-loop' ) }
				help={
					isLockedByRelationship
						? __(
								'Clear the date relationship to use a dynamic range.',
								'advanced-query-loop'
						  )
						: __(
								'Show posts from the last month, 3 months, 6 months, or 12 months. Posts are shown from the 1st of the month.',
								'advanced-query-loop'
						  )
				}
				value={ range }
				disabled={ isLockedByRelationship }
				options={ [
					{
						label: __( 'None', 'advanced-query-loop' ),
						value: '',
					},
					{
						label: __( 'Last month', 'advanced-query-loop' ),
						value: 'last-month',
					},
					{
						label: __( 'Last 3 months', 'advanced-query-loop' ),
						value: 'three-months',
					},
					{
						label: __( 'Last 6 months', 'advanced-query-loop' ),
						value: 'six-months',
					},
					{
						label: __( 'Last 12 months', 'advanced-query-loop' ),
						value: 'twelve-months',
					},
				] }
				onChange={ ( newRange ) => {
					setAttributes( {
						query: {
							...attributes.query,
							date_query: {
								...withoutRelationshipKeys(
									attributes.query.date_query
								),
								range: newRange,
							},
						},
					} );
				} }
				__nextHasNoMarginBottom
			/>
			{ range !== '' && ! isLockedByRelationship && (
				<CheckboxControl
					label={ __(
						'Include up to current date',
						'advanced-query-loop'
					) }
					help={ __(
						'Should the dynamic range include up to the current date?',
						'advanced-query-loop'
					) }
					disabled={ range === '' }
					checked={ currentDateInRange }
					onChange={ ( newCurrentDateInRange ) => {
						setAttributes( {
							query: {
								...attributes.query,
								date_query: {
									...withoutRelationshipKeys(
										attributes.query.date_query
									),
									current_date_in_range:
										newCurrentDateInRange,
								},
							},
						} );
					} }
				/>
			) }
		</VStack>
	);
};

/**
 * Controls for filtering by date relationship (before/after/between
 * specific or current dates).
 *
 * Mutually exclusive with DateDynamicRangeControls — setting a date
 * relationship clears any dynamic range values from the date_query
 * attribute.
 *
 * @param {Object}   props               Component props
 * @param {Object}   props.attributes    Block attributes
 * @param {Function} props.setAttributes Block attributes setter
 *
 * @return {Element} DateRelationshipControls
 */
export const DateRelationshipControls = ( { attributes, setAttributes } ) => {
	const {
		query: {
			date_query: {
				relation: relationFromQuery = '',
				date_primary: datePrimary = new Date(),
				date_secondary: dateSecondary = new Date(),
				inclusive: isInclusive = false,
				range = '',
			} = {},
		} = {},
	} = attributes;

	// A dynamic range is active — lock these controls out until it's cleared.
	const isLockedByRange = !! range;

	return (
		<VStack spacing={ 4 }>
			<SelectControl
				label={ __( 'Date Relationship', 'advanced-query-loop' ) }
				help={
					isLockedByRange
						? __(
								'Clear the dynamic range to use a date relationship.',
								'advanced-query-loop'
						  )
						: __(
								'Show posts before or after the current date, or before, after, or between specific dates.',
								'advanced-query-loop'
						  )
				}
				value={ relationFromQuery }
				disabled={ isLockedByRange }
				options={ [
					{
						label: __( 'None', 'advanced-query-loop' ),
						value: '',
					},
					{
						label: __(
							'Before current date',
							'advanced-query-loop'
						),
						value: 'before-current',
					},
					{
						label: __(
							'After current date',
							'advanced-query-loop'
						),
						value: 'after-current',
					},
					{
						label: __(
							'Before specific date',
							'advanced-query-loop'
						),
						value: 'before',
					},
					{
						label: __(
							'After specific date',
							'advanced-query-loop'
						),
						value: 'after',
					},
					{
						label: __(
							'Between specific dates',
							'advanced-query-loop'
						),
						value: 'between',
					},
				] }
				onChange={ ( relation ) => {
					setAttributes( {
						query: {
							...attributes.query,
							date_query:
								relation !== ''
									? {
											...withoutDynamicRangeKeys(
												attributes.query.date_query
											),
											relation,
									  }
									: '',
						},
					} );
				} }
				__nextHasNoMarginBottom
			/>
			{ relationFromQuery !== '' &&
				! relationFromQuery.includes( 'current' ) &&
				! isLockedByRange && (
					<>
						{ relationFromQuery === 'between' && (
							<h4>
								{ __( 'Start date', 'advanced-query-loop' ) }
							</h4>
						) }
						<DatePicker
							currentDate={ datePrimary }
							onChange={ ( newDate ) => {
								setAttributes( {
									query: {
										...attributes.query,
										date_query: {
											...withoutDynamicRangeKeys(
												attributes.query.date_query
											),
											date_primary: newDate,
										},
									},
								} );
							} }
						/>

						{ relationFromQuery === 'between' && (
							<>
								<h4>
									{ __( 'End date', 'advanced-query-loop' ) }
								</h4>
								<DatePicker
									currentDate={ dateSecondary }
									onChange={ ( newDate ) => {
										setAttributes( {
											query: {
												...attributes.query,
												date_query: {
													...withoutDynamicRangeKeys(
														attributes.query
															.date_query
													),
													date_secondary: newDate,
												},
											},
										} );
									} }
								/>
							</>
						) }

						<CheckboxControl
							label={ __(
								'Include selected date(s)',
								'advanced-query-loop'
							) }
							help={ __(
								'Should the selected date(s) be included in your query?',
								'advanced-query-loop'
							) }
							checked={ isInclusive }
							onChange={ ( newIsInclusive ) => {
								setAttributes( {
									query: {
										...attributes.query,
										date_query: {
											...withoutDynamicRangeKeys(
												attributes.query.date_query
											),
											inclusive: newIsInclusive,
										},
									},
								} );
							} }
						/>
					</>
				) }
		</VStack>
	);
};
