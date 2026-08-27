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

	// A secondary sort is meaningless with a random primary sort, and
	// inherited queries never run the AQL generator on the frontend.
	const showSecondaryItem = query.orderBy !== 'rand' && ! query.inherit;

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
									secondary_orderby: {
										order_by: 'date',
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
