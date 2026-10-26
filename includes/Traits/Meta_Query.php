<?php
/**
 * Manage parsing the meta query information
 */

namespace AdvancedQueryLoop\Traits;

use AdvancedQueryLoop\Placeholder_Resolver;

trait Meta_Query {

	public function process_meta_query() {
		$this->custom_args['meta_query'] = $this->parse_meta_query( $this->custom_params['meta_query'] );
	}

	public function parse_meta_query( $meta_query_data ) {
		$meta_queries = array();
		if ( isset( $meta_query_data ) ) {
			$meta_queries = array(
				'relation' => isset( $meta_query_data['relation'] ) ? $meta_query_data['relation'] : '',
			);

			if ( isset( $meta_query_data['queries'] ) ) {
				foreach ( $this->parse_meta_entries( $meta_query_data['queries'] ) as $entry ) {
					$meta_queries[] = $entry;
				}
			}
		}

		return array_filter( $meta_queries );
	}

	/**
	 * Convert a list of builder entries into WP_Query meta clauses.
	 *
	 * An entry is either a condition (meta_key, meta_value, meta_compare,
	 * meta_type) or a group: an array with its own relation and a nested
	 * queries list. Groups recurse to any depth; a group left with no
	 * conditions is dropped.
	 *
	 * @param array $entries The builder entries.
	 * @return array The clauses, in order.
	 */
	private function parse_meta_entries( $entries ) {
		$parsed = array();
		foreach ( (array) $entries as $entry ) {
			if ( isset( $entry['queries'] ) && is_array( $entry['queries'] ) ) {
				$children = $this->parse_meta_entries( $entry['queries'] );
				if ( empty( $children ) ) {
					continue;
				}
				$group = array(
					'relation' => ! empty( $entry['relation'] ) ? $entry['relation'] : 'AND',
				);
				foreach ( $children as $child ) {
					$group[] = $child;
				}
				$parsed[] = $group;
				continue;
			}

			// A placeholder with no current value: use a clause that never matches.
			if ( $this->has_valueless_placeholder( $entry ) ) {
				$parsed[] = array(
					'key'     => Placeholder_Resolver::NO_VALUE,
					'compare' => 'EXISTS',
				);
				continue;
			}

			$condition = array_filter(
				array(
					'key'     => $entry['meta_key'] ?? '',
					'value'   => $entry['meta_value'] ?? '',
					'compare' => $entry['meta_compare'] ?? '',
					'type'    => $entry['meta_type'] ?? '',
				)
			);
			if ( ! empty( $condition ) ) {
				$parsed[] = $condition;
			}
		}
		return $parsed;
	}

	/**
	 * Whether a meta query clause's key or value holds a valueless placeholder.
	 *
	 * @param array $query The meta query clause from the block.
	 *
	 * @return bool
	 */
	private function has_valueless_placeholder( $query ) {
		foreach ( array( 'meta_key', 'meta_value' ) as $field ) {
			foreach ( (array) ( $query[ $field ] ?? array() ) as $value ) {
				if ( is_string( $value ) && false !== strpos( $value, Placeholder_Resolver::NO_VALUE ) ) {
					return true;
				}
			}
		}
		return false;
	}
}
