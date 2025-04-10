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
			$inclusive_range = isset( $date_query['current_date_in_range'] ) ? ( true === $date_query['current_date_in_range'] || 'true' === $date_query['current_date_in_range'] ) : false;
			$date_queries    = $this->process_date_range( $range, $inclusive_range );
		} else {
			$date_queries      = array();
			$date_relationship = $date_query['relation'] ?? null;
			$date_primary      = $date_query['date_primary'] ?? null;

			if ( $date_query && $date_relationship ) {

				if ( 'before-current' === $date_relationship || 'after-current' === $date_relationship ) {
					switch ( $date_relationship ) {
						case 'before-current':
							$date_queries = $this->show_before_current_date();
							break;
						case 'after-current':
							$date_queries = $this->show_after_current_date();
							break;
					}
				} elseif ( $date_primary ) {
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
		}

		// Return the date queries.
		$this->custom_args['date_query'] = array_filter( $date_queries );
	}

	/**
	 * Generate the query to only show content before the current date
	 */
	public function show_before_current_date() {
		$today = strtotime( 'today' );
		// Return the date query.
		return array(
			'before' => array(
				'year'  => gmdate( 'Y', $today ),
				'month' => gmdate( 'm', $today ),
				'day'   => gmdate( 'd', $today ),
			),
		);
	}

	/**
	 * Generate the query to only show content after the current date
	 */
	public function show_after_current_date() {
		$today = strtotime( 'today' );
		// Return the date query.
		return array(
			'after' => array(
				'year'  => gmdate( 'Y', $today ),
				'month' => gmdate( 'm', $today ),
				'day'   => gmdate( 'd', $today ),
			),
		);
	}

	/**
	 * Generate the date ranges data
	 *
	 * @param string $range           The range as provided by the UI.
	 * @param bool   $inclusive_range Does the range end at the current date.
	 */
	public function process_date_range( string $range, bool $inclusive_range = false ) {

		switch ( $range ) {
			case 'last-month':
				$months_offset = '-1';
				break;
			case 'three-months':
				$months_offset = '-3';
				break;
			case 'six-months':
				$months_offset = '-6';
				break;
			case 'twelve-months':
				$months_offset = '-12';
				break;
		}
		// Get the dates for the first and last day of the month offset.
		$today  = strtotime( 'today' );
		$after  = strtotime( "first day of {$months_offset} months" );
		$before = strtotime( 'last day of last month' );

		// Are we add the current date?
		$range_to_use = $inclusive_range ? $today : $before;

		// Return the date query.
		$date_query = array(
			'before' => array(
				'year'  => gmdate( 'Y', $range_to_use ),
				'month' => gmdate( 'm', $range_to_use ),
				'day'   => gmdate( 'd', $range_to_use ),
			),
			'after'  => array(
				'year'  => gmdate( 'Y', $after ),
				'month' => gmdate( 'm', $after ),
				'day'   => gmdate( 'd', $after ),
			),
		);

		return $date_query;
	}
}
