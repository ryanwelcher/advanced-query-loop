/**
 * WordPress dependencies
 */
import { registerBlockVariation } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import './controls';
import './editor.scss';
import '../utils/placeholder-preview-middleware';
import AQLIcon from '../components/icons';
import AQLControls from '../slots/aql-controls';
import AQLControlsInheritedQuery from '../slots/aql-controls-inherited-query';
import { PlaceholderTextControl } from '../components/placeholder-text-control';
import usePlaceholders from '../hooks/usePlaceholders';
const AQL = 'advanced-query-loop';

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

export {
	AQL,
	AQLControls,
	AQLControlsInheritedQuery,
	PlaceholderTextControl,
	usePlaceholders,
};
