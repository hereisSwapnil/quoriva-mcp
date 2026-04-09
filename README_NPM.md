# Quoriva MCP Server

[![npm version](https://img.shields.io/npm/v/quoriva-mcp.svg)](https://www.npmjs.com/package/quoriva-mcp)

Academic research superpowers for your AI. Search **Semantic Scholar**, **PubMed**, and **arXiv** directly from Cursor, Claude, or any MCP client.

---

## 🚀 Installation

### 1. Claude Desktop
Add this to your `claude_desktop_config.json`:

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

### 2. Cursor / Cline
Add a new MCP server in the settings:
- **Type:** command
- **Command:** `npx -y quoriva-mcp`

---

## 🧠 Example AI Prompts

- "Search for recent papers about quantum computing on Quoriva."
- "What are the most cited papers by Ilya Sutskever?"
- "Find papers similar to https://arxiv.org/abs/2303.08774"
- "Who cited the AlphaFold paper?"

---

## 🛠 Available Tools

| Tool | Purpose |
|------|---------|
| `quoriva_search_papers` | Broad search across all databases |
| `quoriva_get_paper` | Fetch full metadata & abstract |
| `quoriva_get_citations` | Forward citation graph lookup |
| `quoriva_get_references` | Backward citation list |
| `quoriva_get_author_papers` | Author-specific bibliography |
| `quoriva_recommend_papers` | AI-powered discovery |

---

## 📄 Documentation
Full documentation, project structure, and development guides are available on the [GitHub Repository](https://github.com/hereisSwapnil/quoriva-mcp).
