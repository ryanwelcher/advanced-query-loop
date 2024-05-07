<?php
/**
 * Date Query processing
 */

namespace AdvancedQueryLoop\Traits;

/**
 * Trait
 */
trait Date_Query {

	/**
	 * Main processing function.
	 */
	public function process_date_query(): void {

		$date_query        = $this->custom_params['date_query'] ?? null;
		$date_relationship = $date_query['relation'] ?? null;
		$date_primary      = $date_query['date_primary'] ?? null;
		if ( $date_query && $date_relationship && $date_primary ) {
			$date_is_inclusive = $date_query['inclusive'] ?? false;
			$date_secondary    = $date_query['date_secondary'] ?? null;

			// Date format: 2022-12-27T11:14:21.
			$primary_year  = substr( $date_primary, 0, 4 );
			$primary_month = substr( $date_primary, 5, 2 );
			$primary_day   = substr( $date_primary, 8, 2 );

			if ( 'between' === $date_relationship && $date_secondary ) {
				$secondary_year  = substr( $date_secondary, 0, 4 );
				$secondary_month = substr( $date_secondary, 5, 2 );
				$secondary_day   = substr( $date_secondary, 8, 2 );

				$date_queries = array(
					'after'  => array(
						'year'  => $primary_year,
						'month' => $primary_month,
						'day'   => $primary_day,
					),
					'before' => array(
						'year'  => $secondary_year,
						'month' => $secondary_month,
						'day'   => $secondary_day,
					),
				);
			} else {
				$date_queries = array(
					$date_relationship => array(
						'year'  => $primary_year,
						'month' => $primary_month,
						'day'   => $primary_day,
					),
				);
			}

			$date_queries['inclusive'] = $date_is_inclusive;

			// Add the date queries to the custom query.
			$this->custom_args['date_query'] = array_filter( $date_queries );
		}
	}
}
