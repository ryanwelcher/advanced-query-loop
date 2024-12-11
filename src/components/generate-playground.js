/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { serialize } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

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

	console.log( types, taxonomies );

	return (
		<Button
			variant="secondary"
			onClick={ () => {
				console.log( types, taxonomies );
				console.log( makePlaygroundBlueprint( serialize( block ) ) );
			} }
		>
			Click me!
		</Button>
	);
};
