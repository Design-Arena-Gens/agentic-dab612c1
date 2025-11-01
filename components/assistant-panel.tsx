import { useState, useTransition } from "react";

type AssistantAction = {
  type: string;
  payload: Record<string, unknown>;
  status: "success" | "error";
  response?: Record<string, unknown>;
  error?: string;
};

type AssistantResponse = {
  reply: string;
  actions: AssistantAction[];
};

export function AssistantPanel() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<AssistantResponse[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    const prompt = input.trim();
    setInput("");
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: prompt })
        });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const data = await response.json();
        setHistory((prev) => [{ reply: data.reply, actions: data.actions }, ...prev]);
      } catch (err: any) {
        setError(err.message ?? "Assistant failed");
      }
    });
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-indigo-800/60 bg-indigo-950/40">
      <header className="border-b border-indigo-900/60 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">AI Command Center</h2>
        <p className="mt-1 text-xs text-indigo-200/80">
          Ask for updates or delegate work across Notion, Calendar, and Gmail.
        </p>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {history.length === 0 && (
          <div className="rounded-lg border border-indigo-900/60 bg-indigo-900/30 p-4 text-sm text-indigo-100/90">
            Try asking: “Summarize what I need to focus on today and schedule time for deep work tomorrow morning.”
          </div>
        )}
        {history.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-indigo-900/70 bg-indigo-900/40 p-4"
          >
            <p className="text-sm text-indigo-100/90">{item.reply}</p>
            {item.actions.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200/80">
                  Actions
                </p>
                <ul className="space-y-2">
                  {item.actions.map((action, idx) => (
                    <li
                      key={idx}
                      className="rounded-md border border-indigo-800/70 bg-indigo-950/50 p-3 text-xs text-indigo-100/90"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{action.type}</span>
                        <span
                          className={
                            action.status === "success"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }
                        >
                          {action.status}
                        </span>
                      </div>
                      <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-[11px] text-indigo-200/80">
                        {JSON.stringify(
                          action.status === "success" ? action.response : action.error,
                          null,
                          2
                        )}
                      </pre>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        {error && (
          <p className="rounded-md border border-rose-500/50 bg-rose-500/10 p-3 text-xs text-rose-200">
            {error}
          </p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="border-t border-indigo-900/60 p-5">
        <div className="flex gap-3">
          <input
            className="flex-1 rounded-md border border-indigo-800/70 bg-indigo-950/60 px-3 py-2 text-sm text-white placeholder:text-indigo-300/50 focus:border-indigo-400 focus:outline-none"
            placeholder="Tell the assistant what to handle..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isPending}
          />
          <button type="submit" disabled={isPending}>
            {isPending ? "Working..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
