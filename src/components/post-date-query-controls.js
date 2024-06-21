/**
 * WordPress dependencies
 */
import {
	DatePicker,
	SelectControl,
	CheckboxControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const PostDateQueryControls = ( { attributes, setAttributes } ) => {
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

	return (
		<>
			<h2>{ __( 'Post Date Query', 'advanced-query-loop' ) }</h2>
			<SelectControl
				label={ __( 'Dynamic Range', 'advanced-query-loop' ) }
				help={ __(
					'Show posts from the last month, 3 months, 6 months, or 12 months. Posts are shown from the 1st of the month.',
					'advanced-query-loop'
				) }
				value={ range }
				disabled={ relationFromQuery !== '' }
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
								...attributes.query.date_query,
								range: newRange,
							},
						},
					} );
				} }
			/>
			<SelectControl
				label={ __( 'Date Relationship', 'advanced-query-loop' ) }
				help={ __(
					'Show posts before, after, or between the selected date(s).',
					'advanced-query-loop'
				) }
				value={ relationFromQuery }
				disabled={ range !== '' }
				options={ [
					{ label: __( 'None', 'advanced-query-loop' ), value: '' },
					{
						label: __( 'Before', 'advanced-query-loop' ),
						value: 'before',
					},
					{
						label: __( 'After', 'advanced-query-loop' ),
						value: 'after',
					},
					{
						label: __( 'Between', 'advanced-query-loop' ),
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
											...attributes.query.date_query,
											relation,
									  }
									: '',
						},
					} );
				} }
			/>
			{ relationFromQuery !== '' && (
				<>
					{ relationFromQuery === 'between' && (
						<h4>{ __( 'Start date', 'advanced-query-loop' ) }</h4>
					) }
					<DatePicker
						currentDate={ datePrimary }
						onChange={ ( newDate ) => {
							setAttributes( {
								query: {
									...attributes.query,
									date_query: {
										...attributes.query.date_query,
										date_primary: newDate,
									},
								},
							} );
						} }
					/>

					{ relationFromQuery === 'between' && (
						<>
							<h4>{ __( 'End date', 'advanced-query-loop' ) }</h4>
							<DatePicker
								currentDate={ dateSecondary }
								onChange={ ( newDate ) => {
									setAttributes( {
										query: {
											...attributes.query,
											date_query: {
												...attributes.query.date_query,
												date_secondary: newDate,
											},
										},
									} );
								} }
							/>
						</>
					) }

					<br />
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
										...attributes.query.date_query,
										inclusive: newIsInclusive,
									},
								},
							} );
						} }
					/>
				</>
			) }
		</>
	);
};
