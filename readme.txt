=== Advanced Query Loop ===
Contributors: welcher
Tags: Query Loop, Custom Queries
Requires at least: 6.2
Tested up to: 6.4
Stable tag: 2.1.0
Requires PHP: 7.2
License: GPL v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A Query Loop block variation that provides controls to build more complicated queries.

== Description ==
This plugin introduces a Query Loop block variation that will empower users to be able to do much more complicated queries with the Query Loop block, such number of posts to display and post meta

=== Support/Issues ===
Please use the either the [support](https://wordpress.org/support/plugin/advanced-query-loop/) forum or the [official repository](https://github.com/ryanwelcher/advanced-query-loop) for any questions or to log issues.

=== Available Controls ===

==== Multiple post types ====
Select additional post types for your query!

==== Post Count ====
Set the number of items you want to display (up to 50).

==== Offset ====
Choose whether you want to start at the first or 100th!

==== Post Meta Query ====
Generate complicated post meta queries using an interface that allows you to create a query based on `meta_key`, `meta_value` and the `compare` options. Combine multiple queries and determine if they combine results (OR) or narrow them down (AND).

==== Date Query ====
Query items before a date, after a date or between two dates!

==== Post Order controls ====
Sort in ascending or descending order by:

-   Author
-   Date
-   Last Modified Date
-   Title
-   Meta Value
-   Meta Value Num
-   Random
-   Menu Order ( props to @jvanja )
-   Post ID ( props to @markhowellsmead )

**Please note that this is a slight duplication of the existing sorting controls. They both work interchangeably but it just looks a bit odd in the UI**

== Screenshots ==

1. Select how many posts you want to display and the number to start at.
2. Create complicated queries for post types with registered post meta.x
3. Query posts before a date, after a date or between two dates.

== Changelog ==
= 2.1.0 =
* ACF custom fields now show in the auto-complete dropdown list for Post Meta Queries ( props to @jvanja  )
* Adds sort by Post ID ( props to @markhowellsmead )
* Fixes a typo in the Order By label.
* Fixes a bug where a second AQL instances was getting post meta query values from the first.

= 2.0.0 =
* Due to a change in core, Post Count can no longer be overridden when the block is set to inherit the query.
* Adds Exclude current post option. Props to @Pulsar-X
* Bump Tested Up To for 6.4
* Adds better instructions for creating extension plugins.

= 1.5.1 =
* Adds EXISTS as a compare option for Post Meta Queries.

= 1.5 =
* Moves all controls into a single panel titled "Advanced Query Settings".
* Exposes SlotFills and filters to allow extension of plugin to add any featured you want.
* Minor PHP warning fixes.

= 1.4.3 =
* Addresses translations from https://translate.wordpress.org/ not loading. HUGE thank you to @himaartwp for opening the issue and to everyone that helped with the Japanese translation!
* Fixes minor php warnings in the editor

= 1.4.2 =
* Addresses an issue where `noindex` was being added incorrectly due to an empty parameter. Props to @pedjas for reporting.
* Small fixes to address some PHP warnings.

= 1.4.1 =
* Small fixes to address some PHP warnings.

= 1.4.0 =
* Adds Menu Order to the sort by options. Props to @jvanja for the Pull Request *

= 1.3.0 =
* Adds support for sorting by Meta Value, Meta Value Num, and Random.
* Adds transform to convert existing Query Loop instances into Advanced Query Loop blocks.
* Adds a release command.
* Adds support for querying multiple post types.

= 1.2.1 =
* Fixes missing controls when not inheriting the query. Props to @cvladan for opening the support thread.

= 1.2.0 =
* Introduce Post Order controls to sort by Author, Date, Last Modified Date, or Title in ascending or descending order. Props to @asterix for the suggestion of adding Last Modified Date.
* Enable Post Count and Post Order controls even when inheriting the query.

= 1.1.0 =
* Allow manual input of post meta. Props to @svenl77 for opening the support thread.

= 1.0.5 =
* PRO TIP: Include the PHP files when you release the plugin :/

= 1.0.4 =
* Adds custom icon.
* Under the hood restructuring of code.

= 1.0.3 =
* Small fix for PHP 8. Props to @markus9312 for opening the support thread.

= 1.0.2 =
* Fix various PHP notices. Props to @wildworks for opening the support thread.
* Add some information to the readmes.

= 1.0.1 =
* Small fix to no longer show an empty pattern after inserting the block.

= 1.0.0 =
* Initial release with support for post count, offset, post meta, and date queries.
