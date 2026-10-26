<?php
/**
 * Bootstrap for tests.
 */

/*
 * Registry for test filters.
 * Tests append callables to $GLOBALS['aql_test_filters']['filter_name'][] = callback
 */
$GLOBALS['aql_test_filters'] = array();

if ( ! function_exists( 'apply_filters' ) ) {
	function apply_filters( $tag, $value, ...$args ) {
		foreach ( $GLOBALS['aql_test_filters'][ $tag ] ?? array() as $callback ) {
			$value = call_user_func( $callback, $value, ...$args );
		}
		return $value;
	}
}

if ( ! function_exists( 'get_term_by' ) ) {
	/**
	 * Mock get_term_by function for testing.
	 * Returns a simple term object with predictable IDs.
	 *
	 * @param string $field    Field to search by (e.g., 'name', 'slug', 'id').
	 * @param mixed  $value    The value to search for.
	 * @param string $taxonomy The taxonomy name.
	 * @return object|false Term object or false if not found.
	 */
	function get_term_by( $field, $value, $taxonomy ) {
		// Mock term data for testing
		$mock_terms = array(
			'category'   => array(
				'News'       => 1,
				'Technology' => 2,
				'Sports'     => 3,
			),
			'post_tag'   => array(
				'Featured' => 10,
				'Popular'  => 11,
				'Trending' => 12,
			),
			'custom_tax' => array(
				'Custom Term' => 100,
			),
		);

		if ( 'name' === $field && isset( $mock_terms[ $taxonomy ][ $value ] ) ) {
			return (object) array(
				'term_id'  => $mock_terms[ $taxonomy ][ $value ],
				'name'     => $value,
				'slug'     => sanitize_title( $value ),
				'taxonomy' => $taxonomy,
			);
		}

		return false;
	}
}

if ( ! function_exists( 'sanitize_title' ) ) {
	/**
	 * Mock sanitize_title for testing.
	 *
	 * @param string $title The title to sanitize.
	 * @return string The sanitized title.
	 */
	function sanitize_title( $title ) {
		return strtolower( str_replace( ' ', '-', $title ) );
	}
}

if ( ! function_exists( '__' ) ) {
	/**
	 * Mock translation function for testing.
	 *
	 * @param string $text   Text to translate.
	 * @param string $domain Text domain.
	 * @return string The untranslated text.
	 */
	function __( $text, $domain = 'default' ) { // phpcs:ignore
		return $text;
	}
}
