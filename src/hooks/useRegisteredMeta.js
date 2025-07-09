/**
 * WordPress Dependencies
 */
import { useState } from '@wordpress/element';
import { select } from '@wordpress/data';

function useRegisteredMeta( listOfPostTypes ) {
	console.log( listOfPostTypes );
	const [ meta, setMeta ] = useState();
	const results = listOfPostTypes.map( ( item ) =>
		select( 'core' ).getEntityRecords( 'postType', item, {
			per_page: 1,
		} )
	);
	console.log( results );
}

export default useRegisteredMeta;
