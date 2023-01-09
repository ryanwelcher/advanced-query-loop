=== Advanced Query Loop ===
Contributors: welcher
Tags: Query Loop, Custom Queries
Requires at least: 6.1
Tested up to: 6.1
Stable tag: 1.1.2
Requires PHP: 7.2
License: GPL v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A Query Loop block variation that provides controls to build more complicated queries.

== Description ==
This plugin introduces a Query Loop block variation that will empower users to be able to do much more complicated queries with the Query Loop block, such number of posts to display and post meta

=== Support/Issues ===
Please use the either the [support](https://wordpress.org/support/plugin/advanced-query-loop/) forum or the [official repository](https://github.com/ryanwelcher/advanced-query-loop) for any questions or to log issues.

=== Available Controls ===

==== Post Count and Offset ====
Set the number of items you want to display ( up to 10 ) and choose whether you want to start at the first or 100th!

==== Post Meta Query ====
Generate complicated post meta queries using an interface that allows you to create a query based on `meta_key`, `meta_value` and the `compare` options. Combine multiple queries and determine if they combine results (OR) or narrow them down (AND).

==== Date Query ====
Query items before a date, after a date or between two dates!

== Screenshots ==

1. Select how many posts you want to display and the number to start at.
2. Create complicated queries for post types with registered post meta.x
3. Query posts before a date, after a date or between two dates.

== Changelog ==

= 1.1.2 =
* Introduces new AQL: Post Meta Block.
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
