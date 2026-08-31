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
import {
	PostOrderControls,
	SecondaryOrderControls,
} from '../components/post-order-controls';
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
		// Resetting the primary back to the core default can leave a
		// secondary duplicating it, which is a no-op downstream — clear it.
		if ( newQuery.secondary_orderby?.order_by === CORE_DEFAULTS.orderBy ) {
			delete newQuery.secondary_orderby;
		}
		setAttributes( { query: newQuery } );
	};

	const removeSecondary = () => {
		const newQuery = { ...attributes.query };
		delete newQuery.secondary_orderby;
		setAttributes( { query: newQuery } );
	};

	const resetAll = () => {
		const newQuery = {
			...attributes.query,
			...CORE_DEFAULTS,
		};
		delete newQuery.orderby_meta_key;
		delete newQuery.secondary_orderby;
		setAttributes( { query: newQuery } );
	};

	// A secondary sort is meaningless with a random primary sort.
	const showSecondaryItem = query.orderBy !== 'rand';

	return (
		<ToolsPanel
			label={ __( 'AQL: Order by', 'advanced-query-loop' ) }
			resetAll={ resetAll }
			dropdownMenuProps={ dropdownMenuProps }
		>
			<ToolsPanelItem
				label={ __( 'Order', 'advanced-query-loop' ) }
				isShownByDefault
				hasValue={ () =>
					query.orderBy !== CORE_DEFAULTS.orderBy ||
					query.order !== CORE_DEFAULTS.order ||
					!! query.orderby_meta_key
				}
				onDeselect={ resetOrder }
			>
				<PostOrderControls { ...props } />
			</ToolsPanelItem>
			{ showSecondaryItem && (
				<ToolsPanelItem
					label={ __( 'Secondary sort', 'advanced-query-loop' ) }
					hasValue={ () => !! query.secondary_orderby }
					onSelect={ () => {
						if ( ! query.secondary_orderby ) {
							setAttributes( {
								query: {
									...attributes.query,
									// Must not duplicate the primary — the
									// select filters that option out anyway.
									secondary_orderby: {
										order_by:
											query.orderBy === 'date'
												? 'title'
												: 'date',
										order: 'desc',
									},
								},
							} );
						}
					} }
					onDeselect={ removeSecondary }
				>
					<SecondaryOrderControls { ...props } />
				</ToolsPanelItem>
			) }
		</ToolsPanel>
	);
};
