type Email = {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  internalDate: string | null;
};

export function EmailList({ emails }: { emails: Email[] }) {
  if (!emails.length) {
    return <p className="text-sm text-slate-400">Nothing urgent in your inbox.</p>;
  }

  return (
    <ul className="space-y-3">
      {emails.map((email) => (
        <li
          key={email.id}
          className="rounded-lg border border-slate-800 bg-slate-950/40 p-4"
        >
          <p className="text-sm font-semibold text-slate-50">{email.subject}</p>
          <p className="mt-1 text-xs text-slate-300">{email.from}</p>
          <p className="mt-2 text-xs text-slate-400">{email.snippet}</p>
          {email.internalDate && (
            <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-500">
              {new Date(email.internalDate).toLocaleString()}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
