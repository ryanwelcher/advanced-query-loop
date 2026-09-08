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
	 * A token that does not resolve to a non-empty string is left in the
	 * value verbatim — nothing is ever dropped. This means e.g. a
	 * logged-out {aql:user_id} clause is compared against the literal
	 * string "{aql:user_id}", which matches no real meta value, so the
	 * clause still matches nothing without ever widening to match
	 * everything. Token-free values pass through untouched.
	 *
	 * @param array $params  Raw params (block query, query vars, or REST params).
	 * @param array $context Resolution context. Keys: post_id, post_type,
	 *                       post_parent_id, author_id, user_id, term_id,
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
				$resolved_params[ $key ] = self::resolve_string( $value, $context );
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
				// Unresolved (unknown, or known but currently valueless): leave it verbatim.
				return '' === (string) $resolved ? $matches[0] : $resolved;
			},
			$value
		) ?? $value; // A PCRE failure returns null; fall back to the original string.
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
		 * Return a non-empty string to resolve the token (overriding
		 * built-ins). Return null, or leave $resolved untouched, for a
		 * name you don't handle or one with currently no value — the
		 * token is then left in the value verbatim rather than dropped.
		 *
		 * @since 4.5.0
		 *
		 * @param string|null $resolved The built-in resolution, or null for unknown names.
		 * @param string      $name     The token name.
		 * @param array       $context  Resolution context.
		 */
		$resolved = \apply_filters( 'aql_resolve_placeholder', $resolved, $name, $context );

		if ( null !== $resolved && ! is_scalar( $resolved ) ) {
			// A non-scalar (array/object) return is not a valid resolution; treat as unknown.
			$resolved = null;
		} elseif ( null !== $resolved ) {
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
			// Context-backed.
			'current_post_id'        => fn ( $context ) => ! empty( $context['post_id'] ) ? (string) $context['post_id'] : '',
			'current_post_parent_id' => fn ( $context ) => ! empty( $context['post_parent_id'] ) ? (string) $context['post_parent_id'] : '',
			'author_id'              => fn ( $context ) => ! empty( $context['author_id'] ) ? (string) $context['author_id'] : '',
			'user_id'                => fn ( $context ) => ! empty( $context['user_id'] ) ? (string) $context['user_id'] : '',
			'current_term_id'        => fn ( $context ) => ! empty( $context['term_id'] ) ? (string) $context['term_id'] : '',
			// Current date and time in common meta storage formats.
			'current_date'           => fn () => self::format_date( 'now' ),
			'current_date_compact'   => fn () => self::format_date( 'now', 'Ymd' ),
			'current_datetime'       => fn () => self::format_date( 'now', 'Y-m-d H:i:s' ),
			'current_time'           => fn () => self::format_date( 'now', 'H:i:s' ),
			'current_timestamp'      => fn () => (string) time(),
			// Zero-padded date parts.
			'current_year'           => fn () => self::format_date( 'now', 'Y' ),
			'current_month'          => fn () => self::format_date( 'now', 'm' ),
			'current_day'            => fn () => self::format_date( 'now', 'd' ),
			'current_hour'           => fn () => self::format_date( 'now', 'H' ),
			'current_week'           => fn () => self::format_date( 'now', 'W' ),
			// Relative dates.
			'date_minus_1_month'     => fn () => self::format_date( '-1 month' ),
			'date_minus_3_months'    => fn () => self::format_date( '-3 months' ),
			'date_minus_6_months'    => fn () => self::format_date( '-6 months' ),
			'date_minus_12_months'   => fn () => self::format_date( '-12 months' ),
			'date_plus_1_month'      => fn () => self::format_date( '+1 month' ),
			'date_plus_3_months'     => fn () => self::format_date( '+3 months' ),
			'date_plus_6_months'     => fn () => self::format_date( '+6 months' ),
			'date_plus_12_months'    => fn () => self::format_date( '+12 months' ),
		);
	}

	/**
	 * Format a relative date in the site's timezone.
	 *
	 * Falls back to UTC when WordPress is not loaded (unit tests).
	 *
	 * @param string $modifier A strtotime()-compatible modifier.
	 * @param string $format   A date() format. Defaults to Y-m-d.
	 *
	 * @return string
	 */
	private static function format_date( string $modifier, string $format = 'Y-m-d' ): string {
		if ( function_exists( 'current_time' ) ) {
			// Use 'Y-m-d H:i:s' to avoid the discouraged 'timestamp' format.
			// current_time() returns WP-timezone-local values, so the
			// strtotime() round-trip below is intentional, not a bug.
			$now = strtotime( \current_time( 'Y-m-d H:i:s' ) );
		} else {
			$now = time();
		}
		return gmdate( $format, strtotime( $modifier, $now ) );
	}

	/**
	 * The user-facing placeholder list that powers editor pickers.
	 *
	 * Users always see labels; the {aql:name} token is only the stored
	 * wire format. Extenders adding a resolver via aql_resolve_placeholder
	 * should add a matching row here via aql_placeholder_list.
	 *
	 * @return array List of arrays with name, label, and description keys.
	 */
	public static function get_placeholder_list(): array {
		$list = array(
			array(
				'name'        => 'current_post_id',
				'label'       => \__( 'Current Post ID', 'advanced-query-loop' ),
				'description' => \__( 'The ID of the post being viewed.', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'current_post_parent_id',
				'label'       => \__( 'Current Post Parent ID', 'advanced-query-loop' ),
				'description' => \__( 'The parent ID of the post being viewed. Matches nothing on top-level posts.', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'author_id',
				'label'       => \__( 'Author ID', 'advanced-query-loop' ),
				'description' => \__( 'The author ID of the post being viewed.', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'user_id',
				'label'       => \__( 'Logged-in User ID', 'advanced-query-loop' ),
				'description' => \__( 'The ID of the logged-in user. Matches nothing for logged-out visitors.', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'current_term_id',
				'label'       => \__( 'Current Term ID', 'advanced-query-loop' ),
				'description' => \__( 'The term ID of the taxonomy archive being viewed. Matches nothing elsewhere.', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'current_date',
				'label'       => \__( 'Current Date', 'advanced-query-loop' ),
				'description' => \__( 'Today\'s date (YYYY-MM-DD).', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'current_date_compact',
				'label'       => \__( 'Current Date (Compact)', 'advanced-query-loop' ),
				'description' => \__( 'Today\'s date without separators (YYYYMMDD), the default ACF date format.', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'current_datetime',
				'label'       => \__( 'Current Date and Time', 'advanced-query-loop' ),
				'description' => \__( 'The current date and time (YYYY-MM-DD HH:MM:SS).', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'current_time',
				'label'       => \__( 'Current Time', 'advanced-query-loop' ),
				'description' => \__( 'The current time (HH:MM:SS).', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'current_timestamp',
				'label'       => \__( 'Current Timestamp', 'advanced-query-loop' ),
				'description' => \__( 'The current Unix timestamp.', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'current_year',
				'label'       => \__( 'Current Year', 'advanced-query-loop' ),
				'description' => \__( 'The current four-digit year.', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'current_month',
				'label'       => \__( 'Current Month', 'advanced-query-loop' ),
				'description' => \__( 'The current month (01-12).', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'current_day',
				'label'       => \__( 'Current Day', 'advanced-query-loop' ),
				'description' => \__( 'The current day of the month (01-31).', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'current_hour',
				'label'       => \__( 'Current Hour', 'advanced-query-loop' ),
				'description' => \__( 'The current hour (00-23).', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'current_week',
				'label'       => \__( 'Current Week', 'advanced-query-loop' ),
				'description' => \__( 'The current ISO week number (01-53).', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'date_minus_1_month',
				'label'       => \__( '1 Month Ago', 'advanced-query-loop' ),
				'description' => \__( 'The date one month before today (YYYY-MM-DD).', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'date_minus_3_months',
				'label'       => \__( '3 Months Ago', 'advanced-query-loop' ),
				'description' => \__( 'The date three months before today (YYYY-MM-DD).', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'date_minus_6_months',
				'label'       => \__( '6 Months Ago', 'advanced-query-loop' ),
				'description' => \__( 'The date six months before today (YYYY-MM-DD).', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'date_minus_12_months',
				'label'       => \__( '12 Months Ago', 'advanced-query-loop' ),
				'description' => \__( 'The date twelve months before today (YYYY-MM-DD).', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'date_plus_1_month',
				'label'       => \__( '1 Month From Now', 'advanced-query-loop' ),
				'description' => \__( 'The date one month after today (YYYY-MM-DD).', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'date_plus_3_months',
				'label'       => \__( '3 Months From Now', 'advanced-query-loop' ),
				'description' => \__( 'The date three months after today (YYYY-MM-DD).', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'date_plus_6_months',
				'label'       => \__( '6 Months From Now', 'advanced-query-loop' ),
				'description' => \__( 'The date six months after today (YYYY-MM-DD).', 'advanced-query-loop' ),
			),
			array(
				'name'        => 'date_plus_12_months',
				'label'       => \__( '12 Months From Now', 'advanced-query-loop' ),
				'description' => \__( 'The date twelve months after today (YYYY-MM-DD).', 'advanced-query-loop' ),
			),
		);

		/**
		 * Filter the user-facing placeholder list shown in editor pickers.
		 *
		 * @since 4.5.0
		 *
		 * @param array $list List of arrays with name, label, and description keys.
		 */
		return \apply_filters( 'aql_placeholder_list', $list );
	}
}
