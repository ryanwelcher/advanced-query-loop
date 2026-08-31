/**
 * WordPress dependencies
 */
import { ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEntityRecord, store as coreDataStore } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';

/**
 * ExcludeCurrentPostToggle is a React functional component used within the context
 * of advanced query loop settings. It toggles the exclusion of the current post
 * or content associated with the current template from query results.
 *
 * @param {Object}   props                 The properties passed to the component.
 * @param {Object}   props.attributes      The block attributes.
 * @param {Function} props.setAttributes   Function to update block attributes.
 * @param {Array}    props.allowedControls Allowed controls.
 *
 * @return {Element|null} A `ToggleControl` component.
 */
export const ExcludeCurrentPostToggle = ( {
	attributes,
	setAttributes,
	allowedControls,
} ) => {
	const { query: { exclude_current: excludeCurrent } = {} } = attributes;

	const { record: siteOptions } = useEntityRecord( 'root', 'site' );
	const { currentPost, isAdmin } = useSelect( ( select ) => {
		return {
			currentPost: select( 'core/editor' ).getCurrentPost(),
			isAdmin: select( coreDataStore ).canUser( 'update', {
				kind: 'root',
				name: 'site',
			} ),
		};
	}, [] );

	// If the control is not allowed, return null.
	if ( ! allowedControls.includes( 'exclude_current_post' ) ) {
		return null;
	}

	if ( ! currentPost ) {
		return <div>{ __( 'Loading…', 'advanced-query-loop' ) }</div>;
	}

	const isDisabled = () => {
		// If the user is not an admin, they cannot edit template anyway
		if ( ! isAdmin || ! currentPost ) {
			return false;
		}

		// Only disable if we're editing a template AND it's in the list
		if ( currentPost.type !== 'wp_template' ) {
			return false;
		}

		const templatesToExclude = [ 'archive', 'search' ];
		const {
			show_on_front: showOnFront, // What is the front page set to show? Options: 'posts' or 'page'
		} = siteOptions;
		const disabledTemplates = [
			...templatesToExclude,
			...( showOnFront === 'posts' ? [ 'home', 'front-page' ] : [] ),
		];
		return disabledTemplates.includes( currentPost.slug );
	};

	return (
		<ToggleControl
			__nextHasNoMarginBottom
			label={ __( 'Exclude Current Post', 'advanced-query-loop' ) }
			checked={ !! excludeCurrent }
			disabled={ isDisabled() }
			onChange={ ( value ) => {
				setAttributes( {
					query: {
						...attributes.query,
						exclude_current: value,
					},
				} );
			} }
			help={
				isDisabled()
					? __(
							'This option is disabled for this template as there is no dedicated post to exclude.',
							'advanced-query-loop'
					  )
					: __(
							'Remove the associated post for this template/content from the query results.',
							'advanced-query-loop'
					  )
			}
		/>
	);
};
