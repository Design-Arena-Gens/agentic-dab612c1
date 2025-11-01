import OpenAI from "openai";
import { env, ensureEnv } from "./env";
import { createNotionTask, updateNotionTaskStatus } from "./notion";
import { createCalendarEvent } from "./google";
import { sendEmailReply } from "./gmail";

type ContextData = {
  tasks: any[];
  events: any[];
  emails: any[];
};

type ActionLog = {
  type: string;
  payload: Record<string, unknown>;
  status: "success" | "error";
  response?: Record<string, unknown>;
  error?: string;
};

const openaiClient = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "create_notion_task",
      description: "Create a new task in the Notion task database",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          due: {
            type: "string",
            description: "ISO 8601 datetime string",
            nullable: true
          },
          status: {
            type: "string",
            description: "Status value available in Notion"
          }
        },
        required: ["title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_notion_task_status",
      description: "Update the status of an existing Notion task",
      parameters: {
        type: "object",
        properties: {
          taskId: { type: "string" },
          status: { type: "string" }
        },
        required: ["taskId", "status"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_calendar_event",
      description: "Create a new Google Calendar event",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string" },
          description: { type: "string" },
          start: {
            type: "string",
            description: "ISO 8601 datetime string"
          },
          end: {
            type: "string",
            description: "ISO 8601 datetime string"
          },
          attendees: {
            type: "array",
            items: { type: "string" },
            description: "Attendee email addresses"
          }
        },
        required: ["summary", "start", "end"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "send_email_reply",
      description: "Send an email reply within an existing Gmail thread",
      parameters: {
        type: "object",
        properties: {
          threadId: { type: "string" },
          to: { type: "string" },
          subject: { type: "string" },
          body: { type: "string" }
        },
        required: ["threadId", "to", "subject", "body"]
      }
    }
  }
];

export async function runAssistantCommand(
  input: string,
  context: ContextData
): Promise<{ message: string; actions: ActionLog[] }> {
  if (!openaiClient) {
    return {
      message:
        "AI features are disabled because OPENAI_API_KEY is not configured. You can still manage your workspace manually.",
      actions: []
    };
  }

  ensureEnv(["OPENAI_API_KEY"]);

  const actions: ActionLog[] = [];
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a meticulous executive assistant that manages the user's Notion to-do list, Google Calendar, and Gmail inbox. " +
        "Take decisive actions when confident, using available tools. Always produce a concise summary of what you accomplished and anything pending."
    },
    {
      role: "system",
      content: `Current context:\nTasks: ${JSON.stringify(
        context.tasks,
        null,
        2
      )}\nEvents: ${JSON.stringify(
        context.events,
        null,
        2
      )}\nEmails: ${JSON.stringify(context.emails, null, 2)}`
    },
    { role: "user", content: input }
  ];

  for (let i = 0; i < 4; i += 1) {
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages,
      tools,
      tool_choice: "auto"
    });

    const message = completion.choices[0].message;
    if (message.tool_calls?.length) {
      for (const toolCall of message.tool_calls) {
        const args = toolCall.function.arguments
          ? JSON.parse(toolCall.function.arguments)
          : {};
        try {
          let result: any;
          switch (toolCall.function.name) {
            case "create_notion_task":
              result = await createNotionTask({
                title: args.title,
                due: args.due,
                status: args.status
              });
              break;
      case "update_notion_task_status":
              await updateNotionTaskStatus({
                taskId: args.taskId,
                status: args.status
              });
              result = { ok: true };
              break;
            case "create_calendar_event":
              result = await createCalendarEvent({
                summary: args.summary,
                description: args.description,
                start: args.start,
                end: args.end,
                attendees: args.attendees
              });
              break;
            case "send_email_reply":
              await sendEmailReply({
                threadId: args.threadId,
                to: args.to,
                subject: args.subject,
                body: args.body
              });
              result = { ok: true };
              break;
            default:
              throw new Error(`Unhandled tool ${toolCall.function.name}`);
          }
          const action: ActionLog = {
            type: toolCall.function.name,
            payload: args,
            status: "success",
            response: result
          };
          actions.push(action);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result ?? { ok: true })
          });
        } catch (error: any) {
          const action: ActionLog = {
            type: toolCall.function.name,
            payload: args,
            status: "error",
            error: error.message
          };
          actions.push(action);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: error.message })
          });
        }
      }
      continue;
    }

    const assistantReply = message.content ?? "No response generated.";
    return { message: assistantReply, actions };
  }

  return {
    message: "Reached maximum tool iterations without completion.",
    actions
  };
}
