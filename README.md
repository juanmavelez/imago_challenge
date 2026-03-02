# IMAGO Search

A search experience for IMAGO's media content library, built with Next.js 16, TypeScript, and Tailwind CSS 4. The application provides keyword search with TF-IDF relevance scoring, metadata filtering, date sorting, pagination, and usage analytics over a dataset of 10,000 generated media items.

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

This automatically generates the synthetic dataset (`data/data.json`) via the `predev` hook, then starts the Next.js development server at `http://localhost:3000`.

### Docker

```bash
docker compose up --build
```

The container generates the dataset at build time, runs the Next.js standalone server, and persists analytics data via a Docker volume.

---

## High-Level Approach

The system is designed around three core principles:

1. **Build-time preprocessing.** Raw media metadata is normalized, structured fields are extracted, and an inverted index is constructed at startup. This moves expensive work out of the request path.
2. **In-memory search engine.** A custom inverted index with TF-IDF scoring provides sub-millisecond query resolution for 10,000 items without external dependencies. 
3. **Server-side rendering with client-side interactivity.** The main search page is a Next.js Server Component that executes the search on the server and streams HTML. Filters and search input are Client Components that update URL parameters, triggering a server re-render. This avoids waterfalls and provides fast initial page loads.

---

## Architecture Overview

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

**Key modules:**

| Module | Location | Responsibility |
|---|---|---|
| `SearchEngine` | `lib/search-engine/SearchEngine.ts` | Inverted index construction, TF-IDF search, ranking |
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

A script (`scripts/generate-data.ts`) generates 10,000 synthetic media items with randomized photographers, subjects, dates, and dimensions. It runs automatically before `npm run dev` via the `predev` hook and at Docker build time.

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
- Query latency: sub-millisecond for most queries (measured via analytics).
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

## Assumptions

1. **`bildnummer` as unique ID.** The raw data has no explicit `id` field. `bildnummer` is used as the unique identifier since it represents an image number.
2. **Restrictions follow a pattern.** Restriction tokens like `PUBLICATIONxINxGERxSUIxAUTxONLY` are identified by the regex `/\b[A-Z]+(?:x[A-Z]+)+\b/g` (uppercase words joined by lowercase `x`). Bracketed text like `[nature]` is also extracted as a restriction/tag.
3. **Dates are in German format.** All `datum` values follow `DD.MM.YYYY`. A fallback parser handles other formats gracefully.
4. **Synthetic data is acceptable.** The challenge provides two example items. The data generator creates 10,000 items with realistic structure and randomization for demonstration purposes.
5. **Photographer list is static.** The filter dropdown uses a hardcoded list derived from the data generator. In production, this would come from a `/api/facets` endpoint.

---

## Trade-offs

| Decision | Upside | Downside |
|---|---|---|
| In-memory index | Zero external dependencies, simple deployment | Memory-bound, not suitable for millions of items |
| Server Components for search | No client-side waterfall, SEO-friendly, fast TTFB | Full page re-render on filter change (mitigated by streaming) |
| File-based analytics | Persists across server restarts, no database needed | Not suitable for concurrent writes at scale |
| Offset pagination | Simple implementation, familiar UX pattern | Performance degrades on deep pages with very large datasets |
| No stop-word removal | Preserves all searchable terms in terse metadata | Slightly noisier results for common words |
| Synthetic data | Demonstrates search at scale without real data | Does not capture real-world metadata inconsistencies |

---

## Limitations and Next Steps

- **No partial or typo-tolerant search.** The search currently only finds exact word matches. Future improvements could include "starts-with" matching (so "Cat" matches "Category") or "fuzzy" matching to handle typos (so "Micael" still matches "Michael").
- **No faceted counts.** The filter dropdowns do not show how many results each option yields. A facets API would provide counts for each filter value based on the current query.
- **Static filter options.** Photographer and restriction options are hardcoded. They should be derived dynamically from the dataset.
- **Single-process analytics.** The file-based `AnalyticsStore` does not handle concurrent writes safely. A production system would use a database or an in-memory store like Redis.
- **No image thumbnails.** Results display a placeholder with the `bildnummer`. Integration with an image CDN would provide actual thumbnails.

