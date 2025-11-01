"use client";

import useSWR from "swr";
import { SectionCard } from "../components/section-card";
import { TaskList } from "../components/task-list";
import { EventList } from "../components/event-list";
import { EmailList } from "../components/email-list";
import { AssistantPanel } from "../components/assistant-panel";

type DashboardResponse = {
  tasks: {
    data: {
      id: string;
      title: string;
      status: string;
      due: string | null;
      url: string;
    }[];
    source: "live" | "sample" | "error";
    error?: string;
  };
  events: {
    data: {
      id: string;
      summary: string;
      start: string;
      end: string;
      hangoutLink: string | null;
      description: string | null;
    }[];
    source: "live" | "sample" | "error";
    error?: string;
  };
  emails: {
    data: {
      id: string;
      subject: string;
      from: string;
      snippet: string;
      internalDate: string | null;
    }[];
    source: "live" | "sample" | "error";
    error?: string;
  };
};

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export default function HomePage() {
  const { data, error, isLoading, mutate } = useSWR<DashboardResponse>(
    "/api/dashboard",
    fetcher,
    { refreshInterval: 60_000 }
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
      <header className="rounded-2xl border border-slate-800 bg-slate-950/50 p-8 shadow-2xl shadow-indigo-950/30">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-400/80">
              Personal Ops Agent
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white lg:text-4xl">
              Stay ahead. Your assistant is already on it.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-300">
              The agent synchronizes your Notion tasks, Google Calendar events, and Gmail conversations.
              Delegate follow-ups, schedule time blocks, or add new tasks with one message.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-slate-300">
            <button
              onClick={() => mutate()}
              className="self-start rounded-full border border-indigo-500/50 bg-indigo-700/50 px-4 py-2 text-xs uppercase tracking-wide text-indigo-100 hover:bg-indigo-600/60"
            >
              Refresh Data
            </button>
            {isLoading && <p className="text-xs text-slate-400">Loading workspace data…</p>}
            {error && (
              <p className="max-w-xs text-xs text-rose-300">
                {typeof error === "string" ? error : "Failed to load live data. Showing sample data instead."}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <SectionCard title="Top Tasks" status={data?.tasks?.source}>
            <TaskList tasks={data?.tasks?.data ?? []} />
          </SectionCard>
          <SectionCard title="Calendar Radar" status={data?.events?.source}>
            <EventList events={data?.events?.data ?? []} />
          </SectionCard>
          <SectionCard title="Inbox Highlights" status={data?.emails?.source}>
            <EmailList emails={data?.emails?.data ?? []} />
          </SectionCard>
        </div>
        <AssistantPanel />
      </div>
    </main>
  );
}
