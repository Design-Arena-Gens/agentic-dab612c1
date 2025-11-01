import { Client } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { env, ensureEnv } from "./env";

let notionClient: Client | undefined;

function getClient() {
  ensureEnv(["NOTION_API_KEY", "NOTION_DATABASE_ID"]);
  if (!notionClient) {
    notionClient = new Client({ auth: env.NOTION_API_KEY });
  }
  return notionClient;
}

const STATUS_PROPERTY = "Status";
const NAME_PROPERTY = "Name";
const DUE_PROPERTY = "Due";

export type NotionTask = {
  id: string;
  title: string;
  status: string;
  due: string | null;
  url: string;
};

function isPageObject(
  entry: PageObjectResponse | { [key: string]: unknown }
): entry is PageObjectResponse {
  return "properties" in entry;
}

export async function fetchNotionTasks(limit = 10): Promise<NotionTask[]> {
  const notion = getClient();
  const response = await notion.databases.query({
    database_id: env.NOTION_DATABASE_ID!,
    sorts: [
      { property: STATUS_PROPERTY, direction: "ascending" },
      { property: DUE_PROPERTY, direction: "ascending" }
    ],
    page_size: limit
  });

  return response.results
    .filter((entry): entry is PageObjectResponse => isPageObject(entry as any))
    .map((page) => ({
      id: page.id,
      title:
        (page.properties?.[NAME_PROPERTY] as any)?.title?.[0]?.plain_text ??
        "Untitled",
      status:
        (page.properties?.[STATUS_PROPERTY] as any)?.status?.name ?? "Unknown",
      due: (page.properties?.[DUE_PROPERTY] as any)?.date?.start ?? null,
      url: page.url
    }));
}

export async function createNotionTask(input: {
  title: string;
  due?: string | null;
  status?: string;
}) {
  const notion = getClient();
  const properties: Record<string, any> = {
    [NAME_PROPERTY]: { title: [{ text: { content: input.title } }] }
  };

  if (input.status) {
    properties[STATUS_PROPERTY] = { status: { name: input.status } };
  }

  if (input.due) {
    properties[DUE_PROPERTY] = { date: { start: input.due } };
  }

  const page = (await notion.pages.create({
    parent: { database_id: env.NOTION_DATABASE_ID! },
    properties
  })) as PageObjectResponse;

  return { id: page.id, url: page.url };
}

export async function updateNotionTaskStatus(input: {
  taskId: string;
  status: string;
}) {
  const notion = getClient();
  await notion.pages.update({
    page_id: input.taskId,
    properties: {
      [STATUS_PROPERTY]: {
        status: { name: input.status }
      }
    }
  });
}
