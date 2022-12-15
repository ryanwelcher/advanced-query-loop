/**
 * WordPress dependencies
 */
import {
	DateTimePicker,
	DatePicker,
	TimePicker,
	SelectControl,
	CheckboxControl,
} from '@wordpress/components';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

export const PostDateQueryControls = ( { attributes, setAttributes } ) => {
	const {
		query: {
			date_query: {
				relation: relationFromQuery = 'before',
				date_primary: datePrimary = new Date(),
				date_secondary: dateSecondary = new Date(),
				inclusive: isInclusive = false,
			} = {},
		} = {},
	} = attributes;

	return (
		<PanelBody title={ __( 'Post Date Query', 'advanced-query-loop' ) }>
			<SelectControl
				label={ __( 'Date Relationship', 'advanced-query-loop' ) }
				value={ relationFromQuery }
				options={ [
					{ label: 'Before', value: 'before' },
					{ label: 'After', value: 'after' },
					{ label: 'Between', value: 'between' },
				] }
				onChange={ ( relation ) =>
					setAttributes( {
						query: {
							...attributes.query,
							date_query: {
								...attributes.query.date_query,
								relation,
							},
						},
					} )
				}
			/>
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
		</PanelBody>
	);
};
