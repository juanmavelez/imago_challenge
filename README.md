# IMAGO Search

A search experience for IMAGO's media content library, built with Next.js 16, TypeScript, and Tailwind CSS 4. The application provides keyword search with TF-IDF relevance scoring, fuzzy typo tolerance, metadata filtering, date sorting, pagination, and usage analytics over a dataset of 10,000 generated media items.

**Live demo:** [imago.thevelezlab.com](https://imago.thevelezlab.com)

---

## Table of Contents

- [Running Locally](#running-locally)
- [High-Level Approach](#high-level-approach)
- [Architecture Overview](#architecture-overview)
- [Search Strategy and Relevance](#search-strategy-and-relevance)
- [Preprocessing Strategy](#preprocessing-strategy)
- [Scaling Approach](#scaling-approach)
- [Testing Approach](#testing-approach)
- [Assumptions](#assumptions)
- [Trade-offs](#trade-offs)
- [Limitations and Next Steps](#limitations-and-next-steps)

---

## Running Locally

### Prerequisites

- Node.js 22 or later
- npm

### Development

```bash
npm install
npm run dev
```

This automatically generates the synthetic dataset (`data/data.json`) then starts the Next.js development server at `http://localhost:3000`

## High-Level Approach

The system is designed around three core principles:

1. **Build-time preprocessing.** Raw media metadata is normalized, structured fields are extracted, and an inverted index is constructed at startup. This moves expensive work out of the request path.
2. **In-memory search engine.** A custom inverted index with TF-IDF scoring and Levenshtein-based fuzzy matching provides sub-millisecond query resolution for 10,000 items without external dependencies.
3. **Server-side rendering with client-side interactivity.** The main search page is a Next.js Server Component that executes the search on the server and streams HTML. Filters and search input are Client Components that update URL parameters, triggering a server re-render. This avoids waterfalls and provides fast initial page loads.

---

## Architecture Overview

### Clean Architecture — The `lib/` Boundary

The project follows a **Clean Architecture** principle: core business logic lives in `lib/` and has **zero imports from Next.js or any framework-specific code**. The `lib/` directory contains two self-contained modules — `search-engine` and `analytics` — that depend only on Node.js built-ins and the TypeScript standard library.

**Why this matters:**

- **Removability.** Either module can be extracted from the project and dropped into a completely different runtime (an Express server, a Deno service, a CLI tool) without changing a single import. If the search engine is ever replaced by Elasticsearch, the entire `lib/search-engine/` directory can be deleted and no `app/` file will break beyond the direct import site.
- **Testability.** Because `lib/` modules have no framework coupling, their unit tests run in pure Node.js without mocking Next.js internals. This is why the 58-test suite covers `lib/` thoroughly and executes in milliseconds.
- **Dependency direction.** The dependency arrow always points inward: `app/` depends on `lib/`, never the reverse. The `app/` layer (routes, components, hooks) is the delivery mechanism; `lib/` is the engine. This follows the [Dependency Rule](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) — source code dependencies must point inward, toward higher-level policies.

```
┌─────────────────────────────────────────────────┐
│  lib/  (framework-agnostic core)                │
│                                                 │
│  search-engine/          analytics/             │
│    SearchEngine.ts         AnalyticsStore.ts     │
│    DataProcessor.ts                              │
│    tokenize.ts                                   │
│    normalizeDate.ts                              │
│    singleton.ts                                  │
│    *.test.ts                                     │
└───────────────────────┬─────────────────────────┘
                        │  imports (dependency arrow)
                        ▼
┌─────────────────────────────────────────────────┐
│  app/  (Next.js delivery layer)                 │
│                                                 │
│  page.tsx, layout.tsx                           │
│  api/search/  (route + service + filters/sort)  │
│  api/analytics/  (route)                        │
│  components/  (UI)                              │
│  hooks/  (client-side state)                    │
│  constants/, types/                             │
└─────────────────────────────────────────────────┘
```

### Co-location Principle

Inside `app/`, the project follows the **co-location principle**: *"Things that change together should be located as close as reasonable"* — [Dan Abramov](https://povio.com/blog/maintainability-with-colocation). Instead of grouping files by technical role (all services in one folder, all tests in another), related files are grouped by feature.

For example, the search API route co-locates its handler, service, helper functions, **and their tests** in a single directory:

```
app/api/search/
  route.ts                 # HTTP handler (GET /api/search)
  SearchService.ts         # Orchestration: search → filter → sort → paginate
  applyFilters.ts          # Filter logic
  applyFilters.test.ts     # Tests for filter logic
  applySorting.ts          # Sorting logic
  applySorting.test.ts     # Tests for sorting logic
  applyPagination.ts       # Pagination logic
  applyPagination.test.ts  # Tests for pagination logic
```

**Benefits of this approach:**

- **Discoverability.** When investigating a bug in search filtering, every relevant file is visible without navigating across distant directories. You open one folder and the full picture is there.
- **Safe deletion.** If a feature is removed, its entire directory can be deleted. There is no risk of leaving orphaned utility functions or test files scattered across `utils/`, `services/`, or `__tests__/` folders — a common maintenance trap in projects that separate by technical concern.
- **Reduced cognitive overhead.** Developers working on the search pipeline do not need a mental map of the full project tree. The blast radius of any change is contained within the feature directory.
- **Team scalability.** New team members can onboard on a single feature by focusing on one directory, without navigating the entire codebase.

> **Reference:** For a deeper dive into co-location, see [Maintainability with Colocation (Povio)](https://povio.com/blog/maintainability-with-colocation) and the [Bulletproof React](https://github.com/alan2207/bulletproof-react) project structure.

### Request Flow

```
Browser
  |
  |  URL params (query, page, filters, sort)
  v
Next.js Server Component (app/page.tsx)
  |
  |  calls executeSearch() directly (no HTTP round-trip)
  v
SearchService (app/api/search/SearchService.ts)
  |-- SearchEngine.search(query)     --> inverted index lookup + TF-IDF scoring
  |-- applyFilters(results, ...)     --> credit, restrictions, date range
  |-- applySorting(results, ...)     --> timestamp-based sort
  |-- applyPagination(results, ...)  --> offset pagination
  v
JSON response / rendered HTML

Additionally:
  GET /api/search   --> HTTP endpoint for external consumers (same logic)
  GET /api/analytics --> returns search usage metrics
  /analytics         --> dashboard UI for metrics visualization
```

### Key Modules

| Module | Location | Responsibility |
|---|---|---|
| `SearchEngine` | `lib/search-engine/SearchEngine.ts` | Inverted index construction, TF-IDF search, fuzzy matching, ranking |
| `DataProcessor` | `lib/search-engine/DataProcessor.ts` | Raw-to-processed transformation, restriction extraction |
| `tokenize` | `lib/search-engine/tokenize.ts` | Text normalization, Unicode-aware tokenization |
| `normalizeDate` | `lib/search-engine/normalizeDate.ts` | German date format parsing to ISO/timestamp |
| `singleton` | `lib/search-engine/singleton.ts` | Lazy initialization, single instance across requests |
| `AnalyticsStore` | `lib/analytics/AnalyticsStore.ts` | File-backed search metrics persistence |

---

## Search Strategy and Relevance

### Inverted Index

At startup, every media item is tokenized and added to an in-memory inverted index. The index maps each token to a set of document IDs along with a precomputed field-weight score.

### Scoring: Field-Weighted TF-IDF (Reinterpretation)

The engine uses a reinterpretation of the standard TF-IDF (Term Frequency-Inverse Document Frequency) algorithm. Instead of raw term frequency (counting occurrences), it uses **Field-Weighted TF**.

#### 1. Term Frequency (TF) -> Field Weight
In this implementation, **TF** is represented by a precomputed weight based on which field the token appears in. This ensures that a match in a high-value field (like description) is inherently more important than a match in an identifier.

| Field | Weight (TF) | Rationale |
|---|---|---|
| `suchtext` | 10 | Primary content field; most relevant for keyword searches |
| `fotografen` | 5 | Credit/agency field; important but secondary |
| `bildnummer` | 1 | Identifier; only useful for exact lookups |

#### 2. Inverse Document Frequency (IDF)
**IDF** measures how unique a term is across the entire collection of 10,000 items. Rare terms (e.g., "Zebra") receive a higher multiplier than common terms (e.g., "the").

```
IDF = log(N / df) + 1
```
*   `N`: Total number of documents (10,000).
*   `df`: Document Frequency (number of documents containing the token).
*   `+1`: Smoothing constant to ensure a non-zero multiplier for ubiquitous terms.

#### 3. Final Scoring
The final relevance score for a document is the product of its field-weighted TF and its global IDF:

```
score = fieldWeight * IDF
```

> **Note:** This implementation is a simplified, in-memory version of production-grade scoring algorithms. It follows the same fundamental information retrieval used by [Redis Search (RediSearch)](https://redis.io/docs/latest/develop/ai/search-and-query/advanced-concepts/scoring/)

### Fuzzy Matching (Typo Tolerance)

When a query token has no exact match in the inverted index, the engine falls back to **Levenshtein distance** matching. This allows users to find results even with common typos — for example, `"michel"` successfully matches `"michael"`.

**How it works:**

1. The engine first attempts an exact lookup for each query token.
2. If no exact match is found, it scans all index keys and computes the [Levenshtein edit distance](https://en.wikipedia.org/wiki/Levenshtein_distance) (minimum insertions, deletions, or substitutions to transform one string into another).
3. Matches within distance ≤ 2 are accepted, with a **score penalty** to ensure exact matches always rank higher:

| Edit Distance | Score Penalty | Example |
|---|---|---|
| 0 (exact) | 100% | `"michael"` → `"michael"` |
| 1 | 80% | `"michel"` → `"michael"` |
| 2 | 50% | `"mihcel"` → `"michael"` |

4. A quick length-difference check (`|len(a) - len(b)| > maxDistance`) skips obviously distant keys without computing full Levenshtein.

**Performance:** With ~71 unique vocabulary terms in the current dataset, the fuzzy scan is essentially free — just 71 string comparisons per query token when there is no exact match. Exact matches still take the O(1) fast path via the inverted index.

### Ranking

Results are sorted by two criteria in order:

1. **Matched token count** (descending) -- documents matching more of the query tokens rank higher.
2. **Cumulative TF-IDF score** (descending) -- among documents with equal token coverage, higher-scoring ones rank first.

This two-level ranking ensures that a multi-word query like "Michael Jackson" strongly prefers documents containing both tokens over those containing only one.

### Tokenization

The `tokenize` function performs:

1. **Delimiter normalization.** The `x`-delimited restriction patterns (e.g., `PUBLICATIONxINxGERxSUIxAUTxONLY`) are split by replacing `x` between uppercase letters with spaces: `PUBLICATION IN GER SUI AUT ONLY`.
2. **Case folding.** All text is lowercased.
3. **Unicode-aware word extraction.** A regex (`[\w\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+`) matches words including accented characters, umlauts, and other international scripts.

No stop-word removal is applied. For a dataset of this size, the IDF weighting naturally de-emphasizes very common words. Removing stop words would risk filtering out meaningful terms in metadata that is already terse.

---

## Preprocessing Strategy

### What is preprocessed

| Step | Input | Output | Why |
|---|---|---|---|
| Date normalization | `"01.11.1995"` (DD.MM.YYYY) | ISO string + Unix timestamp | Enables date range filtering and sorting without runtime parsing |
| Restriction extraction | `"...PUBLICATIONxINxGERxSUIxAUTxONLY"` | `["PUBLICATIONxINxGERxSUIxAUTxONLY"]` array | Structured restrictions enable filter-by-restriction without text parsing at query time |
| Bracket extraction | `"[nature] [sunset]"` | Restrictions array, cleaned text | Extracts tagged metadata from freeform text |
| Dimension parsing | `"2460"`, `"3643"` | `width: 3643`, `height: 2460` | Numeric values ready for display or filtering |
| Inverted index | All tokenized fields | `Map<token, Map<docId, score>>` | Constant-time token lookup during search |

### Where it happens

All preprocessing runs once, lazily, on the first request. The `getStorage()` singleton processes all 10,000 items and builds the index. Subsequent requests reuse the cached engine and items map. In Docker, this runs during the first request after container start.

### Data generation

A script (`scripts/generate-data.ts`) generates 10,000 synthetic media items with randomized photographers, subjects, dates, and dimensions. It runs automatically before `npm run dev` and at Docker build time.

### Updating the index for new items

The `SearchEngine.addItem()` method supports incremental indexing. A new item can be:

1. Processed through `DataProcessor.processItem()`.
2. Inserted into the engine via `addItem()`.
3. Added to the `itemsMap` for retrieval.

No full re-index is required. The inverted index structure (nested Maps) supports O(1) insertion per token.

---

## Scaling Approach

### Current performance (10,000 items)

- Index construction: approximately 50-100ms on first request.
- Query latency: millisecond for most queries (measured via analytics).
- Memory footprint: the inverted index and items map fit comfortably in a single Node.js process.

### Scaling to millions of items

The in-memory approach has a ceiling. For millions of items, the following changes would be necessary:

1. **Dedicated search engine.** Replace the custom inverted index with Elasticsearch or Meilisearch. These provide distributed indexing, built-in TF-IDF/BM25 scoring, faceted filtering, and horizontal scaling.

2. **Database-backed storage.** Move item storage from JSON files to PostgreSQL or a similar database. Use the search engine as a secondary index that returns document IDs, then hydrate results from the database.

3. **Ingestion pipeline.** For items arriving once per minute:
   - A message queue (e.g., SQS, RabbitMQ) receives new items.
   - A worker preprocesses metadata and writes to both the database and the search index.
   - The search index is updated incrementally (Elasticsearch supports near-real-time indexing).
   - The API layer reads from the search engine and database, unaware of the ingestion pipeline.

4. **Caching.** Add a response cache (Redis or CDN edge cache) for popular queries. Invalidate on index updates.

5. **Pagination.** Replace offset-based pagination with cursor-based (search_after in Elasticsearch) to avoid deep-page performance degradation.

### Continuous ingestion (once per minute)

The current architecture supports this scenario because:

- `SearchEngine.addItem()` is not blocking and does not require re-indexing.
- The singleton pattern ensures the engine is shared across all requests.
- New items would be immediately searchable after `addItem()` completes.

For a production deployment, the ingestion would be decoupled from the API server:

1. New items arrive via webhook or polling.
2. A background worker preprocesses and indexes them.
3. The search engine instance is updated atomically (write to a staging copy, then swap).
4. The API serves queries from the current index without interruption.

---

## Testing Approach

### Strategy

The project uses **Vitest** as the test runner, chosen for its native TypeScript and ESM support, fast startup, and Vite-compatible module resolution (important for `@/` path aliases).

Testing is focused on the **backend search pipeline**, where correctness is critical and the logic is most complex. The frontend components are Server/Client Components have been left our due time constrains. For a production environment, each UI component should have an unit tests, I would recommend [testing-library](https://testing-library.com/), to test simulating user behaviour ("click button", "type on form").

### Test coverage

| Module | File | Tests | What is tested |
|---|---|---|---|
| `SearchEngine` | `SearchEngine.test.ts` | 22 | Edge cases (empty query, whitespace, no match, empty index, deduplicated tokens), field weight ranking (suchtext > fotografen > bildnummer, multi-field accumulation), IDF scoring (rare vs common terms), multi-token ranking (2/2 > 1/2, 3/3 > 2/3 > 1/3, TF-IDF tiebreaker), case insensitivity, incremental indexing, determinism |
| `levenshteinDistance` | `levenshteinDistance.test.ts` | 7 | Identical strings, empty strings, insertion (michel→michael), substitution (cat→bat), deletion (cats→cat), symmetry, distance > 2 |
| `DataProcessor` | `DataProcessor.test.ts` | 6 | Raw-to-processed transformation, restriction extraction (regex + bracket), date parsing/fallback, missing/malformed fields |
| `tokenize` | `tokenize.test.ts` | 6 | Falsy input, case folding, punctuation stripping, numeric tokens, whitespace normalization, German umlauts |
| `normalizeDate` | `normalizeDate.test.ts` | 5 | DD.MM.YYYY parsing, ISO fallback, empty string, completely invalid input, malformed dot notation |
| `applyFilters` | `applyFilters.test.ts` | 5 | Case-insensitive credit filter, multi-credit, single restriction, multi-restriction AND logic, combined filters |
| `applySorting` | `applySorting.test.ts` | 3 | Latest (descending), oldest (ascending), null/invalid sort passthrough |
| `applyPagination` | `applyPagination.test.ts` | 4 | First page, middle page, partial last page, out-of-bounds |

**Total: 58 tests across 8 files.**

### Running tests

```bash
npm test
```

### What would come next

- **Integration test for `executeSearch`** - a single test calling the full pipeline (search → filter → sort → paginate) with realistic options, verifying end-to-end correctness.
- **API route tests** - using `next/test-utils` or supertest to validate the HTTP layer, including parameter parsing, error responses, and analytics tracking.
- **End-to-end (E2E) tests** - to complete the [testing pyramid](https://martinfowler.com/articles/practical-test-pyramid.html), we would need to review the user navigation are are e2e test that would verify that the most critical parts of the application works on production before deploying to production. To archive this tools such as [playright](https://playwright.dev/) or [cypress](https://www.cypress.io/#create) would do the job.

---

## Assumptions

1. **`bildnummer` as unique ID.** The raw data has no explicit `id` field. `bildnummer` is used as the unique identifier since it represents an image number.
2. **Restrictions follow a pattern.** Restriction tokens like `PUBLICATIONxINxGERxSUIxAUTxONLY` are identified by the regex `/\b[A-Z]+(?:x[A-Z]+)+\b/g` (uppercase words joined by lowercase `x`). Bracketed text like `[nature]` is also extracted as a restriction/tag.
3. **Dates are in German format.** All `datum` values follow `DD.MM.YYYY`. A fallback parser handles other formats gracefully.
4. **Synthetic data is acceptable.** The challenge provides two example items. The data generator creates 10,000 items with realistic structure and randomization for demonstration purposes.
5. **Photographer list is static.** The filter dropdown uses a hardcoded list derived from the data generator. In production, this would come from a `/api/facets` endpoint.
6. **OR semantics for multi-word queries.** A query like "Michael Jackson" returns documents matching either "michael" OR "jackson", ranked by how many tokens match and their TF-IDF scores. This is a reasonable default for an image library where users may not know the exact metadata wording.

---

## Trade-offs

| Decision | Upside | Downside |
|---|---|---|
| In-memory index | Zero external dependencies, simple deployment | Memory-bound, not suitable for millions of items |
| Server Components for search | No client-side waterfall, SEO-friendly, fast TTFB | Full page re-render on filter change (mitigated by streaming) |
| File-based analytics | Persists across server restarts, no database needed | Not suitable for concurrent writes at scale |
| Offset pagination | Simple implementation, familiar UX pattern | Performance degrades on deep pages with very large datasets |
| No stop-word removal | Preserves all searchable terms in terse metadata | Slightly noisier results for common words |
| Levenshtein fuzzy matching | Handles typos gracefully (e.g., "michel" → "michael") | Scans all index keys on miss; acceptable for small vocabularies but would need a BK-tree or similar for large ones |
| Synthetic data | Demonstrates search at scale without real data | Does not capture real-world metadata inconsistencies |
| Field-weighted TF (Set-based) | Simple, predictable scoring; prevents long descriptions from dominating | Ignores intra-field term frequency (e.g., "apple apple" scores same as "apple") |

---

## Limitations and Next Steps

- **No partial/prefix matching.** The search does not support "starts-with" matching (e.g., "Cat" will not match "Category"). A prefix trie or n-gram index could be added for this.
- **No faceted counts.** The filter dropdowns do not show how many results each option yields. A facets API would provide counts for each filter value based on the current query.
- **Static filter options.** Photographer and restriction options are hardcoded. They should be derived dynamically from the dataset via a `/api/facets` endpoint.
- **Single-process analytics.** The file-based `AnalyticsStore` performs synchronous reads/writes on every request, which blocks the event loop. A production system would use buffered writes, async I/O, or an external store (Redis, PostgreSQL).
- **No image thumbnails.** Results display a placeholder with the `bildnummer`. Integration with an image CDN would provide actual thumbnails.
- **No loading skeleton.** Because search is executed in a Server Component, there is no visible loading indicator when filters change. Wrapping results in a `<Suspense>` boundary with a skeleton fallback would improve perceived performance.