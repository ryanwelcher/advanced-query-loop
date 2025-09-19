import { useSelect } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';

const usePostTypeMetaFields = ( postTypes ) => {
	return useSelect(
		( select ) => {
			let meta = {};
			if ( ! Array.isArray( postTypes ) || postTypes.length === 0 ) {
				return meta;
			}
			postTypes.filter( Boolean ).forEach( ( type ) => {
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
		},
		[ postTypes ]
	);
};

export default usePostTypeMetaFields;
