import { POST } from "../api/mcp/[token].js";

const token = process.env.MCP_SECRET_TOKEN!;
let id = 0;
async function rpc(method: string, params: unknown, t = token) {
  const res = await POST(new Request(`http://localhost/api/mcp/${t}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
  }));
  return { status: res.status, body: await res.text() };
}
async function call(name: string, args: object) {
  const r = await rpc("tools/call", { name, arguments: args });
  const j = JSON.parse(r.body);
  return j.result ?? j;
}
const show = (label: string, v: unknown) => console.log(`\n== ${label}\n` + JSON.stringify(v, null, 2).slice(0, 1500));

console.log("bad token ->", (await rpc("tools/list", {}, "wrong")).status);
const list = JSON.parse((await rpc("tools/list", {})).body);
console.log("tools:", list.result.tools.map((t: any) => t.name).join(", "));

const folders = await call("list_folders", {});
show("list_folders", folders);
const msgs = await call("list_messages", { folder: "INBOX", limit: 3 });
show("list_messages", msgs);
const first = JSON.parse(msgs.content[0].text)[0];
if (first) {
  const read = await call("read_message", { folder: "INBOX", uid: first.uid });
  show("read_message", read);
  const subj = (first.subject ?? "").split(" ")[0];
  show("search_messages", await call("search_messages", { folder: "INBOX", subject: subj, limit: 3 }));
  if (process.argv.includes("--draft")) show("create_reply_draft", await call("create_reply_draft", { folder: "INBOX", uid: first.uid, body: "[TEST DRAFT from MCP smoke test - please delete]" }));
}
