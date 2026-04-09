# Quoriva MCP Server

[![npm version](https://img.shields.io/npm/v/quoriva-mcp.svg)](https://www.npmjs.com/package/quoriva-mcp)
[![npm downloads](https://img.shields.io/npm/dm/quoriva-mcp.svg)](https://www.npmjs.com/package/quoriva-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Quoriva** — Instantly explore academic knowledge from Cursor, Claude Desktop, and any MCP-compatible AI client.

A blazing-fast MCP server that searches academic papers across **Semantic Scholar**, **PubMed**, and **arXiv** in parallel — built to power AI-native research workflows.

## Installation

### Via npx (Recommended)

The easiest way to use Quoriva is via `npx`. This ensures you always have the latest version without needing to manage a global installation.

#### 1. Claude Desktop
Add the following to your `claude_desktop_config.json`:

**File Locations:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

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

#### 2. Cursor / Cline
Add a new MCP server in the settings:
- **Type:** `command`
- **Command:** `npx -y quoriva-mcp`

---

## Features

- 🔍 **Parallel Multi-Source Search** — Queries all three databases concurrently and deduplication results.
- 🔗 **Direct URL Lookup** — Pass a direct paper URL from arXiv, PubMed, or Semantic Scholar to fetch the full record instantly.
- 🧠 **Citation-Ranked Results** — Outputs are sorted by citation count so agents receive the most impactful papers first.
- 🌳 **Graph Traversal** — Native tools to fetch citations, references, and related recommendations.
- 👤 **Author Insights** — Retrieve all papers by a specific author sorted by impact.

---

## Example AI Prompts

- "Search for recent papers about LLM reasoning on Quoriva."
- "Find the top 5 most cited papers by Geoffrey Hinton."
- "Get the abstract and citations for https://arxiv.org/abs/1706.03762"
- "Give me 5 papers similar to the one with ID ss_649def34f8..."
- "What papers cited the 'Attention is All You Need' paper?"

---

## Configuration Details

### Multiple MCP Clients
Quoriva works with any client that supports the Model Context Protocol. While `npx` is the standard for local development, you can also install it globally:

```bash
npm install -g quoriva-mcp
```

Then configure your client to use the `quoriva-mcp` command directly.

---

## Available Tools

| Tool                        | Description                         | Key Parameters           |
| --------------------------- | ----------------------------------- | ------------------------ |
| `quoriva_search_papers`     | Search across SS, PubMed, and arXiv | `query` (text or URL)    |
| `quoriva_get_paper`         | Get full details by ID or URL       | `id` (Quoriva ID or URL) |
| `quoriva_get_citations`     | Find papers that cited this paper   | `id`, `limit`            |
| `quoriva_get_references`    | Get the bibliography of a paper     | `id`, `limit`            |
| `quoriva_get_author_papers` | Get all papers by an author         | `author`, `limit`        |
| `quoriva_recommend_papers`  | Get AI-powered similar papers       | `id`, `limit`            |

> 📚 **Note on IDs:** All tools use prefixed IDs: `ss_` (Semantic Scholar), `ax_` (arXiv), or `pm_` (PubMed).

---

## Transport Modes

- **Stdio:** Default mode for local use (IDE extensions, Claude Desktop). Connects via standard input/output.
- **HTTP/SSE:** Supported via the `@modelcontextprotocol/sdk`. While the default entry point uses Stdio, the server logic is transport-agnostic and can be deployed to the cloud.

---

## Development

```bash
# Clone the repository
git clone https://github.com/hereisSwapnil/quoriva-mcp
cd quoriva-mcp

# Install & Build
npm install
npm run build

# Test with MCP Inspector
npx @modelcontextprotocol/inspector build/index.js
```

---

## License
MIT © [hereisSwapnil](https://github.com/hereisSwapnil)
