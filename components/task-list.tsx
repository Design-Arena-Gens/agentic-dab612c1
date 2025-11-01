type Task = {
  id: string;
  title: string;
  status: string;
  due: string | null;
  url: string;
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) {
    return <p className="text-sm text-slate-400">No tasks found.</p>;
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-start justify-between rounded-lg border border-slate-800 bg-slate-950/40 p-4"
        >
          <div>
            <a
              href={task.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-slate-50"
            >
              {task.title}
            </a>
            <p className="mt-1 text-xs text-slate-400">{task.status}</p>
          </div>
          {task.due && (
            <p className="text-xs text-slate-300">
              Due {new Date(task.due).toLocaleString()}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
