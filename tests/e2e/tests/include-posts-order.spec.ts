/**
 * Import our custom test fixtures.
 */
import { test, expect } from '../aql-fixtures';

/**
 * Internal dependencies.
 */
import { insertAQL } from '../utils';

/**
 * Opens the AQL Post panel options menu and selects
 * the "Include posts" item so the picker becomes visible in the panel.
 *
 * @param {import('@playwright/test').Page} page Playwright page object.
 */
const addIncludePostsControl = async ( page ) => {
	await page.getByRole( 'button', { name: 'AQL: Post options' } ).click();
	await page
		.getByRole( 'menuitemcheckbox', { name: 'Include posts' } )
		.click();
	await page.keyboard.press( 'Escape' );
};

/**
 * Sets the included posts on the AQL block directly, so the ordering tests don't depend on search.
 *
 * @param {import('@playwright/test').Page} page  Playwright page object.
 * @param {number}                          count The number of posts to include.
 * @return {Promise<Array<{id: number, title: string}>>} The included posts, in order, with decoded titles.
 */
const seedIncludedPosts = async ( page, count ) =>
	page.evaluate( async ( perPage ) => {
		const posts = await window.wp.apiFetch( {
			path: `/wp/v2/posts?per_page=${ perPage }&orderby=id&order=asc&_fields=id,title`,
		} );
		const includePosts = posts.map( ( post ) => ( {
			id: post.id,
			title: post.title.rendered,
		} ) );
		const { getBlocks } = window.wp.data.select( 'core/block-editor' );
		const [ block ] = getBlocks();
		window.wp.data
			.dispatch( 'core/block-editor' )
			.updateBlockAttributes( block.clientId, {
				query: {
					...block.attributes.query,
					include_posts: includePosts,
				},
			} );
		// The UI shows decoded titles (e.g. "&#8211;" as "–"), so return those for matching.
		const decode = ( html ) =>
			new DOMParser().parseFromString( html, 'text/html' ).body
				.textContent;
		return includePosts.map( ( post ) => ( {
			id: post.id,
			title: decode( post.title ),
		} ) );
	}, count );

/**
 * Returns the IDs of the included posts, in the order saved on the block.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor Editor utilities.
 * @return {Promise<number[]>} The included post IDs.
 */
const getIncludedIds = async ( editor ) => {
	const blocks = await editor.getBlocks();
	return ( blocks[ 0 ].attributes.query.include_posts || [] ).map(
		( post ) => post.id
	);
};

