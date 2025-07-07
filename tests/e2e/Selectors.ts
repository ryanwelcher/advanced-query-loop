import { Locator, Page } from '@playwright/test';

/**
 * Class to allow using selectors
 */
export class Selectors {
	private page: Page;

	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Retrieve a combobox my name.
	 *
	 * @param name
	 * @return Locator
	 */
	public selectFormTokenField( name: string ): Locator {
		return this.page.getByRole( 'combobox', {
			name,
		} );
	}
}
