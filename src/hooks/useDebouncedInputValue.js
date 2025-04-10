/**
 * WordPress Dependencies
 */
import { useState } from '@wordpress/element';
import { useDebounce } from '@wordpress/compose';

const useDebouncedInputValue = ( defaultVal, debounceTimeout ) => {
	const [ searchTerm, setSearchTerm ] = useState( defaultVal );
	const debouncedSetSearchTerm = useDebounce(
		setSearchTerm,
		debounceTimeout
	);
	return [ searchTerm, debouncedSetSearchTerm ];
};

export default useDebouncedInputValue;
