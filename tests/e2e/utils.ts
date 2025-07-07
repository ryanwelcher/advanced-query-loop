import { Locator, Page } from '@playwright/test';

/**
 * Inserts AQL and selects the Title & Date variation.
 *
 * @param param0
 * @param param0.page
 * @param param0.editor
 */
export const insertAQL = async ( { editor } ) => {
	await editor.insertBlock( {
		name: 'core/query',
		attributes: {
			namespace: 'advanced-query-loop',
		},
	} );

	await editor.canvas
		.getByRole( 'document', { name: 'Block: Advanced Query Loop' } )
		.getByRole( 'button', { name: 'Start Blank' } )
		.click();

	await editor.canvas
		.getByRole( 'document', { name: 'Block: Advanced Query Loop' } )
		.getByRole( 'button', { name: 'Title & Date' } )
		.click();
};

/**
 *
 * @param page
 * @param name
 * @returns
 */
export const selectFormTokenField = ( page: Page, name: string ): Locator => {
	return page.getByRole( 'combobox', {
		name,
	} );
};
