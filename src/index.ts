#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { QuorivaServer } from "./server.js";

async function run() {
  console.error("🚀 Quoriva MCP Server initializing...");
  const quoriva = new QuorivaServer();
  const transport = new StdioServerTransport();
  await quoriva.server.connect(transport);
  console.error("✅ Quoriva MCP Server is successfully running and ready to handle stdout/stdin.");
}

run().catch((error) => {
  console.error("❌ Fatal error running Quoriva MCP Server:", error);
  process.exit(1);
});
