import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

type ContentIssuePayload = {
  id?: unknown;
  createdAt?: unknown;
  profileId?: unknown;
  mode?: unknown;
  topic?: unknown;
  itemId?: unknown;
  questionId?: unknown;
  questionKind?: unknown;
  title?: unknown;
  prompt?: unknown;
  image?: unknown;
};

const issueLogDir = path.join(process.cwd(), ".burrow");
const issueLogPath = path.join(issueLogDir, "content-issues.jsonl");

const cleanText = (value: unknown) => (typeof value === "string" ? value.slice(0, 1200) : undefined);

export async function POST(request: Request) {
  let payload: ContentIssuePayload;

  try {
    payload = (await request.json()) as ContentIssuePayload;
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const issue = {
    id: cleanText(payload.id),
    createdAt: cleanText(payload.createdAt) ?? new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    profileId: cleanText(payload.profileId),
    mode: cleanText(payload.mode),
    topic: cleanText(payload.topic),
    itemId: cleanText(payload.itemId),
    questionId: cleanText(payload.questionId),
    questionKind: cleanText(payload.questionKind),
    title: cleanText(payload.title),
    prompt: cleanText(payload.prompt),
    image: cleanText(payload.image),
  };

  if (!issue.id || !issue.profileId || !issue.itemId || !issue.prompt) {
    return Response.json({ error: "Missing required issue fields" }, { status: 422 });
  }

  await mkdir(issueLogDir, { recursive: true });
  await appendFile(issueLogPath, `${JSON.stringify(issue)}\n`, "utf8");

  return Response.json({ ok: true, path: issueLogPath });
}
