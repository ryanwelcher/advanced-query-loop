/**
 * WordPress dependencies
 */
import { ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEntityRecord } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';

/**
 * A component that lets you pick posts to be excluded from the query
 *
 * @param {Object}   props               Component props
 * @param {Object}   props.attributes    Block attributes
 * @param {Function} props.setAttributes Block attributes setter
 *
 * @return {Element} PostExcludeControls
 */
export const PostExcludeControls = ( { attributes, setAttributes } ) => {
	const { query: { exclude_current: excludeCurrent } = {} } = attributes;
	const { record: siteOptions } = useEntityRecord( 'root', 'site' );
	const currentPost = useSelect( ( select ) => {
		return select( 'core/editor' ).getCurrentPost();
	}, [] );

	if ( ! currentPost ) {
		return <div>{ __( 'Loading…', 'advanced-query-loop' ) }</div>;
	}

	const isDisabled = () => {
		const templatesToExclude = [ 'archive', 'search' ];

		const {
			show_on_front: showOnFront, // What is the front page set to show? Options: 'posts' or 'page'
		} = siteOptions;

		const disabledTemplates = [
			...templatesToExclude,
			...( showOnFront === 'posts' ? [ 'home', 'front-page' ] : [] ),
		];

		return (
			currentPost.type === 'wp_template' &&
			disabledTemplates.includes( currentPost.slug )
		);
	};

	return (
		<>
			<h2> { __( 'Exclude Posts', 'advanced-query-loop' ) }</h2>
			<ToggleControl
				label={ __( 'Exclude Current Post', 'advanced-query-loop' ) }
				checked={ !! excludeCurrent }
				disabled={ isDisabled() }
				onChange={ ( value ) => {
					setAttributes( {
						query: {
							...attributes.query,
							exclude_current: value ? currentPost.id : 0,
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
		</>
	);
};
