/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { useEntityProp } from '@wordpress/core-data';
import { PanelBody, TextControl, SelectControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

export default function Edit( {
	attributes: { identifier, metaKey },
	setAttributes,
	context: { postType, postId },
} ) {
	const [ postMeta ] = useEntityProp( 'postType', postType, 'meta', postId );

	const mapMetaToSelect = ( metaObject ) => {
		if ( ! metaObject ) {
			return [];
		}
		return Object.entries( metaObject ).map( ( [ key ] ) => {
			return {
				label: key,
				value: key,
			};
		} );
	};

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Post Meta Settings', 'advanced-query-loop' ) }
				>
					<TextControl
						value={ identifier }
						label={ __(
							'Block Identifier',
							'advanced-query-loop'
						) }
						onChange={ ( value ) =>
							setAttributes( { identifier: value } )
						}
					/>
					{ Object.keys( postMeta ).length > 1 ? (
						<>
							<SelectControl
								label={ __( 'Meta Field', 'display-meta' ) }
								value={ metaKey }
								options={ [
									{
										label: 'Please Select',
										value: '',
									},
									...mapMetaToSelect( postMeta ),
								] }
								onChange={ ( newKey ) => {
									setAttributes( { metaKey: newKey } );
								} }
							/>
						</>
					) : (
						<p>
							{ __(
								'This post type has no registered post meta to query',
								'advanced-query-loop'
							) }
						</p>
					) }
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps() }>
				{ metaKey ? (
					<ServerSideRender
						attributes={ { identifier, metaKey } }
						block="advanced-query-loop/post-meta"
					/>
				) : (
					<p>
						{ __(
							'Please select a meta field to display',
							'advanced-query-loop'
						) }
					</p>
				) }
			</div>
		</>
	);
}
