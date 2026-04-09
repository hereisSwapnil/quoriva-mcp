# Publishing Quoriva MCP to npm

This document covers everything you need to know about publishing and maintaining `quoriva-mcp` on the npm registry — from the first release to ongoing version bumps.

---

## Quick Reference

```bash
# One-liner to bump a patch version and publish
npm version patch && npm publish --access public
```

---

## Prerequisites

- Node.js ≥ 18 installed
- An npm account at [npmjs.com](https://www.npmjs.com)
- Logged in via the CLI (`npm login`)

---

## First-Time Setup

### 1. Login to npm

```bash
npm login
# Follow the browser prompt to authenticate
```

Check you're logged in:

```bash
npm whoami
# Should print your npm username
```

### 2. Check if the package name is free

```bash
npm info quoriva-mcp
# 404 Not Found = name is available ✅
# Returns package info = name is taken ❌
```

### 3. Build & preview what ships

```bash
npm run build
npm pack --dry-run
```

The `files` field in `package.json` is set to `["build"]`, so only compiled JS goes out — **no TypeScript source, no `node_modules`**.

### 4. Publish

```bash
npm publish --access public
```

> `prepublishOnly` automatically runs `npm run build` before every publish, so you always ship a fresh build.

---

## Updating the Package (Version Bumps)

Always follow [Semantic Versioning](https://semver.org/):

| Change type | Command | Example |
|-------------|---------|---------|
| Bug fix, tiny tweak | `npm version patch` | `1.0.0` → `1.0.1` |
| New feature, backward-compatible | `npm version minor` | `1.0.0` → `1.1.0` |
| Breaking change | `npm version major` | `1.0.0` → `2.0.0` |

### Standard release flow

```bash
# 1. Make your changes in src/
# 2. Bump the version (also creates a git commit + tag automatically)
npm version patch   # or minor / major

# 3. Publish
npm publish --access public

# 4. Push the version commit + tag to GitHub
git push && git push --tags
```

### Publish with a pre-release tag (beta/alpha)

```bash
npm version prerelease --preid=beta
# e.g. 1.0.0 → 1.0.1-beta.0

npm publish --access public --tag beta
```

Users can then install the beta explicitly:

```bash
npx quoriva-mcp@beta
```

The `latest` tag on npm is unaffected until you do a normal `npm publish`.

---

## How Users Install & Use It

### npx (zero-install, always latest)

```bash
npx quoriva-mcp
# or pin to a specific version:
npx quoriva-mcp@1.0.1
```

### Claude Desktop (`claude_desktop_config.json`)

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

### Cursor (`.cursor/mcp.json`)

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

### Windsurf / other MCP clients

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

> **Tip for users:** If you want to lock to a specific version (for stability), use `"quoriva-mcp@1.0.1"` in the args instead of just `"quoriva-mcp"`.

---

## What Gets Shipped

The `"files": ["build"]` field in `package.json` ensures only these are included in the tarball:

```
quoriva-mcp-x.x.x.tgz
├── build/
│   ├── index.js              ← entry point + shebang
│   ├── server.js
│   ├── services/
│   │   ├── arxiv.js
│   │   ├── parallelSearch.js
│   │   ├── pubmed.js
│   │   └── semanticScholar.js
│   ├── tools/
│   │   ├── getAuthorPapers.js
│   │   ├── getCitations.js
│   │   ├── getPaper.js
│   │   ├── getReferences.js
│   │   ├── recommendPapers.js
│   │   └── searchPapers.js
│   ├── types/index.js
│   └── utils/formatter.js
├── package.json
├── README.md
└── LICENSE
```

TypeScript source (`src/`) is **not** published — only compiled output.

---

## Deprecating a Version

If a version has a critical bug, deprecate it so users see a warning:

```bash
npm deprecate quoriva-mcp@1.0.0 "Critical bug — please upgrade to 1.0.1"
```

---

## Unpublishing (Emergency Only)

npm allows unpublishing within **72 hours** of a release:

```bash
npm unpublish quoriva-mcp@1.0.0
# or nuke the entire package (within 72h, no dependents):
npm unpublish quoriva-mcp --force
```

> ⚠️ After 72 hours, you cannot unpublish. Use `npm deprecate` instead.

---

## Useful npm Commands

```bash
npm whoami                          # Check logged-in user
npm info quoriva-mcp                # View published package info
npm dist-tag ls quoriva-mcp         # List all dist-tags (latest, beta, etc.)
npm pack --dry-run                  # Preview tarball contents without publishing
npm version --help                  # All versioning options
```

---

## Links

- **npm package:** https://www.npmjs.com/package/quoriva-mcp
- **npm versioning docs:** https://docs.npmjs.com/cli/v10/commands/npm-version
- **Semantic Versioning:** https://semver.org
- **MCP SDK:** https://github.com/modelcontextprotocol/typescript-sdk
