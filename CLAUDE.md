# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Advanced Query Loop (AQL) is a WordPress plugin that extends the core Query Loop block with advanced querying capabilities. It provides a block variation with additional controls for taxonomy queries, post meta queries, date queries, post ordering, and more.

The plugin uses a hybrid architecture combining PHP server-side logic with JavaScript/React for the block editor interface.

## Development Commands

### Setup
```bash
npm run setup              # Install PHP dependencies (runs composer run dev)
composer run dev           # Install PHP dev dependencies with autoload
```

### Development
```bash
npm start                  # Start development mode (webpack watch)
npm run start:hot          # Start with hot module replacement
```

### Building
```bash
npm run build              # Build production JavaScript
npm run release            # Full release build (composer build + npm build + plugin-zip)
npm run plugin-zip         # Create distributable plugin ZIP
composer run build         # Production PHP build (no dev dependencies)
```

### Testing
```bash
npm run test:unit          # Run PHPUnit tests
./vendor/bin/phpunit       # Run PHPUnit directly
npm run test:e2e           # Run Playwright E2E tests
npm run test:e2e:ui        # Run Playwright E2E tests in UI mode
```

### Local Environment
```bash
npm run wp-env start       # Start local WordPress environment
npm run wp-env stop        # Stop local WordPress environment
```

### Code Quality
```bash
npm run format             # Format code using WordPress standards
npm run lint:js            # Lint JavaScript
npm run lint:php           # Lint PHP (composer run lint)
```

## Architecture

### PHP Architecture (Server-Side)

**Entry Point**: `index.php` - Main plugin file that loads the autoloader.

**Core Query Processing**:
- `includes/Query_Params_Generator.php` - Central class that processes all custom query parameters using traits
- `includes/query-loop.php` - Hooks into WordPress filters to modify queries on both frontend and REST API
- Uses the `pre_render_block` filter to intercept Query Loop blocks with `namespace: 'advanced-query-loop'`
- Uses `query_loop_block_query_vars` filter for non-inherited queries
- Uses `rest_{post_type}_query` filters to enable custom parameters in the block editor

**Query Parameter Traits** (`includes/Traits/`):
Each trait in the Traits directory handles a specific query modification:
- `Date_Query.php` - Before/after/relative date filtering
- `Disable_Pagination.php` - Performance optimization by disabling pagination
- `Enable_Caching.php` - Transient caching for query results
- `Exclude_Current.php` - Remove current post from results
- `Exclude_Posts.php` - Exclude specific posts by ID
- `Exclude_Taxonomies.php` - Exclude posts by taxonomy terms (work in progress: not yet wired into `Query_Params_Generator` or the UI)
- `Include_Posts.php` - Manually select specific posts
- `Meta_Query.php` - Post meta filtering with multiple conditions
- `Multiple_Posts.php` - Multiple post type selection
- `OrderBy.php` - Post ordering (primary + secondary sort, meta-value ordering) with WP_Query compatibility normalization (e.g., 'id' → 'ID')
- `Post_Parent.php` - Child post filtering
- `Query_Id.php` - Query identifier for targeting a specific block via the `aql_query_vars` filter
- `Tax_Query.php` - Advanced taxonomy queries with AND/OR logic

**Key Filter Hook**: `aql_query_vars` - This filter allows extensions to modify query arguments. It receives:
1. `$query_args` - Arguments to be passed to WP_Query
2. `$block_query` - The query attribute from the block
3. `$inherited` - Whether the query is being inherited from template

### JavaScript/React Architecture (Block Editor)

**Entry Point**: `src/variations/index.js` - Registers the block variation and exports SlotFills.

**Block Variation Registration**: Registers `advanced-query-loop` as a variation of `core/query` with custom namespace attribute.

**Controls System** (`src/variations/controls.js`):
- Uses `addFilter` on `editor.BlockEdit` to inject custom controls
- Conditionally renders different control sets based on `query.inherit` attribute
- When `inherit: false` - Shows the grouped panels (AQL: Post, Taxonomy, Meta, Date, Order by, Performance, Advanced) plus a trailing "AQL: Extensions" panel that renders only when at least one `AQLControls`/`AQLLegacyControls` fill is registered
- When `inherit: true` - Shows the "Advanced Query Settings" panel (holding the `AQLControlsInheritedQuery` slot), the "AQL: Order by" panel (primary order/direction only), and the "AQL: Advanced" panel
- Builds `propsWithControls` passed to every component; extends the original block props with:
  - `allowedControls` — array of permitted control keys
  - `context.currentPostId` — numeric ID of the currently edited post/page (`0` in template context)
  - `context.currentPostType` — post type string, e.g. `'post'`, `'page'`, `'wp_template'`

