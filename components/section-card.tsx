import { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  status?: "live" | "sample" | "error";
};

export function SectionCard({ title, action, children, status }: Props) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg shadow-slate-950/30">
      <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {status && (
            <span
              className={clsx(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                status === "live" && "bg-emerald-500/20 text-emerald-300",
                status === "sample" && "bg-amber-500/20 text-amber-300",
                status === "error" && "bg-rose-500/20 text-rose-300"
              )}
            >
              {status === "live" ? "live" : status === "sample" ? "sample" : "error"}
            </span>
          )}
        </div>
        {action}
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}
