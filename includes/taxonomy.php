<?php
/**
 * Taxonomy relation functions
 *
 * @package AdvancedQueryLoop\Taxonomy
 */

namespace AdvancedQueryLoop\Taxonomy;

function convert_names_to_ids( $names, $tax ) {
	$rtn = [];
	foreach ( $names as $name ) {
		$term = get_term_by( 'name', $name, $tax );
		if ( $term ) {
			$rtn[] = $term->term_id;
		}
	}
	return $rtn;
}

function parse_taxonomy_query( $tax_query_data ) {
	return [
		[
			'taxonomy'         => $tax_query_data['taxonomy'],
			'terms'            => convert_names_to_ids( $tax_query_data['terms'], $tax_query_data['taxonomy'] ),
			'include_children' => ( ! isset( $tax_query_data['include_children'] ) || 'true' === $tax_query_data['include_children'] ) ? true : false,
			'operator'         => $tax_query_data['operator'],
		],
	];
}
