/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { serialize } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import { useCopyToClipboard } from '@wordpress/compose';
import { store as noticesStore } from '@wordpress/notices';
import { __ } from '@wordpress/i18n';

function makePlaygroundBlueprint( content = '' ) {
	const baseUrl = 'https://playground.wordpress.net/?mode=seamless#';

	const config = {
		login: true,
		landingPage: '/wp-admin/post.php?post=1&action=edit',
		preferredVersions: {
			php: '8.0',
			wp: 'latest',
		},
		steps: [
			{
				step: 'installPlugin',
				pluginZipFile: {
					resource: 'url',
					url: 'https://downloads.wordpress.org/plugin/advanced-query-loop.zip',
				},
				options: {
					activate: true,
				},
			},
			{
				step: 'wp-cli',
				command: `wp post update 1 --post_title='AQL Support'  --post_content='${ content }'`,
			},
		],
	};

	return baseUrl + encodeURI( JSON.stringify( config ) );
}

export const GeneratePlayground = ( { clientId } ) => {
	const { block, types, taxonomies } = useSelect(
		( select ) => {
			return {
				block: select( 'core/block-editor' ).getBlock( clientId ),
				types: select( 'core' ).getPostTypes(),
				taxonomies: select( 'core' ).getTaxonomies(),
			};
		},
		[ clientId ]
	);

	const { createNotice } = useDispatch( noticesStore );

	const copyButtonRef = useCopyToClipboard(
		makePlaygroundBlueprint( serialize( block ) ),
		() => {
			createNotice( 'info', __( 'Copied Playground URL to clipboard.' ), {
				isDismissible: true,
				type: 'snackbar',
			} );
		}
	);

	return (
		<Button __next40pxDefaultSize ref={ copyButtonRef } variant="secondary">
			{ __( 'Generate Playground' ) }
		</Button>
	);
};
