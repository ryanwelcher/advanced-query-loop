/**
 * WordPress dependencies
 */
import { PanelBody, TextControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEntityRecords } from '@wordpress/core-data';

const compareMetaOptions = [
	'=',
	'!=',
	'>',
	'>=',
	'<',
	'<=',
	'LIKE',
	'NOT LIKE',
	'IN',
	'NOT IN',
	'BETWEEN',
	'NOT BETWEEN',
	'NOT EXISTS',
	'REGEXP',
	'NOT REGEXP',
	'RLIKE',
];

export const PostMetaControls = ( { attributes, setAttributes } ) => {
	const {
		query: {
			postType,
			meta_key: metaKeyFromQuery = '',
			meta_value: metaValueFromQuery = '',
			meta_compare: metaCompareFromQuery = '',
		} = {},
	} = attributes;

	const { records } = useEntityRecords( 'postType', postType, {
		per_page: 1,
	} );

	const registeredMetaKeys = records?.[ 0 ]?.meta || {};

	return (
		<PanelBody
			title={ __( 'Post Meta', 'advanced-query-loop' ) }
			initialOpen={ false }
		>
			{ Object.keys( registeredMetaKeys ).length > 0 ? (
				<SelectControl
					label={ __( 'Meta Key', 'advanced-query-loop' ) }
					value={ metaKeyFromQuery }
					options={ [
						{ label: 'Choose Meta', value: '' },
						...Object.keys( registeredMetaKeys ).map(
							( metaKey ) => {
								return {
									label: metaKey,
									value: metaKey,
								};
							}
						),
					] }
					onChange={ ( newMeta ) =>
						setAttributes( {
							query: {
								...attributes.query,
								meta_key: newMeta,
							},
						} )
					}
				/>
			) : (
				<h3>
					{ __(
						'This post type has to registered post meta to query',
						'advanced-query-loop'
					) }
				</h3>
			) }

			{ metaKeyFromQuery && (
				<>
					<TextControl
						label={ __( 'Meta Value', 'advanced-query-loop' ) }
						value={ metaValueFromQuery }
						onChange={ ( newText ) => {
							if ( newText.length ) {
								setAttributes( {
									query: {
										...attributes.query,
										meta_value: newText,
									},
								} );
							} else {
								setAttributes( {
									query: {
										...attributes.query,
										meta_value: newText,
										meta_compare: '',
									},
								} );
							}
						} }
					/>
					{ metaValueFromQuery && (
						<SelectControl
							label={ __(
								'Meta Compare',
								'advanced-query-loop'
							) }
							value={ metaCompareFromQuery }
							options={ [
								...compareMetaOptions.map( ( operator ) => {
									return { label: operator, value: operator };
								} ),
							] }
							onChange={ ( newCompare ) =>
								setAttributes( {
									query: {
										...attributes.query,
										meta_compare: newCompare,
									},
								} )
							}
						/>
					) }
				</>
			) }
		</PanelBody>
	);
};
