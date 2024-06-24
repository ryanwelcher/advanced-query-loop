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
		// Retrieve the date_query param from the block
		$date_query = $this->custom_params['date_query'] ?? null;

		// Ranges and Relationships can't co-exist.
		$range = $date_query['range'] ?? false;
		if ( $date_query && $range && ! empty( $range ) ) {
			$date_queries = $this->process_date_range( $range );
		} else {
			$date_queries      = array();
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
			}
		}

		// Return the date queries.
		$this->custom_args['date_query'] = array_filter( $date_queries );
	}

	/**
	 * Generate the date ranges data
	 *
	 * @param string $range The range as provided by the UI.
	 */
	public function process_date_range( string $range ) {

		switch ( $range ) {
			case 'last-month':
				return array(
					'before' => 'today',
					'after'  => 'first day of -1 months',
				);
			case 'three-months':
				return array(
					'before' => 'today',
					'after'  => 'first day of -3 months',
				);

			case 'six-months':
				return array(
					'before' => 'today',
					'after'  => 'first day of -6 months',
				);

			case 'twelve-months':
				return array(
					'before' => 'today',
					'after'  => 'first day of -12 months',
				);
		}
	}
}
