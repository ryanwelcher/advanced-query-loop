/**
 * WordPress dependencies
 */
import { Button, Modal } from '@wordpress/components';
import { useState } from '@wordpress/element';

/**
 * Generic shell for AQL's query builders: a trigger button in the sidebar
 * that opens the builder content in a modal.
 *
 * The shell knows nothing about the builder it hosts. It owns the open
 * state, the trigger, the title, and the close behavior; the builder is
 * passed as children and keeps writing to block attributes live.
 *
 * @param {Object}  props
 * @param {string}  props.title     Accessible modal title.
 * @param {string}  props.openLabel Trigger button label.
 * @param {boolean} props.disabled  Disable the trigger.
 * @param {string}  props.size      Modal size: small, medium, large, or fill.
 * @param {*}       props.children  Builder content rendered inside the modal.
 * @return {Element} Trigger button and, while open, the modal.
 */
export const QueryBuilderModal = ( {
	title,
	openLabel,
	disabled = false,
	size = 'medium',
	children,
} ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	return (
		<>
			<Button
				variant="secondary"
				onClick={ () => setIsOpen( true ) }
				aria-haspopup="dialog"
				aria-expanded={ isOpen }
				disabled={ disabled }
			>
				{ openLabel }
			</Button>
			{ isOpen && (
				<Modal
					title={ title }
					onRequestClose={ () => setIsOpen( false ) }
					size={ size }
					className="aql-query-builder-modal"
				>
					{ children }
				</Modal>
			) }
		</>
	);
};
