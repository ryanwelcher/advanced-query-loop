/**
 * WordPress dependencies
 */
import {
	Button,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { PostMetaControl } from './post-meta-control';
import { createCondition, isGroup } from '../utils/meta-query-tree';

/**
 * All/Any toggle for a list of entries.
 *
 * @param {Object}   props
 * @param {string}   props.value    'AND' or 'OR'.
 * @param {Function} props.onChange Receives the new relation.
 * @return {Element} The toggle.
 */
const RelationToggle = ( { value, onChange } ) => (
	<ToggleGroupControl
		label={ __( 'Match', 'advanced-query-loop' ) }
		help={ __(
			'Whether a post must satisfy every condition or any one of them.',
			'advanced-query-loop'
		) }
		value={ value === 'OR' ? 'OR' : 'AND' }
		onChange={ onChange }
		isBlock
		__nextHasNoMarginBottom
		__next40pxDefaultSize
	>
		<ToggleGroupControlOption
			value="AND"
			label={ __( 'All conditions', 'advanced-query-loop' ) }
		/>
		<ToggleGroupControlOption
			value="OR"
			label={ __( 'Any condition', 'advanced-query-loop' ) }
		/>
	</ToggleGroupControl>
);

/**
 * Render a list of entries: conditions as cards and groups as nested lists
 * with their own relation. Groups may only contain conditions, which caps
 * nesting at two levels.
 *
 * @param {Object}   props
 * @param {Array}    props.entries            The entries at this level.
 * @param {string}   props.relation           Relation joining these entries.
 * @param {Function} props.onChange           Receives the replaced entries.
 * @param {Function} props.onRelationChange   Receives the new relation.
 * @param {string[]} props.registeredMetaKeys Meta keys to suggest.
 * @return {Element} The list.
 */
export const MetaConditionList = ( {
	entries,
	relation,
	onChange,
	onRelationChange,
	registeredMetaKeys,
} ) => {
	const replaceAt = ( index, entry ) =>
		onChange(
			entries.map( ( item, i ) => ( i === index ? entry : item ) )
		);
	const removeAt = ( index ) =>
		onChange( entries.filter( ( _, i ) => i !== index ) );

	return (
		<>
			{ entries.length > 1 && (
				<RelationToggle
					value={ relation }
					onChange={ onRelationChange }
				/>
			) }
			{ entries.map( ( entry, index ) =>
				isGroup( entry ) ? (
					<div
						key={ entry.id }
						className="aql-condition-group"
						role="group"
						aria-label={ __(
							'Condition group',
							'advanced-query-loop'
						) }
					>
						<HStack
							justify="space-between"
							className="aql-condition-group__header"
						>
							<span className="aql-condition-group__title">
								{ __( 'Group', 'advanced-query-loop' ) }
							</span>
							<Button
								variant="tertiary"
								size="small"
								isDestructive
								onClick={ () => removeAt( index ) }
							>
								{ __( 'Remove group', 'advanced-query-loop' ) }
							</Button>
						</HStack>
						<MetaConditionList
							entries={ entry.queries }
							relation={ entry.relation }
							onChange={ ( queries ) =>
								replaceAt( index, { ...entry, queries } )
							}
							onRelationChange={ ( newRelation ) =>
								replaceAt( index, {
									...entry,
									relation: newRelation,
								} )
							}
							registeredMetaKeys={ registeredMetaKeys }
						/>
						<Button
							variant="secondary"
							size="small"
							onClick={ () =>
								replaceAt( index, {
									...entry,
									queries: [
										...entry.queries,
										createCondition(),
									],
								} )
							}
						>
							{ __( 'Add condition', 'advanced-query-loop' ) }
						</Button>
					</div>
				) : (
					<PostMetaControl
						key={ entry.id }
						condition={ entry }
						registeredMetaKeys={ registeredMetaKeys }
						onChange={ ( changes ) =>
							replaceAt( index, { ...entry, ...changes } )
						}
						onRemove={ () => removeAt( index ) }
					/>
				)
			) }
		</>
	);
};
