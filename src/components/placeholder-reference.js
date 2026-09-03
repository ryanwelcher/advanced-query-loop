/**
 * WordPress dependencies
 */
import { Button, SearchControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import usePlaceholders from '../hooks/usePlaceholders';

/**
 * A filterable reference list of the dynamic placeholders the site exposes.
 * Clicking an entry asks the parent to insert that placeholder.
 *
 * Renders nothing when no placeholders are registered.
 *
 * @param {Object}   props
 * @param {Function} props.onInsert Called with the placeholder name.
 * @param {string}   props.notice   Optional message shown above the list.
 * @return {Element|null} The reference column.
 */
export const PlaceholderReference = ( { onInsert, notice } ) => {
	const placeholders = usePlaceholders();
	const [ filter, setFilter ] = useState( '' );

	if ( ! placeholders.length ) {
		return null;
	}

	const needle = filter.trim().toLowerCase();
	const visible = needle
		? placeholders.filter(
				( { name, label, description = '' } ) =>
					label.toLowerCase().includes( needle ) ||
					name.toLowerCase().includes( needle ) ||
					description.toLowerCase().includes( needle )
		  )
		: placeholders;

	return (
		<aside
			className="aql-placeholder-reference"
			aria-labelledby="aql-placeholder-reference-heading"
		>
			<h3
				id="aql-placeholder-reference-heading"
				className="aql-placeholder-reference__heading"
			>
				{ __( 'Dynamic placeholders', 'advanced-query-loop' ) }
			</h3>
			<p className="aql-placeholder-reference__intro">
				{ __(
					'Resolved when the query runs. Click one to insert it into the selected Meta Value field.',
					'advanced-query-loop'
				) }
			</p>
			<SearchControl
				label={ __( 'Filter placeholders', 'advanced-query-loop' ) }
				value={ filter }
				onChange={ setFilter }
				size="compact"
				__nextHasNoMarginBottom
			/>
			{ notice && (
				<p className="aql-placeholder-reference__notice" role="status">
					{ notice }
				</p>
			) }
			<ul className="aql-placeholder-reference__list">
				{ visible.map( ( { name, label, description } ) => (
					<li key={ name }>
						<Button
							variant="tertiary"
							className="aql-placeholder-reference__item"
							onClick={ () => onInsert( name ) }
						>
							<span className="aql-placeholder-reference__label">
								{ label }
							</span>
							{ description && (
								<span className="aql-placeholder-reference__description">
									{ description }
								</span>
							) }
						</Button>
					</li>
				) ) }
				{ ! visible.length && (
					<li className="aql-placeholder-reference__empty">
						{ __(
							'No placeholders match.',
							'advanced-query-loop'
						) }
					</li>
				) }
			</ul>
		</aside>
	);
};
