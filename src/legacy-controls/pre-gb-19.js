/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import AQLLegacyControls from '../slots/aql-legacy-controls';
import { PostCountControls } from '../components/post-count-controls';
import { PostOffsetControls } from '../components/post-offset-controls';

registerPlugin( 'aql-pre-gb-19-controls', {
	render: () => {
		return (
			<>
				<AQLLegacyControls>
					{ ( props ) => (
						<>
							<PostCountControls { ...props } />
							<PostOffsetControls { ...props } />
						</>
					) }
				</AQLLegacyControls>
			</>
		);
	},
} );
