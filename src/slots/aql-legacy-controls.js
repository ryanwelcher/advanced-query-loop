/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';

/**
 * Create our Slot and Fill components
 */
const { Fill, Slot } = createSlotFill( 'AQLLegacyControls' );

/**
 * This slot is not exposed and is used to try to maintain the same UI
 */

const AQLLegacyControls = ( { children } ) => <Fill>{ children }</Fill>;

AQLLegacyControls.Slot = ( { fillProps } ) => (
	<Slot fillProps={ fillProps }>
		{ ( fills ) => {
			return fills.length ? fills : null;
		} }
	</Slot>
);

export default AQLLegacyControls;
