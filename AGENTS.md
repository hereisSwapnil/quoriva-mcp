# AGENTS.md — Quoriva MCP Server

This file is intended for AI agents and coding assistants (Cursor, Claude, Codex, etc.) that work with this repository. It describes the server's purpose, architecture, available tools, and contribution guidelines.

---

## What Is Quoriva MCP?

Quoriva MCP is a **Model Context Protocol server** that gives AI agents native access to academic paper search across three major databases:

- **Semantic Scholar** — broad coverage, citation graph, author data, AI-powered recommendations
- **PubMed / NCBI** — medical and biological literature
- **arXiv** — preprints across CS, physics, math, and more

Agents can search, fetch, traverse citation graphs, look up authors, and get paper recommendations — all from structured tool calls.

---

## Project Structure

```
quoriva-mcp/
├── src/
│   ├── index.ts                    # Entry point — boots the server via stdio
│   ├── server.ts                   # QuorivaServer class — tool registry + request routing
│   ├── tools/                      # Tool definitions (Zod schemas + inputSchema metadata)
│   │   ├── searchPapers.ts         # quoriva_search_papers
│   │   ├── getPaper.ts             # quoriva_get_paper
│   │   ├── getCitations.ts         # quoriva_get_citations
│   │   ├── getReferences.ts        # quoriva_get_references
│   │   ├── getAuthorPapers.ts      # quoriva_get_author_papers
│   │   └── recommendPapers.ts      # quoriva_recommend_papers
│   ├── services/                   # API client logic, one file per source
│   │   ├── semanticScholar.ts      # Semantic Scholar Graph + Recommendations API
│   │   ├── pubmed.ts               # PubMed eSearch + eFetch + XML parsing
│   │   ├── arxiv.ts                # arXiv Atom feed parsing
│   │   └── parallelSearch.ts       # Orchestrates all 3 APIs + deduplication
│   ├── utils/
│   │   └── formatter.ts            # Shared formatPaper() / formatPaperList() helpers
│   └── types/
│       └── index.ts                # Shared TypeScript interfaces (Paper, Author, etc.)
├── build/                          # Compiled JS (run `npm run build` to generate)
├── package.json
├── tsconfig.json
└── README.md
```

---

## Available Tools

All tools use the `quoriva_` prefix for clear namespacing.

### `quoriva_search_papers`
Search across Semantic Scholar, PubMed, and arXiv simultaneously.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ | Search query text or a direct paper URL |

- Accepts direct URLs from arXiv, PubMed, and Semantic Scholar
- Returns up to 8 results sorted by citation count
- Output header: `[QUORIVA SEARCH]`

---

### `quoriva_get_paper`
Fetch full details of a single paper by Quoriva ID or direct URL.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ | Quoriva ID (`ss_...`, `pm_...`, `ax_...`) or a direct paper URL |

- Accepts IDs from `quoriva_search_papers` results directly
- Accepts URLs: `https://arxiv.org/abs/...`, `https://pubmed.ncbi.nlm.nih.gov/.../`, `https://www.semanticscholar.org/paper/...`
- Output header: `[QUORIVA PAPER DETAILS]`

---

### `quoriva_get_citations`
Find papers that have cited a given paper (forward graph traversal).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | ✅ | — | Quoriva paper ID |
| `limit` | number | ❌ | 10 | Max results (1–50) |

- Powered by Semantic Scholar
- `ax_` and `ss_` prefixed IDs work best; `pm_` IDs are converted to `PMID:xxx` format
- Output header: `[QUORIVA CITATIONS]`

---

### `quoriva_get_references`
Get the papers referenced/cited by a given paper (backward graph traversal).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | ✅ | — | Quoriva paper ID |
| `limit` | number | ❌ | 10 | Max results (1–50) |

- Powered by Semantic Scholar
- Output header: `[QUORIVA REFERENCES]`

---

### `quoriva_get_author_papers`
Look up an author by name and retrieve their papers, sorted by citation count.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `author` | string | ✅ | — | Full author name (e.g. `"Geoffrey Hinton"`) |
| `limit` | number | ❌ | 10 | Max results (1–50) |

