/**
 * WordPress dependencies
 */
import { Button, SelectControl, TextControl } from '@wordpress/components';
import { plus, closeSmall } from '@wordpress/icons';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { PostMetaControls } from './post-meta-controls';
// A component to render a select control for the post meta query.

export const PostMetaQueryControls = ( { attributes, setAttributes } ) => {
	const {
		query: {
			meta_query: {
				relation: relationFromQuery = '',
				queries = [
					{
						meta_key: 'stream-duration',
						meta_value: '1:00:00',
						meta_compare: '<',
					},
					{
						meta_key: 'stream-duration',
						meta_value: '00',
						meta_compare: '>',
					},
				],
			} = {},
		} = {},
	} = attributes;

	return (
		<PanelBody title={ __( 'Post Meta Query', 'advanced-query-loop' ) }>
			<SelectControl
				label={ __( 'Query Relationship', 'advanced-query-loop' ) }
				value={ relationFromQuery }
				options={ [
					{ label: 'Choose relationship', value: '' },
					{ label: 'AND', value: 'AND' },
					{ label: 'OR', value: 'OR' },
				] }
				onChange={ ( relation ) =>
					setAttributes( {
						query: {
							...attributes.query,
							meta_query: {
								...attributes.query.meta_query,
								relation,
							},
						},
					} )
				}
			/>

			{ queries.map( ( item ) => {
				return (
					<PanelBody key={ item.meta_key }>
						<TextControl
							label={ __( 'Meta Key', 'advanced-query-loop' ) }
							value={ item.meta_key }
						/>
						<TextControl
							label={ __( 'Meta Value', 'advanced-query-loop' ) }
							value={ item.meta_value }
						/>
						<TextControl
							label={ __(
								'Meta Compare',
								'advanced-query-loop'
							) }
							value={ item.meta_value }
						/>
					</PanelBody>
				);
			} ) }

			<Button
				isSmall
				variant="primary"
				icon={ plus }
				onClick={ () => {
					const newQueries = [
						...queries,
						{
							meta_key: 'stream-duration-dd',
							meta_value: '00',
							meta_compare: '>',
						},
					];
					setAttributes( {
						...attributes.query,
						queries: newQueries,
					} );
				} }
			/>
			<Button isSmall icon={ closeSmall } />
		</PanelBody>
	);
};
