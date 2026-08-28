<?php
/**
 * Resolves dynamic placeholder tokens in query params.
 *
 * Tokens use the form {aql:name}. Resolution happens on the raw block
 * query params before any trait or the aql_query_vars filter runs, so
 * every control — existing or future — supports placeholders without
 * per-control code.
 *
 * @package AdvancedQueryLoop
 */

namespace AdvancedQueryLoop;

/**
 * Pure resolver: reads only the passed context array, never global WP
 * state, so it stays unit-testable without WordPress. Wiring points
 * build the context (see includes/query-loop.php).
 */
class Placeholder_Resolver {

	/**
	 * Token grammar. Public API — stable once shipped.
	 */
	const TOKEN_PATTERN = '/\{aql:([a-z0-9_]+)\}/';

	/**
	 * Recursively resolve tokens in every string value of a params array.
	 *
	 * A param whose value contained a token and resolved to an empty
	 * string is dropped, so e.g. a logged-out {aql:user_id} clause
	 * matches nothing rather than everything. Token-free values pass
	 * through untouched.
	 *
	 * @param array $params  Raw params (block query, query vars, or REST params).
	 * @param array $context Resolution context. Keys: post_id, post_type,
	 *                       is_editor_preview, block_query, inherited.
	 *
	 * @return array The params with tokens resolved.
	 */
	public static function resolve_params( array $params, array $context ): array {
		$resolved_params = array();
		foreach ( $params as $key => $value ) {
			if ( is_array( $value ) ) {
				$resolved_params[ $key ] = self::resolve_params( $value, $context );
				continue;
			}
			if ( is_string( $value ) && preg_match( self::TOKEN_PATTERN, $value ) ) {
				$resolved_value = self::resolve_string( $value, $context );
				if ( '' === $resolved_value ) {
					continue;
				}
				$resolved_params[ $key ] = $resolved_value;
				continue;
			}
			$resolved_params[ $key ] = $value;
		}
		return $resolved_params;
	}

	/**
	 * Replace every token in a single string.
	 *
	 * @param string $value   The string containing at least one token.
	 * @param array  $context Resolution context.
	 *
	 * @return string
	 */
	private static function resolve_string( string $value, array $context ): string {
		return preg_replace_callback(
			self::TOKEN_PATTERN,
			function ( $matches ) use ( $context ) {
				$resolved = self::resolve_token( $matches[1], $context );
				// Unknown token: leave it verbatim — it may be a literal value.
				return null === $resolved ? $matches[0] : $resolved;
			},
			$value
		);
	}

	/**
	 * Resolve one token name to a string, or null when unknown.
	 *
	 * @param string $name    The token name (the part after "aql:").
	 * @param array  $context Resolution context.
	 *
	 * @return string|null
	 */
	private static function resolve_token( string $name, array $context ) {
		$built_ins = self::get_built_in_resolvers();
		$resolved  = isset( $built_ins[ $name ] )
			? (string) call_user_func( $built_ins[ $name ], $context )
			: null;

		/**
		 * Filter a placeholder resolution.
		 *
		 * Return a string to resolve the token (overriding built-ins),
		 * an empty string for "known but no value" (the param is
		 * dropped), or null to leave an unknown token verbatim.
		 *
		 * @since x.x
		 *
		 * @param string|null $resolved The built-in resolution, or null for unknown names.
		 * @param string      $name     The token name.
		 * @param array       $context  Resolution context.
		 */
		$resolved = \apply_filters( 'aql_resolve_placeholder', $resolved, $name, $context );

		if ( null !== $resolved && ! is_string( $resolved ) ) {
			$resolved = (string) $resolved;
		}

		return $resolved;
	}

	/**
	 * The built-in placeholder map: name => callable( array $context ): string.
	 *
	 * Resolvers return '' when the context has no value for them.
	 *
	 * @return array
	 */
	private static function get_built_in_resolvers(): array {
		return array(
			'current_post_id'      => fn ( $context ) => ! empty( $context['post_id'] ) ? (string) $context['post_id'] : '',
			'author_id'            => fn ( $context ) => ! empty( $context['author_id'] ) ? (string) $context['author_id'] : '',
			'user_id'              => fn ( $context ) => ! empty( $context['user_id'] ) ? (string) $context['user_id'] : '',
			'current_date'         => fn () => self::format_date( 'now' ),
			'date_minus_1_month'   => fn () => self::format_date( '-1 month' ),
			'date_minus_3_months'  => fn () => self::format_date( '-3 months' ),
			'date_minus_6_months'  => fn () => self::format_date( '-6 months' ),
			'date_minus_12_months' => fn () => self::format_date( '-12 months' ),
		);
	}

	/**
	 * Format a relative date as Y-m-d in the site's timezone.
	 *
	 * Falls back to UTC when WordPress is not loaded (unit tests).
	 *
	 * @param string $modifier A strtotime()-compatible modifier.
	 *
	 * @return string
	 */
	private static function format_date( string $modifier ): string {
		if ( function_exists( 'current_time' ) ) {
			// Use 'Y-m-d H:i:s' to avoid the discouraged 'timestamp' format.
			$now = strtotime( \current_time( 'Y-m-d H:i:s' ) );
		} else {
			$now = time();
		}
		return gmdate( 'Y-m-d', strtotime( $modifier, $now ) );
	}
}
