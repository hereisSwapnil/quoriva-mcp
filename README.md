# Quoriva MCP Server

[![npm version](https://img.shields.io/npm/v/quoriva-mcp.svg)](https://www.npmjs.com/package/quoriva-mcp)
[![npm downloads](https://img.shields.io/npm/dm/quoriva-mcp.svg)](https://www.npmjs.com/package/quoriva-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Quoriva** — Instantly explore academic knowledge from Cursor, Claude Desktop, and any MCP-compatible AI client.

A blazing-fast MCP server that searches academic papers across **Semantic Scholar**, **PubMed**, and **arXiv** in parallel — built to power AI-native research workflows.

---

## Features

- 🔍 **Parallel Multi-Source Search** — Queries all three databases concurrently and deduplicates results.
- 🔗 **Direct URL Lookup** — Pass a direct paper URL from arXiv, PubMed, or Semantic Scholar to fetch the full record instantly.
- 🧠 **Citation-Ranked Results** — Outputs are sorted by citation count so agents receive the most impactful papers first.
- 🏷️ **Branded Prefixes** — All tools use the `quoriva_` prefix for safe co-existence with other MCP servers.

---

## Architecture

```
src/
├── index.ts                  # Entry point — initializes & connects the server
├── server.ts                 # QuorivaServer class — encapsulates MCP SDK & tool routing
├── tools/
│   └── searchPapers.ts       # Tool definition, Zod schema, and metadata
├── services/
│   ├── semanticScholar.ts    # Semantic Scholar API client
│   ├── pubmed.ts             # PubMed/NCBI API client
│   ├── arxiv.ts              # arXiv API client
│   └── parallelSearch.ts     # Orchestrates multi-source search & deduplication
└── types/
    └── index.ts              # Shared TypeScript interfaces
```

---

## Available Tools

### `quoriva_search_papers`

Search academic papers across Semantic Scholar, PubMed, and arXiv simultaneously.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `string` | ✅ | The search query or direct URL. *E.g.* `"LLM alignment"` or `"https://arxiv.org/abs/2303.08774"` |

**Returns:** Up to 8 top-cited papers including title, authors, year, source, citation count, abstract, and URL.

---

## Setup

### Using npx (recommended — no install needed)

Add directly to your MCP client config and it will download automatically.

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "quoriva": {
      "command": "npx",
      "args": ["-y", "quoriva-mcp"]
    }
  }
}
```

**Cursor** (`.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally):

```json
{
  "mcpServers": {
    "quoriva": {
      "command": "npx",
      "args": ["-y", "quoriva-mcp"]
    }
  }
}
```

Restart your client after editing the config.

### Running from source (for development)

```bash
git clone https://github.com/hereisSwapnil/quoriva-mcp
cd quoriva-mcp
npm install && npm run build
```

Then point your client at the local build:

```json
{
  "mcpServers": {
    "quoriva": {
      "command": "node",
      "args": ["/absolute/path/to/quoriva-mcp/build/index.js"]
    }
  }
}
```

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx quoriva-mcp
```

---

## Development

```bash
# Build TypeScript
npm run build

# Run server directly
npm start
```

---

## Supported Direct URL Formats

| Source | Example URL |
|--------|-------------|
| arXiv | `https://arxiv.org/abs/2303.08774` |
| PubMed | `https://pubmed.ncbi.nlm.nih.gov/39000000/` |
| Semantic Scholar | `https://www.semanticscholar.org/paper/Paper-Title/ABC123` |
