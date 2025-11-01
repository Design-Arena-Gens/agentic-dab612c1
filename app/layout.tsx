import "../styles/globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Agentic Workspace",
  description: "AI personal agent automating Notion, Google Calendar, and Gmail."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        {children}
      </body>
    </html>
  );
}
