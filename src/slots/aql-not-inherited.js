/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';

/**
 * Create our Slot and Fill components
 */
const { Fill, Slot } = createSlotFill( 'AQLNotInherited' );

const AQLNotInherited = ( { children } ) => <Fill>{ children }</Fill>;

AQLNotInherited.Slot = Slot;

export default AQLNotInherited;
