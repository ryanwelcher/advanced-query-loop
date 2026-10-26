/**
 * Retrieve the dynamic placeholder definitions exposed by the server.
 *
 * The list is localized by includes/enqueues.php and filterable in PHP
 * via aql_placeholder_list.
 *
 * @return {Array<{name: string, label: string, description: string}>} Placeholder definitions.
 */
export default function usePlaceholders() {
	return window.aql?.placeholders ?? [];
}
