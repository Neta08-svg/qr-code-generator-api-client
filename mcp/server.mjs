#!/usr/bin/env node
// qrforge MCP server — exposes the live https://qr.wrapper-agency.com API as
// MCP tools so agents can call it natively. Thin wrapper over /api/v1.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = process.env.QRFORGE_BASE || "https://qr.wrapper-agency.com";
const server = new McpServer({ name: 'qrforge', version: "1.0.0" });

server.registerTool(
  'generate_qr',
  {
    description: 'Generate a QR code. Returns JSON with svg + dataURL.',
    inputSchema: {
      data: z.string().describe('The content to encode (URL, text, etc.)'),
      type: z.string().optional().describe('Payload type: url, text, wifi, email, phone, sms, vcard, geo'),
      format: z.string().optional().describe('Output: json (default here), svg, or png')
    },
  },
  async (args) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(args)) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    }
    const r = await fetch(`${BASE}/api/v1/qr?${qs.toString()}`);
    return { content: [{ type: "text", text: await r.text() }] };
  }
);

await server.connect(new StdioServerTransport());
