/**
 * WordPress dependencies
 */
import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel as ToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { PostOrderControls } from '../components/post-order-controls';
import { useToolsPanelDropdownMenuProps } from './use-dropdown-menu-props';

// Core Query block defaults — order/orderBy always exist on the query attribute.
const CORE_DEFAULTS = { orderBy: 'date', order: 'desc' };

export const OrderControls = ( props ) => {
	const { attributes, setAttributes, allowedControls } = props;
	const { query } = attributes;
	const dropdownMenuProps = useToolsPanelDropdownMenuProps();

	// Skip the whole panel when none of its controls are allowed.
	if ( ! allowedControls.includes( 'post_order' ) ) {
		return null;
	}

	const resetOrder = () => {
		const newQuery = {
			...attributes.query,
			...CORE_DEFAULTS,
		};
		delete newQuery.orderby_meta_key;
		delete newQuery.secondary_orderby;
		setAttributes( { query: newQuery } );
	};

	return (
		<ToolsPanel
			label={ __( 'AQL: Order by', 'advanced-query-loop' ) }
			resetAll={ resetOrder }
			dropdownMenuProps={ dropdownMenuProps }
		>
			<ToolsPanelItem
				label={ __( 'Order', 'advanced-query-loop' ) }
				isShownByDefault
				hasValue={ () =>
					query.orderBy !== CORE_DEFAULTS.orderBy ||
					query.order !== CORE_DEFAULTS.order ||
					!! query.orderby_meta_key ||
					!! query.secondary_orderby
				}
				onDeselect={ resetOrder }
			>
				<PostOrderControls { ...props } />
			</ToolsPanelItem>
		</ToolsPanel>
	);
};
