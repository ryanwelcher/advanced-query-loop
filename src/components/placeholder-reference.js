/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { info, close } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import usePlaceholders from '../hooks/usePlaceholders';

/**
 * A toggleable, reference-only panel describing the dynamic placeholders the
 * site exposes. Hidden until the info button is pressed. Tokens are inserted
 * through the Meta Value field's own suggestions, not from here.
 *
 * Renders nothing when no placeholders are registered.
 *
 * @return {Element|null} The info button and, while open, the panel.
 */
export const PlaceholderReference = () => {
	const placeholders = usePlaceholders();
	const [ isOpen, setIsOpen ] = useState( false );

	if ( ! placeholders.length ) {
		return null;
	}

	const panelId = 'aql-placeholder-reference-panel';

	return (
		<div className="aql-placeholder-reference">
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
					<dl className="aql-placeholder-reference__list">
						{ placeholders.map(
							( { name, label, description } ) => (
								<div
									key={ name }
									className="aql-placeholder-reference__item"
								>
									<dt className="aql-placeholder-reference__label">
										{ label }
									</dt>
									{ description && <dd>{ description }</dd> }
								</div>
							)
						) }
					</dl>
				</section>
			) }
		</div>
	);
};
