import { ImapFlow } from "imapflow";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

/** Open an IMAP connection, run fn, always log out. */
export async function withClient<T>(fn: (c: ImapFlow) => Promise<T>): Promise<T> {
  const port = Number(process.env.IMAP_PORT ?? 993);
  const client = new ImapFlow({
    host: env("IMAP_HOST"),
    port,
    secure: port === 993,
    auth: { user: env("IMAP_USER"), pass: env("IMAP_PASS") },
    logger: false,
  });
  client.on("error", () => {});
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.logout().catch(() => client.close());
  }
}

/** Resolve the Drafts folder path. */
export async function draftsFolder(c: ImapFlow): Promise<string> {
  if (process.env.DRAFTS_FOLDER) return process.env.DRAFTS_FOLDER;
  const boxes = await c.list();
  return boxes.find((b) => b.specialUse === "\\Drafts")?.path ?? "Drafts";
}
