import { google } from "googleapis";
import { env, ensureEnv } from "./env";

function getGmailClient() {
  ensureEnv(["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_PRIVATE_KEY", "GMAIL_USER_ID"]);
  const privateKey = env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT(
    env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    privateKey,
    ["https://www.googleapis.com/auth/gmail.modify"],
    env.GMAIL_USER_ID
  );
  return google.gmail({ version: "v1", auth });
}

export async function listUnreadEmails(limit = 5) {
  const gmail = getGmailClient();
  const { data } = await gmail.users.messages.list({
    userId: env.GMAIL_USER_ID!,
    q: "in:inbox is:unread",
    maxResults: limit
  });

  if (!data.messages?.length) return [];

  const messages = await Promise.all(
    data.messages.map(async (message) => {
      const detail = await gmail.users.messages.get({
        userId: env.GMAIL_USER_ID!,
        id: message.id!
      });
      const headers = detail.data.payload?.headers ?? [];
      const subject =
        headers.find((header) => header.name?.toLowerCase() === "subject")
          ?.value ?? "(no subject)";
      const from =
        headers.find((header) => header.name?.toLowerCase() === "from")
          ?.value ?? "Unknown sender";
      const snippet = detail.data.snippet ?? "";
      return {
        id: message.id!,
        subject,
        from,
        snippet,
        internalDate: detail.data.internalDate
          ? new Date(Number(detail.data.internalDate)).toISOString()
          : null
      };
    })
  );

  return messages;
}

export async function sendEmailReply(input: {
  threadId: string;
  subject: string;
  body: string;
  to: string;
}) {
  const gmail = getGmailClient();
  const rawMessage = [
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    "In-Reply-To: " + input.threadId,
    "References: " + input.threadId,
    "",
    input.body
  ].join("\n");

  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: env.GMAIL_USER_ID!,
    requestBody: {
      raw: encodedMessage,
      threadId: input.threadId
    }
  });
}
