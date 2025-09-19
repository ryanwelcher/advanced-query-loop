import { select } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';

const usePostTypeMetaFields = ( postTypes ) => {
	let meta = [];
	postTypes.forEach( ( type ) => {
		const postInstance = select( coreDataStore ).getEntityRecords(
			'postType',
			type,
			{ per_page: 1 }
		);
		if ( postInstance && postInstance?.[ 0 ]?.meta !== undefined ) {
			meta = {
				...meta,
				...postInstance?.[ 0 ]?.meta,
				...postInstance?.[ 0 ]?.acf, // Include ACF fields if ACF is active
			};
		}
	} );
	return meta;
};

export default usePostTypeMetaFields;
