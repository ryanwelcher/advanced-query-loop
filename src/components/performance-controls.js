/**
 * WordPress dependencies
 */
import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel as ToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
	ToggleControl,
} from '@wordpress/components';

import { __ } from '@wordpress/i18n';

export const PerformanceControls = ( {
	attributes,
	setAttributes,
	allowedControls,
} ) => {
	const {
		query: {
			enable_caching: enableCaching,
			orderBy,
			disable_pagination: disablePagination,
		} = {},
	} = attributes;

	if ( ! allowedControls.includes( 'enable_caching' ) ) {
		return null;
	}

	return (
		<ToolsPanel
			label={ __( 'AQL: Performance Controls', 'advanced-query-loop' ) }
			resetAll={ () =>
				setAttributes( {
					query: {
						...attributes.query,
						enable_caching: false,
						disable_pagination: false,
					},
				} )
			}
		>
			<ToolsPanelItem
				hasValue={ () => !! enableCaching }
				label={ __( 'Caching', 'advanced-query-loop' ) }
				onDeselect={ () =>
					setAttributes( {
						query: {
							...attributes.query,
							enable_caching: false,
						},
					} )
				}
			>
				<ToggleControl
					label={ __(
						'Enable Caching for this query',
						'advanced-query-loop'
					) }
					help={ __(
						'Enabling caching will store the results for subsequent page loads and will work to improve your site performance. This may not be needed for simple queries.',
						'advanced-query-loop'
					) }
					disabled={ orderBy === 'rand' }
					checked={ !! enableCaching }
					onChange={ () => {
						setAttributes( {
							query: {
								...attributes.query,
								enable_caching: ! enableCaching,
							},
						} );
					} }
					__nextHasNoMarginBottom
				/>
			</ToolsPanelItem>
			<ToolsPanelItem
				hasValue={ () => !! disablePagination }
				label={ __( 'Pagination', 'advanced-query-loop' ) }
				onDeselect={ () =>
					setAttributes( {
						query: {
							...attributes.query,
							disable_pagination: false,
						},
					} )
				}
			>
				<ToggleControl
					label={ __( 'Disable pagination', 'advanced-query-loop' ) }
					help={ __(
						'Disabling pagination will not show any pagination controls on the front end. It can also provide a performance improvement for complicated queries.',
						'advanced-query-loop'
					) }
					checked={ !! disablePagination }
					onChange={ () => {
						setAttributes( {
							query: {
								...attributes.query,
								disable_pagination: ! disablePagination,
							},
						} );
					} }
					__nextHasNoMarginBottom
				/>
			</ToolsPanelItem>
		</ToolsPanel>
	);
};
