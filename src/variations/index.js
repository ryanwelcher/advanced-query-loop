/**
 * WordPress dependencies
 */
import { registerBlockVariation } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import './controls';
import AQLIcon from '../components/icons';

export const AQL = 'advanced-query-loop';

registerBlockVariation( 'core/query', {
	name: AQL,
	title: __( 'Advanced Query Loop', 'advanced-query-loop' ),
	description: __( 'Create advanced queries', 'advanced-query-loop' ),
	icon: AQLIcon,
	isActive: [ 'namespace' ],
	attributes: {
		namespace: AQL,
	},
	scope: [ 'inserter', 'transform' ],
} );
