<?php
/**
 * Class for generating the query params
 *
 * @package AdvancedQueryLoop
 */

namespace AdvancedQueryLoop;

/**
 * Class to handle creating the params.
 */
class Query_Params_Generator {

	use Traits\Multiple_Posts;
	use Traits\Exclude_Current;
	use Traits\Include_Posts;
	use Traits\Meta_Query;
	use Traits\Date_Query;
	use Traits\Disable_Pagination;
	use Traits\Tax_Query;
	use Traits\Post_Parent;

	/**
	 * The list of allowed controls and their associated params in the query.
	 */
	const ALLOWED_CONTROLS = array(
		'additional_post_types'    => 'multiple_posts',
		'taxonomy_query_builder'   => 'tax_query',
		'post_meta_query'          => 'meta_query',
		'post_order'               => 'post_order',
		'exclude_current_post'     => 'exclude_current',
		'include_posts'            => 'include_posts',
		'child_items_only'         => 'child_items_only',
		'date_query_dynamic_range' => 'date_query',
		'date_query_relationship'  => 'date_query',
		'pagination'               => 'disable_pagination',
	);


	/**
	 * Default values from the default block.
	 *
	 * @var array
	 */
	private array $default_params;

	/**
	 * Custom values from AQL
	 *
	 * @var array
	 */
	private array $custom_params;

	/**
	 * Customized params to return
	 *
	 * @var array
	 */
	private array $custom_args = array();

	/**
	 * Construct method
	 *
	 * @param array $default_params Default values from the default block.
	 * @param array $custom_params  Custom values from AQL.
	 */
	public function __construct( $default_params, $custom_params ) {
		$this->default_params = is_array( $default_params ) ? $default_params : array();
		$this->custom_params  = is_array( $custom_params ) ? $custom_params : array();
	}

	/**
	 * Checks to see if the item that is passed is a post ID.
	 *
	 * This is used to check if the user is editing a template
	 *
	 * @param mixed $possible_post_id The potential post id
	 *
	 * @return bool Whether the passed item is a post id or not.
	 */
	private function is_post_id( $possible_post_id ) {
		return is_int( $possible_post_id ) || ! preg_match( '/[a-z\-]+\/\/[a-z\-]+/', $possible_post_id );
	}

	/**
	 * Check to see if a param is in the list.
	 *
	 * @param string $param_name The param to look for.
	 */
	public function has_custom_param( string $param_name ): bool {
		return array_key_exists( $param_name, $this->custom_params ) && ! empty( $this->custom_params[ $param_name ] );
	}

	/**
	 * Retrieve a single param.
	 *
	 * @param string $name The param to retrieve.
	 *
	 * @todo Return mixed type hint for 8.0
	 *
	 * @return mixed
	 */
	public function get_custom_param( string $name ) {
		if ( $this->has_custom_param( $name ) ) {
			return $this->custom_params[ $name ];
		}
		return false;
	}
	/**
	 * Static function to return the list of allowed controls and their associated params in the query.
	 *
	 * @return array
	 */
	public static function get_allowed_controls() {
		return \apply_filters( 'aql_allowed_controls', array_keys( self::ALLOWED_CONTROLS ) );
	}

	protected function get_params_to_process() {
		$params = array();
		foreach ( self::get_allowed_controls() as $control ) {
			$params[] = self::ALLOWED_CONTROLS[ $control ];
		}
		return $params;
	}

	/**
	 * Process all params at once.
	 */
	public function process_all(): void {
		// Get the params from the allowed controls and remove any duplicates.
		$params = array_unique( $this->get_params_to_process() );
		foreach ( $params as $param_name ) {
			if ( $this->has_custom_param( $param_name ) ) {
				call_user_func( array( $this, 'process_' . $param_name ) );
			}
		}
	}

	/**
	 * Retrieve the custom args
	 */
	public function get_query_args(): array {
		return $this->custom_args;
	}
}
