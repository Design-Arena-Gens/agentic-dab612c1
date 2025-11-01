type Event = {
  id: string;
  summary: string;
  start: string;
  end: string;
  hangoutLink: string | null;
  description: string | null;
};

export function EventList({ events }: { events: Event[] }) {
  if (!events.length) {
    return <p className="text-sm text-slate-400">No upcoming events.</p>;
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="rounded-lg border border-slate-800 bg-slate-950/40 p-4"
        >
          <h3 className="text-sm font-semibold text-slate-50">
            {event.summary}
          </h3>
          <p className="mt-1 text-xs text-slate-300">
            {new Date(event.start).toLocaleString()} —{" "}
            {new Date(event.end).toLocaleTimeString()}
          </p>
          {event.description && (
            <p className="mt-2 text-xs text-slate-400">{event.description}</p>
          )}
          {event.hangoutLink && (
            <a
              href={event.hangoutLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-xs text-blue-400"
            >
              Join meeting
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