**Panel Groups** (`src/groups/`):
Each file renders one grouped inspector panel (via `ToolsPanel`) and composes the individual components:
- `post-parameters.js` - AQL: Post (post types, include posts, child items, exclusions)
- `taxonomy-query.js` - AQL: Taxonomy (taxonomy query builder)
- `meta-query.js` - AQL: Meta (meta query builder)
- `date-query.js` - AQL: Date (dynamic range and date relationship)
- `order.js` - AQL: Order by (primary + secondary sort, meta sort keys)
- `advanced.js` - AQL: Advanced (query identifier)

**UI Components** (`src/components/`):
Individual controls composed by the groups:
- `multiple-post-select.js` - Post type selector
- `post-include-controls.js` - Manual post selection
- `child-items-toggle.js` - Show only child items
- `post-exclude-controls.js` - Exclude current post
- `exclude-taxonomies.js` - Exclude taxonomy terms (work in progress: not yet rendered by any group)
- `taxonomy-query-control.js` / `single-taxonomy-control.js` - Advanced taxonomy query builder
- `post-meta-query-controls.js` / `post-meta-control.js` - Complex meta query builder
- `post-date-query-controls.js` - Date filtering UI
- `post-order-controls.js` - Order/orderby controls
- `performance-controls.js` - AQL: Performance panel (pagination toggle, caching toggle)
- `query-id-control.js` - Query identifier control
- `post-picker-control.js` - Reusable post picker
- `icons.js` - Block variation icon

**Hooks and Utilities**: `src/hooks/` (debounced input, legacy selected posts, post type meta fields) and `src/utils/`.

**SlotFill System** (`src/slots/`):
Extensibility mechanism; `AQLControls` and `AQLControlsInheritedQuery` are exposed via `window.aql`:
- `AQLControls` - Slot for controls shown when NOT inheriting query (renders in the "AQL: Extensions" panel)
- `AQLControlsInheritedQuery` - Slot for controls shown when inheriting query (renders in "Advanced Query Settings")
- `AQLLegacyControls` - Internal slot reserved for legacy shims (e.g. the planned pre-WP-7.1 exclude-current shim); not exported on `window.aql`

### Build System

**Webpack Configuration** (`webpack.config.js`):
- Extends `@wordpress/scripts` default configuration
- Entry point: `variations: './src/variations/index.js'`
- Exports library to global `window.aql`
- Dev server allows all hosts for cross-environment testing

### Data Flow

1. **In Block Editor**:
   - User interacts with React controls in Inspector panel
   - Controls update block attributes via `setAttributes`
   - Attributes stored in block's `query` object with custom properties
   - REST API requests use `rest_{post_type}_query` filters to preview results
   - `Query_Params_Generator` processes custom params into WP_Query format

2. **On Frontend**:
   - `pre_render_block` filter catches blocks with `namespace: 'advanced-query-loop'`
   - For inherited queries: Modifies global `$wp_query` directly
   - For non-inherited queries: Hooks into `query_loop_block_query_vars`
   - `Query_Params_Generator` converts block attributes to WP_Query args
   - `aql_query_vars` filter allows final modifications before query execution

### Extensibility

Developers can extend AQL in two ways:

1. **JavaScript SlotFills**: Add custom controls via `window.aql.AQLControls` or `window.aql.AQLControlsInheritedQuery`
2. **PHP Filter Hook**: Modify query arguments via `aql_query_vars` filter

See `extending-aql.md` for detailed examples.

## Important Implementation Notes

### WP_Query Parameter Normalization

WordPress REST API and WP_Query handle parameter values differently:

- **REST API**: More lenient, automatically normalizes values (e.g., `orderby=id` → `orderby=ID`)
- **WP_Query**: Case-sensitive, requires exact values (e.g., must use `orderby=ID` not `orderby=id`)

This can cause discrepancies where queries work in the block editor (REST API) but fail on the frontend (WP_Query). The `OrderBy` trait handles this by normalizing `'id'` → `'ID'` to ensure consistent behavior across both contexts.

**When adding new orderby options:**
1. Check WordPress WP_Query documentation for the correct case/format
2. Add normalization in the `OrderBy` trait if the REST API and WP_Query values differ
3. Test both in the block editor (REST API) and on the frontend (WP_Query)

### Adding New Query Parameter Traits

To add a new query parameter type:

1. Create a new trait in `includes/Traits/` with a `process_{param_name}()` method
2. Add the trait to `Query_Params_Generator.php`
3. Add a mapping in `Query_Params_Generator::ALLOWED_CONTROLS` array
4. Create corresponding UI controls in `src/components/`
5. The trait's process method should populate `$this->custom_args` with WP_Query-compatible parameters

## Testing

PHPUnit tests are located in `tests/unit/`. Configuration in `phpunit.xml` uses PHPUnit 8.5 with Yoast polyfills for PHP 7.4+ compatibility.

## Plugin Distribution

The plugin follows WordPress.org conventions:
- `readme.txt` - WordPress.org plugin readme
- `readme.md` - GitHub readme
- Main branch: `trunk`
- PHP namespace: `AdvancedQueryLoop\`
- Text domain: `advanced-query-loop`
