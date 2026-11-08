# Aizu IMAP MCP Server

Remote MCP server (Streamable HTTP, stateless) that lets Claude web read your university mailbox and save reply **drafts**. It cannot send, delete, or move mail.

Tools: `list_folders`, `list_messages`, `search_messages`, `read_message`, `create_reply_draft`.

## Setup
1. Copy `.env.example` to `.env` and fill in IMAP host/user/password and a long random `MCP_SECRET_TOKEN` (`openssl rand -hex 32`).
2. Push to GitHub, import the repo in Vercel, and add the same variables under Project Settings → Environment Variables.
3. In Claude web: Settings → Connectors → Add custom connector → `https://<project>.vercel.app/api/mcp/<MCP_SECRET_TOKEN>`.

The token in the URL is the only authentication, so treat the URL as a password. A wrong token returns 404.

## Notes
- The IMAP server must be reachable from the public internet (Vercel uses dynamic IPs).
- Reading uses a read-only mailbox, so messages are not marked as read.
- `npm run typecheck` to check types.
