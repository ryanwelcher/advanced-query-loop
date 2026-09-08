/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as blocksStore } from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';

/**
 * Whether core's Query Loop block registers its own `excludeCurrent` query
 * property (WordPress 7.1+, or the Gutenberg plugin's compat shim).
 *
 * The check reads the registered block type rather than sniffing a version so
 * Gutenberg-plugin sites on older core count as having support.
 *
 * @return {boolean} True when core provides the Exclude current toggle.
 */
export const useHasCoreExcludeCurrent = () =>
	useSelect( ( select ) => {
		const queryDefault =
			select( blocksStore ).getBlockType( 'core/query' )?.attributes
				?.query?.default;
		return (
			!! queryDefault &&
			Object.prototype.hasOwnProperty.call(
				queryDefault,
				'excludeCurrent'
			)
		);
	}, [] );

/**
 * Migrates the legacy AQL `exclude_current` query key to core's
 * `excludeCurrent` when core supports it.
 *
 * Runs once per edit session of a block: a truthy legacy value (true, or the
 * post/template ID older versions stored) becomes `excludeCurrent: true`, a
 * falsy one is simply dropped. The legacy key is always deleted so the
 * `Exclude_Current` PHP trait no longer runs for this block.
 *
 * @param {Object}   attributes    Block attributes.
 * @param {Function} setAttributes Attribute setter.
 */
export const useMigrateExcludeCurrent = ( attributes, setAttributes ) => {
	const hasCoreExcludeCurrent = useHasCoreExcludeCurrent();
	const { __unstableMarkNextChangeAsNotPersistent } =
		useDispatch( blockEditorStore );
	const query = attributes?.query;
	const needsMigration =
		hasCoreExcludeCurrent &&
		!! query &&
		Object.prototype.hasOwnProperty.call( query, 'exclude_current' );

	useEffect( () => {
		if ( ! needsMigration ) {
			return;
		}
		const { exclude_current: legacyValue, ...rest } = query;
		const nextQuery = legacyValue
			? { ...rest, excludeCurrent: true }
			: rest;
		__unstableMarkNextChangeAsNotPersistent();
		setAttributes( { query: nextQuery } );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ needsMigration ] );
};
