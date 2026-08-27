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
				// Sample several posts — any single post may have no saved
				// meta even when the post type uses it.
				const postInstances = select( coreDataStore ).getEntityRecords(
					'postType',
					type,
					{ per_page: 10 }
				);
				( postInstances ?? [] ).forEach( ( postInstance ) => {
					meta = {
						...meta,
						...( postInstance?.meta ?? {} ),
						...( postInstance?.acf ?? {} ), // Include ACF fields if ACF is active
					};
				} );
			} );
			return meta;
		},
		[ postTypes ]
	);
};

export default usePostTypeMetaFields;
