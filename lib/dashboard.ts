import { fetchNotionTasks } from "./notion";
import { listUpcomingEvents } from "./google";
import { listUnreadEmails } from "./gmail";

type DashboardSection<T> = {
  data: T[];
  source: "live" | "sample" | "error";
  error?: string;
};

export type DashboardSnapshot = {
  tasks: DashboardSection<Awaited<ReturnType<typeof fetchNotionTasks>>[number]>;
  events: DashboardSection<Awaited<ReturnType<typeof listUpcomingEvents>>[number]>;
  emails: DashboardSection<Awaited<ReturnType<typeof listUnreadEmails>>[number]>;
};

const SAMPLE_TASKS = [
  {
    id: "sample-task-1",
    title: "Draft Q3 OKRs",
    status: "In Progress",
    due: new Date(Date.now() + 86400000).toISOString(),
    url: "#"
  },
  {
    id: "sample-task-2",
    title: "Plan team offsite",
    status: "Not Started",
    due: new Date(Date.now() + 3 * 86400000).toISOString(),
    url: "#"
  }
];

const SAMPLE_EVENTS = [
  {
    id: "sample-event-1",
    summary: "Product sync",
    start: new Date(Date.now() + 2 * 3600000).toISOString(),
    end: new Date(Date.now() + 3 * 3600000).toISOString(),
    hangoutLink: null,
    description: "Align on the latest roadmap assumptions."
  }
];

const SAMPLE_EMAILS = [
  {
    id: "sample-email-1",
    subject: "Follow up: Design review",
    from: "emma@example.com",
    snippet: "Sharing the updated mocks ahead of tomorrow's meeting...",
    internalDate: new Date().toISOString()
  }
];

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [tasks, events, emails] = await Promise.allSettled([
    fetchNotionTasks(),
    listUpcomingEvents(),
    listUnreadEmails()
  ]);

  return {
    tasks:
      tasks.status === "fulfilled"
        ? { data: tasks.value, source: "live" }
        : {
            data: SAMPLE_TASKS,
            source: tasks.reason?.message ? "error" : "sample",
            error: tasks.reason?.message ?? "Using sample tasks"
          },
    events:
      events.status === "fulfilled"
        ? { data: events.value, source: "live" }
        : {
            data: SAMPLE_EVENTS,
            source: events.reason?.message ? "error" : "sample",
            error: events.reason?.message ?? "Using sample events"
          },
    emails:
      emails.status === "fulfilled"
        ? { data: emails.value, source: "live" }
        : {
            data: SAMPLE_EMAILS,
            source: emails.reason?.message ? "error" : "sample",
            error: emails.reason?.message ?? "Using sample emails"
          }
  };
}
