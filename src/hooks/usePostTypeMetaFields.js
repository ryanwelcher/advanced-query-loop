import { useSelect } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';

const usePostTypeMetaFields = ( postTypes ) => {
	return useSelect(
		( select ) => {
			const keys = new Set();
			if ( ! Array.isArray( postTypes ) || postTypes.length === 0 ) {
				return [];
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
					Object.keys( postInstance?.meta ?? {} ).forEach( ( key ) =>
						keys.add( key )
					);
					// Include ACF fields if ACF is active.
					Object.keys( postInstance?.acf ?? {} ).forEach( ( key ) =>
						keys.add( key )
					);
				} );
			} );
			return [ ...keys ];
		},
		[ postTypes ]
	);
};

export default usePostTypeMetaFields;
