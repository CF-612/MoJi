import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { MEMORY_ACTIONS, toolName } from "./actions.js";
const endpoint = process.env.CUIGENGJI_MEMORY_ENDPOINT;
const token = process.env.CUIGENGJI_MEMORY_TOKEN;
if (!endpoint || !token) throw new Error("\u7F3A\u5C11 cuigengji \u5BBF\u4E3B\u8FDE\u63A5\u4FE1\u606F");
const address = new URL(endpoint);
if (address.protocol !== "http:" || address.hostname !== "127.0.0.1") {
  throw new Error("\u8BB0\u5FC6\u670D\u52A1\u5FC5\u987B\u4E3A\u672C\u673A loopback \u5730\u5740");
}
const server = new Server({ name: "cuigengji-memory", version: "0.1.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: MEMORY_ACTIONS.map((action) => ({
    name: toolName(action),
    description: `\u5F53\u524D\u5C0F\u8BF4\u8BB0\u5FC6\u64CD\u4F5C ${action}\u3002\u5C0F\u8BF4\u7531\u4F1A\u8BDD\u7ED1\u5B9A\uFF1B\u4FEE\u6539\u987B\u643A\u5E26\u8BFB\u53D6\u5230\u7684\u7248\u672C\u3002`,
    inputSchema: { type: "object", additionalProperties: true }
  }))
}));
server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
  const action = MEMORY_ACTIONS.find((item) => toolName(item) === request.params.name);
  if (!action) return { isError: true, content: [{ type: "text", text: "\u672A\u77E5\u8BB0\u5FC6\u5DE5\u5177" }] };
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ action, args: request.params.arguments ?? {} }),
      signal: AbortSignal.any([extra.signal, AbortSignal.timeout(3e4)])
    });
    const body = await response.json();
    if (!response.ok) return { isError: true, content: [{ type: "text", text: body.error ?? "\u8BB0\u5FC6\u64CD\u4F5C\u5931\u8D25" }] };
    return { content: [{ type: "text", text: JSON.stringify(body.result ?? null) }] };
  } catch (error) {
    return { isError: true, content: [{ type: "text", text: error.message }] };
  }
});
await server.connect(new StdioServerTransport());
