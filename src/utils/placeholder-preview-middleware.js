/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { select } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';

/**
 * When an editor preview request contains AQL placeholder tokens, attach
 * the currently edited post ID so the server can resolve context-dependent
 * placeholders (e.g. {aql:current_post_id}) accurately.
 *
 * In contexts with no single edited post (template editor), no param is
 * sent and the server falls back gracefully.
 */
apiFetch.use( ( options, next ) => {
	const { path } = options;
	if ( typeof path === 'string' ) {
		let decodedPath = path;
		try {
			decodedPath = decodeURIComponent( path );
		} catch ( error ) {
			// Malformed sequence — fall back to the raw path.
		}
		if ( decodedPath.includes( '{aql:' ) ) {
			const postId = select( 'core/editor' )?.getCurrentPostId?.();
			if ( typeof postId === 'number' && postId > 0 ) {
				return next( {
					...options,
					path: addQueryArgs( path, {
						aql_preview_post_id: postId,
					} ),
				} );
			}
		}
	}
	return next( options );
} );
