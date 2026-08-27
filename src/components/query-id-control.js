/**
 * WordPress dependencies
 */
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const QueryIdControl = ( {
	attributes,
	setAttributes,
	allowedControls,
} ) => {
	const { query: { aql_query_id: queryId } = {} } = attributes;

	// If the control is not allowed, return null.
	if ( ! allowedControls.includes( 'query_id' ) ) {
		return null;
	}

	return (
		<TextControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={ __( 'Query identifier', 'advanced-query-loop' ) }
			help={ __(
				'An optional identifier for this query. Available in the aql_query_vars filter to target this block.',
				'advanced-query-loop'
			) }
			value={ queryId ?? '' }
			onChange={ ( value ) =>
				setAttributes( {
					query: {
						...attributes.query,
						aql_query_id: value !== '' ? value : undefined,
					},
				} )
			}
		/>
	);
};
