import { timingSafeEqual } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerTools } from "../../src/tools.js";

function authorized(req: Request): boolean {
  const expected = process.env.MCP_SECRET_TOKEN;
  if (!expected) return false;
  const given = decodeURIComponent(new URL(req.url).pathname.split("/").filter(Boolean).pop() ?? "");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function handle(req: Request): Promise<Response> {
  if (!authorized(req)) return new Response("Not found", { status: 404 });
  const server = new McpServer({ name: "aizu-imap", version: "0.1.0" });
  registerTools(server);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(req);
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
