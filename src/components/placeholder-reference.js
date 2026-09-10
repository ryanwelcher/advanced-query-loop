/**
 * WordPress dependencies
 */
import { Button, PanelBody, Popover } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { info, close } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import usePlaceholders from '../hooks/usePlaceholders';

/**
 * Visual grouping of the built-in placeholders. Purely an editor concern:
 * placeholders not listed here (e.g. third-party ones) fall into "Other".
 */
const GROUPS = [
	{
		key: 'content',
		label: __( 'Content & users', 'advanced-query-loop' ),
		names: [
			'current_post_id',
			'current_post_parent_id',
			'author_id',
			'user_id',
			'current_term_id',
		],
	},
	{
		key: 'now',
		label: __( 'Current date & time', 'advanced-query-loop' ),
		names: [
			'current_date',
			'current_date_compact',
			'current_datetime',
			'current_time',
			'current_timestamp',
			'current_year',
			'current_month',
			'current_day',
			'current_hour',
			'current_week',
		],
	},
	{
		key: 'relative',
		label: __( 'Relative dates', 'advanced-query-loop' ),
		names: [
			'date_minus_1_month',
			'date_minus_3_months',
			'date_minus_6_months',
			'date_minus_12_months',
			'date_plus_1_month',
			'date_plus_3_months',
			'date_plus_6_months',
			'date_plus_12_months',
		],
	},
];

/**
 * Split placeholders into the display groups, in group order, dropping any
 * group that ends up empty and appending an "Other" group for the rest.
 *
 * @param {Array} placeholders Registered placeholders.
 * @return {Array} Groups of { key, label, items }.
 */
const groupPlaceholders = ( placeholders ) => {
	const byName = new Map( placeholders.map( ( p ) => [ p.name, p ] ) );
	const grouped = GROUPS.map( ( { key, label, names } ) => ( {
		key,
		label,
		items: names.map( ( name ) => byName.get( name ) ).filter( Boolean ),
	} ) );
	const known = new Set( GROUPS.flatMap( ( { names } ) => names ) );
	const other = placeholders.filter( ( { name } ) => ! known.has( name ) );
	if ( other.length ) {
		grouped.push( {
			key: 'other',
			label: __( 'Other', 'advanced-query-loop' ),
			items: other,
		} );
	}
	return grouped.filter( ( { items } ) => items.length );
};

/**
 * The label/description grid for one group.
 *
 * @param {Object} props
 * @param {Array}  props.items Placeholders in this group.
 * @return {Element} The list.
 */
const PlaceholderList = ( { items } ) => (
	<dl className="aql-placeholder-reference__list">
		{ items.map( ( { name, label, description } ) => (
			<div key={ name } className="aql-placeholder-reference__item">
				<dt className="aql-placeholder-reference__label">{ label }</dt>
				{ description && <dd>{ description }</dd> }
			</div>
		) ) }
	</dl>
);

/**
 * A reference-only panel describing the dynamic placeholders the site
 * exposes, opened from an info button as a popover so it floats over the
 * builder instead of pushing the conditions around. Tokens are inserted
 * through the Meta Value field's own suggestions, not from here.
 *
 * Renders nothing when no placeholders are registered.
 *
 * @return {Element|null} The info button and, while open, the popover.
 */
export const PlaceholderReference = () => {
	const placeholders = usePlaceholders();
	const [ isOpen, setIsOpen ] = useState( false );
	const [ anchor, setAnchor ] = useState( null );

	if ( ! placeholders.length ) {
		return null;
	}

	const panelId = 'aql-placeholder-reference-panel';

	return (
		<div className="aql-placeholder-reference" ref={ setAnchor }>
			<Button
				className="aql-placeholder-reference__toggle"
				icon={ info }
				label={ __(
					'About dynamic placeholders',
					'advanced-query-loop'
				) }
				showTooltip
				aria-expanded={ isOpen }
				aria-controls={ panelId }
				onClick={ () => setIsOpen( ! isOpen ) }
			/>
			{ isOpen && (
				<Popover
					anchor={ anchor }
					placement="top-end"
					offset={ 8 }
					focusOnMount
					onClose={ () => setIsOpen( false ) }
					className="aql-placeholder-reference__popover"
				>
					<section
						id={ panelId }
						className="aql-placeholder-reference__panel"
						aria-labelledby="aql-placeholder-reference-heading"
					>
						<div className="aql-placeholder-reference__header">
							<h3
								id="aql-placeholder-reference-heading"
								className="aql-placeholder-reference__heading"
							>
								{ __(
									'Dynamic placeholders',
									'advanced-query-loop'
								) }
							</h3>
							<Button
								icon={ close }
								size="small"
								label={ __(
									'Hide placeholders',
									'advanced-query-loop'
								) }
								onClick={ () => setIsOpen( false ) }
							/>
						</div>
						<p className="aql-placeholder-reference__intro">
							{ __(
								'Pick any of these from the Meta Value field. They are resolved when the query runs.',
								'advanced-query-loop'
							) }
						</p>
						{ groupPlaceholders( placeholders ).map(
							( { key, label, items } ) => (
								<PanelBody
									key={ key }
									className="aql-placeholder-reference__group"
									title={ sprintf(
										/* translators: 1: group name, 2: number of placeholders */
										__(
											'%1$s (%2$d)',
											'advanced-query-loop'
										),
										label,
										items.length
									) }
									initialOpen={ false }
								>
									<PlaceholderList items={ items } />
								</PanelBody>
							)
						) }
					</section>
				</Popover>
			) }
		</div>
	);
};
