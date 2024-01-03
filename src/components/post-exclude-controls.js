/**
 * WordPress dependencies
 */
import { ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * A component that lets you pick posts to be excluded from the query
 *
 * @return {Element} PostExcludeControls
 */

export const PostExcludeControls = ( { attributes, setAttributes } ) => {
	const { query: { exclude_current: excludeCurrent } = {} } = attributes;

	const currentPost = useSelect( ( select ) => {
		return select( 'core/editor' ).getCurrentPost();
	}, [] );

	const [ excludeCurrentState ] = useState( excludeCurrent );

	useEffect( () => {
		if ( excludeCurrent !== excludeCurrentState ) {
			setAttributes( {
				query: {
					...attributes.query,
					include_posts: [],
				},
			} );
		}
	}, [ excludeCurrent ] );

	if ( ! currentPost ) {
		return <div>{ __( 'Loading…', 'advanced-query-loop' ) }</div>;
	}

	return (
		<>
			<h2> { __( 'Exclude Posts', 'advanced-query-loop' ) }</h2>
			<ToggleControl
				label={ __( 'Exclude Current Post', 'advanced-query-loop' ) }
				checked={ !! excludeCurrent }
				onChange={ ( value ) => {
					setAttributes( {
						query: {
							...attributes.query,
							exclude_current: value ? currentPost.id : 0,
						},
					} );
				} }
			/>
		</>
	);
};
