/**
 * WordPress dependencies
 */
import { SVG, Path } from '@wordpress/primitives';

function AQLIcon() {
	return (
		<SVG
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			fill="none"
			viewBox="0 0 24 24"
		>
			<Path fill="#2D2B55" d="M0 0h24v24H0V0z"></Path>
			<Path
				fill="#fff"
				d="M17.936 8.438h1.217v6.125h2.867v1.093h-4.084V8.437zM10.364 12.047c0 .515.11.97.33 1.361.22.392.519.701.897.928.385.22.815.33 1.289.33.481 0 .907-.106 1.279-.32.371-.22.663-.522.876-.907.213-.385.32-.825.32-1.32 0-.495-.107-.942-.32-1.34a2.455 2.455 0 00-.886-.95c-.372-.233-.812-.35-1.32-.35-.475 0-.898.11-1.269.33-.371.22-.663.526-.877.918-.213.385-.32.825-.32 1.32zm-1.29 0c0-.543.094-1.042.28-1.495.192-.454.456-.846.793-1.176a3.685 3.685 0 011.197-.784c.46-.185.955-.278 1.485-.278.543 0 1.041.093 1.495.278a3.57 3.57 0 011.186.784c.337.33.598.722.784 1.176.185.453.278.952.278 1.495 0 .536-.093 1.034-.278 1.495-.186.46-.447.86-.784 1.196-.33.337-.722.602-1.176.795a3.941 3.941 0 01-1.505.278 3.964 3.964 0 01-1.496-.278 3.676 3.676 0 01-1.196-.795 3.545 3.545 0 01-.784-1.196 3.964 3.964 0 01-.278-1.495zm3.425.515H13.9l3.248 3.146h-1.433l-3.217-3.146z"
			></Path>
			<Path
				fill="#E76F51"
				d="M3.546 13.8l.227-1.031h3.351l.237 1.031H3.546zm1.887-3.32l-1.134 2.65-.021.268-1 2.258H1.906l3.527-7.62 3.527 7.62H7.588l-.98-2.196-.03-.3-1.145-2.68z"
			></Path>
		</SVG>
	);
}

export default AQLIcon;

// Copies of the @wordpress/icons icons used by the post picker. That package bundles its own
// React, which breaks rendering, so the icons are built from the shared primitives instead.
export const dragHandle = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M8 7h2V5H8v2zm0 6h2v-2H8v2zm0 6h2v-2H8v2zm6-14v2h2V5h-2zm0 8h2v-2h-2v2zm0 6h2v-2h-2v2z" />
	</SVG>
);

export const chevronUp = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M6.5 12.4L12 8l5.5 4.4-.9 1.2L12 10l-4.5 3.6-1-1.2z" />
	</SVG>
);

export const chevronDown = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z" />
	</SVG>
);

export const closeSmall = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M12 13.06l3.712 3.713 1.061-1.06L13.061 12l3.712-3.712-1.06-1.06L12 10.938 8.288 7.227l-1.061 1.06L10.939 12l-3.712 3.712 1.06 1.061L12 13.061z" />
	</SVG>
);
