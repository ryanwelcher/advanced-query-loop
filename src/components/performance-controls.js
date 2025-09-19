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

export const PerformanceControls = ( { attributes, setAttributes } ) => {
	const { query: { enable_caching: enableCaching, orderBy } = {} } =
		attributes;
	return (
		<ToolsPanel
			label={ __( 'AQL: Performance Controls' ) }
			resetAll={ () => {} }
		>
			<ToolsPanelItem
				hasValue={ () => !! enableCaching }
				label={ __( 'Caching' ) }
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
		</ToolsPanel>
	);
};
