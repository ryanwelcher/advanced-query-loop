=== Advanced Query Loop ===
Contributors: welcher
Tags: Query Loop, Custom Queries, Advanced Queries, Post Meta, Taxonomy
Requires at least: 6.2
Tested up to: 6.8.1
Stable tag: 4.3.0
Requires PHP: 7.4
License: GPL v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Transform your Query Loop blocks into powerful, flexible content engines! 🚀

== Description ==

**Supercharge your queries without any code**

Tired of the limitations of standard Query Loop blocks? Advanced Query Loop gives you the superpowers you need to create sophisticated, dynamic content queries that go far beyond the basics. Whether you're building a portfolio, news site, or complex content hub, this plugin puts you in complete control of your content display.

**What makes Advanced Query Loop special?**

* **No coding required** - Everything works through an intuitive visual interface
* **Powerful query building** - Create complex queries that would normally require custom code
* **Flexible and extensible** - Built with developers in mind, but accessible to everyone
* **Performance optimized** - Smart caching and efficient queries keep your site fast

=== Support & Community ===

Need help? We've got you covered!

* **WordPress.org Support Forum**: [Get help here](https://wordpress.org/support/plugin/advanced-query-loop/)
* **GitHub Repository**: [Report issues & contribute](https://github.com/ryanwelcher/advanced-query-loop)

=== Powerful Features at Your Fingertips ===

==== 🏷️ Advanced Taxonomy Queries ====

Build sophisticated taxonomy queries that let you filter content by multiple categories, tags, or custom taxonomies. Create complex relationships between different taxonomy terms to display exactly the content you want.

==== 📝 Multiple Post Types ====

Don't limit yourself to just posts! Query across multiple post types simultaneously. Perfect for portfolios, news sites, or any site that needs to display different types of content together.

==== 🎯 Smart Post Inclusion ====

Take full control over which posts appear in your query:
* **Manual selection**: Choose specific posts by title or ID
* **Child items only**: Show only child posts of the current content
* **Dynamic filtering**: Combine multiple inclusion rules

==== 🚫 Intelligent Post Exclusion ====

Keep your queries clean and relevant:
* **Exclude current post**: Automatically hide the post being viewed
* **Exclude a list of posts**: Curate a list of posts to exclude from the query
* **Category filtering**: Exclude posts from specific categories

==== 🔍 Advanced Post Meta Queries ====

Create powerful meta queries without touching code:
* **Multiple conditions**: Combine different meta fields and values
* **Flexible comparisons**: Use equals, not equals, greater than, less than, and more
* **Logical operators**: Combine queries with AND/OR logic
* **ACF integration**: Works seamlessly with Advanced Custom Fields

==== 📅 Dynamic Date Queries ====

Time-based content has never been easier:
* **Relative dates**: Show content from last 1, 3, 6, or 12 months
* **Before/after current**: Display content relative to the current date
* **Custom date ranges**: Set specific start and end dates
* **Multiple date conditions**: Combine different date rules

==== 📊 Flexible Sorting Options ====

Sort your content exactly how you want:
* **Author**: Sort by post author
* **Date**: Sort by publication date
* **Last Modified**: Sort by last update
* **Title**: Alphabetical sorting
* **Meta Values**: Sort by custom field values
* **Random**: Shuffle your content
* **Menu Order**: Use custom ordering
* **Name**: Sort by post slug
* **Post ID**: Sort by post ID
* **Comment Count**: Sort by engagement

==== ⚡ Performance Optimization ====

* **Smart pagination**: Automatically disable pagination when not needed
* **Efficient queries**: Optimized database queries for better performance
* **Caching friendly**: Works seamlessly with popular caching plugins

=== Customization & Extensibility ===

==== Filter Available Controls ====

Don't need all the features? No problem! You can easily hide specific controls using the `aql_allowed_controls` filter:

`
add_filter(
	'aql_allowed_controls',
	function( $controls ) {
		// Remove specific controls you don't need
		$to_exclude = array( 'additional_post_types', 'taxonomy_query_builder' );
		return array_filter( $controls, function( $control ) use ( $to_exclude ) {
			return ! in_array( $control, $to_exclude, true );
		} );
	}
);
`

==== Available Control Identifiers ====

* `'additional_post_types'` - Multiple post type selection
* `'taxonomy_query_builder'` - Advanced taxonomy queries
* `'post_meta_query'` - Meta field queries
* `'post_order'` - Sorting options
* `'exclude_current_post'` - Current post exclusion
* `'include_posts'` - Manual post inclusion
* `'child_items_only'` - Child post filtering
* `'date_query_dynamic_range'` - Date range queries
* `'date_query_relationship'` - Date query logic
* `'pagination'` - Pagination controls

==== Developer-Friendly ====

Advanced Query Loop is built with developers in mind:
* **Extensible architecture**: Add your own custom controls
* **Well-documented hooks**: Easy integration with your themes and plugins
* **Clean code**: Follows WordPress coding standards
* **Comprehensive testing**: Thoroughly tested for reliability

=== Getting Started ===

1. **Install and activate** the plugin
2. **Add a Query Loop block** to your page or post
3. **Look for the "Advanced Query Loop" variation** in the block inserter
4. **Configure your query** using the intuitive controls
5. **Preview and publish** your dynamic content!

=== Perfect For ===

* **Portfolio websites** - Showcase work with sophisticated filtering
* **News and magazine sites** - Display content by category, date, and more
* **E-commerce sites** - Filter products by custom fields and taxonomies
* **Educational platforms** - Organize content by course, level, or topic
* **Real estate sites** - Filter properties by location, price, and features
* **Any site needing advanced content queries** - The possibilities are endless!

== Screenshots ==

1. Select how many posts you want to display and the number to start at.
2. Create complicated queries for post types with registered post meta.x
3. Query posts before a date, after a date or between two dates.

== Changelog ==

= 4.3.0 =
* Exclude posts (props @darylldoyle, @Pulsar-X).
* Updated Post Meta Query UI
* Fixed showing child pages only.

= 4.2.0 =
* Fix taxonomy pagination limit (props @NickOrtiz).
* Allow controls to be filtered at the code level.

= 4.1.2 =
* Harden up the code to remove a warning.
* Resurrect the disable pagination toggl

= 4.1.1 =
* Allow extended orderby values for all publicly queryable post types (props @ocean90)
* Decode entities in the FormTokenField for post inclusion.
* Fix post type merge issue to retain default post type on frontend (props @mehidi258)

= 4.1.0 =
* The control for Pagination controls has been removed and now is automatically enabled/disabled based whether the Pagination block is in the template.
* Bug fixes.

= 4.0.2 =
* Bug fixes

= 4.0.1 =
* A few small bug fixes courtesy of @gvgvgvijayan

= 4.0.0 =
* Introducing the new Taxonomy Builder!
* Show children of current item only.
* Adds before and after current date controls
* Clean up the UI.

= 3.2.0 =
* Adds the ability to exclude posts by category (props @ghost-ng)
* Adds the ability to disable pagination.
* Deprecate controls that were moved into the Query Loop block in Gutenberg 19.
* Fix fatal error when post include array was empty.

= 3.1.1 =
* Add better SVG that works in all usages
* Change ranges to allow to not include the current date
* Trim whitespace from title.rendered

= 3.1.0 =
* Add dynamic date ranges to see posts from the last 1, 3, 6 and 12 months.
* Insert a new instance by typing "AQL" or "aql" and pressing enter.
* Adds sorting by Name (props @philbee).
* Bug fixes.

= 3.0.1 =
* Addresses some PHP fatal errors caused by type hinting.

= 3.0.0 =
* Add Sorting by Included Posts IDs.
* Add sorting by Comment Count.
* Major restructure for processing the query params.
* Add release-drafter workflow.

= 2.2.5 =
* Fixes issue with Exclude Current Post not being correctly set on templates.

= 2.2.4 =
* Fixes an issue with the Exclude Current Post toggle causing the block to crash in some circumstances

= 2.2.3 =
* Adds a Include Posts tool to allow manual curation of content to display (@props jenniferfarhat)

= 2.1.3 =
* Fixes issues in PHP 8 and the date query. (props @krokodok)

= 2.1.2 =
* Fixes issue with empty search parameter causing incorrect template to load (props @StreetDog71)
* Fixes issue with all post type not being loaded ( props @aaronware)

= 2.1.1 =
* Fixes issue with multiple AQL instances having settings leaked to each other.

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
