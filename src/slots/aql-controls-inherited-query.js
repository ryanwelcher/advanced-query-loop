/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';

/**
 * Create our Slot and Fill components
 */
const { Fill, Slot } = createSlotFill( 'AQLControlsInheritedQuery' );

const AQLControlsInheritedQuery = ( { children } ) => <Fill>{ children }</Fill>;

AQLControlsInheritedQuery.Slot = Slot;

export default AQLControlsInheritedQuery;