- Performs a two-step lookup: author search → paper fetch
- Returns the top matching author's papers sorted by citations
- Output header: `[QUORIVA AUTHOR]`

---

### `quoriva_recommend_papers`
Get AI-powered paper recommendations similar to a given paper.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | ✅ | — | Quoriva paper ID (`ss_` or `ax_` preferred) |
| `limit` | number | ❌ | 10 | Max results (1–50) |

- Powered by Semantic Scholar Recommendations API
- Works best with `ss_` prefixed IDs
- `ax_` IDs are converted to `ArXiv:xxx` format internally
- Output header: `[QUORIVA RECOMMENDATIONS]`

---

## ID Format Reference

All tools that take an `id` parameter accept Quoriva-prefixed IDs from search results:

| Prefix | Source | Example |
|--------|--------|---------|
| `ss_` | Semantic Scholar | `ss_649def34f8be52c8b66281af98e9b6d6bef8b142` |
| `pm_` | PubMed | `pm_31136122` |
| `ax_` | arXiv | `ax_1706.03762` |

The `quorivaIdToSsId()` utility in `services/semanticScholar.ts` converts these to Semantic Scholar API-compatible identifiers (`PMID:xxx`, `ArXiv:xxx`) when needed.

---

## Output Format (All Tools)

Every tool returns a plain-text response with this per-paper structure:

```
**Paper Title** (Year)
   - ID: ax_1706.03762v7
   - Source: Quoriva ARXIV
   - Authors: Author One, Author Two, ...
   - Citations: 1,234
   - Fields: cs.CL, cs.LG
   - Journal: arXiv  (if available)
   - DOI: 10.xxxx/xxx  (if available)
   - URL: https://...
   - Abstract: Full or partial abstract text, or "Abstract not available for this paper."
```

Error responses include `isError: true` and an actionable message pointing to the likely fix.

---

## API Rate Limits

Quoriva uses public, unauthenticated APIs with no API key required:

| API | Rate Limit | Notes |
|-----|-----------|-------|
| Semantic Scholar Graph | ~100 req / 5 min | Most likely to rate-limit under heavy use |
| PubMed eUtils | 3 req/sec (unauthenticated) | Conservative usage |
| arXiv | No hard limit | Polite usage expected |

**If Semantic Scholar returns HTTP 429**, tools will throw with the message:
> `"Semantic Scholar API rate limit reached. Please wait a few seconds and try again."`

---

## Development

```bash
# Install dependencies
npm install

# Build TypeScript → build/
npm run build

# Run server (stdio mode)
npm start

# Test via MCP Inspector
npx @modelcontextprotocol/inspector node build/index.js
```

> ⚠️ **Always run `npm run build` after editing `src/` files.**
> MCP clients (Claude Desktop, Cursor) do NOT hot-reload the server — they must be restarted after a rebuild to pick up changes.

---

## Adding a New Tool

1. Create `src/tools/myTool.ts` with:
   - A `QUORIVA_MY_TOOL_NAME` constant
   - A `QuorivaMyToolSchema` Zod schema
   - A `quorivaMyToolToolDef` object (for `ListToolsRequestSchema`)

2. Add any required API logic to the appropriate file in `src/services/`

3. Import and register in `src/server.ts`:
   - Add to the `tools: [...]` array in `ListToolsRequestSchema` handler
   - Add a `case QUORIVA_MY_TOOL_NAME:` branch in the `switch` dispatcher

4. Run `npm run build` and restart your MCP client

---

## Key Design Decisions

- **`ss_` / `pm_` / `ax_` prefixes** on all paper IDs allow agents to know the source and chain tool calls without ambiguity
- **`ssPaperToModel()`** in `semanticScholar.ts` does NOT filter by abstract length — citations/references APIs often return papers with null abstracts, and filtering them out would break traversal silently
- **Abstract filter** (`minAbstractLength = 50`) is only applied in `searchPubMed` and `searchSemanticScholar` to maintain result quality for broad searches
- **Errors throw, not return `[]`** for citation/reference/recommendation APIs — silent empty arrays were masking rate limits and bad IDs in the original implementation
