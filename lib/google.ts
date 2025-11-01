import { google } from "googleapis";
import { env, ensureEnv } from "./env";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.modify"
];

function getAuthClient() {
  ensureEnv([
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PRIVATE_KEY"
  ]);

  const privateKey = env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  return new google.auth.JWT(
    env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    privateKey,
    SCOPES,
    env.GMAIL_USER_ID
  );
}

export async function listUpcomingEvents(limit = 5) {
  ensureEnv(["GOOGLE_CALENDAR_ID"]);
  const auth = getAuthClient();
  const calendar = google.calendar({ version: "v3", auth });
  const { data } = await calendar.events.list({
    calendarId: env.GOOGLE_CALENDAR_ID!,
    maxResults: limit,
    singleEvents: true,
    orderBy: "startTime",
    timeMin: new Date().toISOString()
  });

  return (
    data.items?.map((event) => ({
      id: event.id!,
      summary: event.summary ?? "Untitled event",
      start: event.start?.dateTime ?? event.start?.date ?? "",
      end: event.end?.dateTime ?? event.end?.date ?? "",
      hangoutLink: event.hangoutLink ?? null,
      description: event.description ?? null
    })) ?? []
  );
}

export async function createCalendarEvent(input: {
  summary: string;
  description?: string;
  start: string;
  end: string;
  attendees?: string[];
}) {
  ensureEnv(["GOOGLE_CALENDAR_ID"]);
  const auth = getAuthClient();
  const calendar = google.calendar({ version: "v3", auth });

  const { data } = await calendar.events.insert({
    calendarId: env.GOOGLE_CALENDAR_ID!,
    requestBody: {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.start },
      end: { dateTime: input.end },
      attendees: input.attendees?.map((email) => ({ email }))
    },
    sendUpdates: "all"
  });

  return {
    id: data.id!,
    link: data.htmlLink
  };
}
