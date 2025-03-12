# Advanced Query Loop

![](https://github.com/ryanwelcher/advanced-query-loop/actions/workflows/phpunit.yml/badge.svg?branch=trunk)

## Description

This plugin introduces a Query Loop block variation that will empower users to be able to do much more complicated queries with the Query Loop block, such number of posts to display and post meta

### Support/Issues

Please use the either the [support](https://wordpress.org/support/plugin/advanced-query-loop/) forum or the [official repository](https://github.com/ryanwelcher/advanced-query-loop) for any questions or to log issues.

### Available Controls

#### Taxonomy queries

Built complicated taxonomy queries!

#### Multiple post types

Select additional post types for your query!

#### Include Posts

Choose the posts you want to display manually or only the children of the current content.

#### Exclude current post

Remove the current post from the query.

#### Exclude posts by category

Choose to exclude posts from a list of categories.

#### Post Meta Query

Generate complicated post meta queries using an interface that allows you to create a query based on `meta_key`, `meta_value` and the `compare` options. Combine multiple queries and determine if they combine results (OR) or narrow them down (AND).

#### Date Query

Query items before/after the current or selected or choose to show the post from the last 1, 3, 6 and 12 months.

#### Post Order controls

Sort in ascending or descending order by:

-   Author
-   Date
-   Last Modified Date
-   Title
-   Meta Value
-   Meta Value Num
-   Random
-   Menu Order (props to @jvanja)
-   Name (props @philbee)
-   Post ID (props to @markhowellsmead)

**Please note that this is a slight duplication of the existing sorting controls. They both work interchangeably but it just looks a bit odd in the UI**

#### Disable Pagination

Improve the performance of the query by disabling pagination. This is done automatically when there is now Pagination block in teh Post Template.

## Extending AQL

Detailed instructions on how to extend AQL as well as an example are available [here](./extending-aql.md)
