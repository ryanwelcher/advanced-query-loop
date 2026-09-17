/**
 * WordPress dependencies
 */
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const HideIfEmptyToggle = ( { attributes, setAttributes } ) => {
	const { query: { hide_if_empty: HideIfEmpty } = {} } = attributes;
	return (
		<ToggleControl
			__nextHasNoMarginBottom
			label={ __( 'Hide template', 'advanced-query-loop' ) }
			help={ __(
				'If there are no results, hide all the inner blocks',
				'advanced-query-loop'
			) }
			checked={ !! HideIfEmpty }
			onChange={ () =>
				setAttributes( {
					query: {
						...attributes.query,
						hide_if_empty: ! HideIfEmpty,
					},
				} )
			}
		/>
	);
};
