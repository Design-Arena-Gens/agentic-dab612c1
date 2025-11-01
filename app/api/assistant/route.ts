import { NextRequest, NextResponse } from "next/server";
import { runAssistantCommand } from "../../../lib/assistant";
import { getDashboardSnapshot } from "../../../lib/dashboard";

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();
    if (!input) {
      return NextResponse.json(
        { error: "Missing input" },
        { status: 400 }
      );
    }

    const context = await getDashboardSnapshot();
    const { message, actions } = await runAssistantCommand(input, {
      tasks: context.tasks.data,
      events: context.events.data,
      emails: context.emails.data
    });

    return NextResponse.json({
      reply: message,
      actions
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Assistant failed" },
      { status: 500 }
    );
  }
}