test.describe( 'Include Posts Ordering', () => {
	test.beforeEach( async ( { page, editor, playground, admin } ) => {
		await playground.init( { page, editor } );
		await admin.visitAdminPage( 'post-new.php' );

		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );
		await insertAQL( { editor, page } );
		await addIncludePostsControl( page );
	} );

	test.afterEach( async ( { playground } ) => {
		await playground.cleanUp();
	} );

	test( 'Picked posts are added to the end of the list', async ( {
		page,
		editor,
		selectors,
	} ) => {
		const picker = selectors.selectFormTokenField( 'Posts to Include' );
		// Scope to the token field's suggestions; the sidebar also has native <select> options.
		const suggestions = page
			.getByRole( 'listbox' )
			.getByRole( 'option' )
			.filter( { hasText: /ID:\s*\d+/ } );

		await picker.fill( 'Test Post' );
		const firstOption = suggestions.first();
		await expect( firstOption ).toBeVisible();
		const firstTitle = await firstOption.textContent();
		await firstOption.click();

		await picker.fill( 'Test Post' );
		const secondOption = suggestions.first();
		await expect( secondOption ).toBeVisible();
		// Once the results are in, the post that was already picked is not suggested again.
		await expect(
			page
				.getByRole( 'listbox' )
				.getByRole( 'option', { name: firstTitle, exact: true } )
		).toHaveCount( 0 );
		const secondTitle = await secondOption.textContent();
		await secondOption.click();

		const ids = await getIncludedIds( editor );
		expect( ids ).toHaveLength( 2 );
		expect( ids ).toEqual( [
			Number( firstTitle.match( /ID:\s*(\d+)/ )[ 1 ] ),
			Number( secondTitle.match( /ID:\s*(\d+)/ )[ 1 ] ),
		] );

		// Each picked post is listed with its controls.
		await expect(
			page.getByRole( 'button', { name: `Remove ${ firstTitle }` } )
		).toBeVisible();
		await expect(
			page.getByRole( 'button', { name: `Remove ${ secondTitle }` } )
		).toBeVisible();
	} );

	test( 'Move buttons reorder the included posts', async ( {
		page,
		editor,
	} ) => {
		const [ first, second, third ] = await seedIncludedPosts( page, 3 );

		// The first post can't move up and the last can't move down.
		await expect(
			page.getByRole( 'button', { name: `Move ${ first.title } up` } )
		).toBeDisabled();
		await expect(
			page.getByRole( 'button', { name: `Move ${ third.title } down` } )
		).toBeDisabled();

		await page
			.getByRole( 'button', { name: `Move ${ first.title } down` } )
			.click();
		expect( await getIncludedIds( editor ) ).toEqual( [
			second.id,
			first.id,
			third.id,
		] );

		await page
			.getByRole( 'button', { name: `Move ${ third.title } up` } )
			.click();
		expect( await getIncludedIds( editor ) ).toEqual( [
			second.id,
			third.id,
			first.id,
		] );
	} );

	test( 'Remove button removes only that post', async ( {
		page,
		editor,
	} ) => {
		const [ first, second, third ] = await seedIncludedPosts( page, 3 );

		await page
			.getByRole( 'button', { name: `Remove ${ second.title }` } )
			.click();

		expect( await getIncludedIds( editor ) ).toEqual( [
			first.id,
			third.id,
		] );
	} );

	test( 'Dragging a post reorders the included posts', async ( {
		page,
		editor,
	} ) => {
		const [ first, second, third ] = await seedIncludedPosts( page, 3 );
		const row = ( title ) =>
			page.locator( '[draggable="true"]' ).filter( { hasText: title } );

		await row( third.title ).dragTo( row( first.title ) );

		expect( await getIncludedIds( editor ) ).toEqual( [
			third.id,
			first.id,
			second.id,
		] );
	} );

	test( 'Help text points to the Included Posts order', async ( {
		page,
	} ) => {
		await seedIncludedPosts( page, 2 );

		await expect(
			page.getByText(
				'To show posts in this order, set Order By to Included Posts.'
			)
		).toBeVisible();

		await page.getByLabel( 'Post Order By' ).selectOption( 'post__in' );

		await expect(
			page.getByText(
				'Drag posts, or use the arrow buttons, to change their order.'
			)
		).toBeVisible();
		await expect(
			page.getByText(
				'To show posts in this order, set Order By to Included Posts.'
			)
		).toHaveCount( 0 );
	} );

	test( 'Frontend shows the included posts in the chosen order', async ( {
		page,
		editor,
	} ) => {
		const [ first, second, third ] = await seedIncludedPosts( page, 3 );

		await page.getByLabel( 'Post Order By' ).selectOption( 'post__in' );
		await page
			.getByRole( 'button', { name: `Move ${ third.title } up` } )
			.click();
		await page
			.getByRole( 'button', { name: `Move ${ third.title } up` } )
			.click();

		await editor.publishPost();
		const postId = new URL( page.url() ).searchParams.get( 'post' );
		await page.goto( `/?p=${ postId }` );

		const postTitles = await page
			// Only the AQL block in the post content; the theme's single template has its own query.
			.locator(
				'.wp-block-post-content .wp-block-query .wp-block-post-title'
			)
			.allTextContents();

		// Remove duplicates (Playground environment quirk)
		const uniqueTitles = [
			...new Set( postTitles.map( ( title ) => title.trim() ) ),
		];

		expect( uniqueTitles ).toEqual( [
			third.title,
			first.title,
			second.title,
		] );
	} );
} );
