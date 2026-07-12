import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

type PlayEventsPayload = {
  events?: unknown;
  event?: unknown;
};

const playEventLogDir = path.join(process.cwd(), ".burrow");
const playEventLogPath = path.join(playEventLogDir, "play-events.jsonl");
const validActions = new Set(["view", "answer", "skip", "flag", "configure"]);
const maxBatchSize = 50;

const cleanText = (value: unknown, maxLength = 600) => (typeof value === "string" ? value.slice(0, maxLength) : undefined);
const cleanNumber = (value: unknown, max = Number.MAX_SAFE_INTEGER) => (typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : undefined);
const cleanBoolean = (value: unknown) => (typeof value === "boolean" ? value : undefined);

const cleanEvent = (rawEvent: unknown) => {
  if (!rawEvent || typeof rawEvent !== "object") return null;
  const event = rawEvent as Record<string, unknown>;
  const action = cleanText(event.action, 40);
  if (!action || !validActions.has(action)) return null;

  const cleaned = {
    type: "burrow.play_event",
    schemaVersion: cleanNumber(event.schemaVersion, 10) ?? 1,
    id: cleanText(event.id, 120),
    sequence: cleanNumber(event.sequence),
    sessionId: cleanText(event.sessionId, 120),
    createdAt: cleanText(event.createdAt, 80),
    receivedAt: new Date().toISOString(),
    profileHash: cleanText(event.profileHash, 120),
    action,
    mode: cleanText(event.mode, 40),
    challengeMode: cleanText(event.challengeMode, 40),
    topic: cleanText(event.topic, 120),
    itemId: cleanText(event.itemId, 240),
    itemKey: cleanText(event.itemKey, 240),
    itemHash: cleanText(event.itemHash, 80),
    questionKind: cleanText(event.questionKind, 80),
    prompt: cleanText(event.prompt, 1200),
    promptHash: cleanText(event.promptHash, 80),
    title: cleanText(event.title, 240),
    titleHash: cleanText(event.titleHash, 80),
    choice: cleanText(event.choice, 600),
    answer: cleanText(event.answer, 600),
    correct: cleanBoolean(event.correct),
    difficulty: cleanNumber(event.difficulty, 3),
    level: cleanNumber(event.level),
    streak: cleanNumber(event.streak),
    answeredCount: cleanNumber(event.answeredCount),
    correctCount: cleanNumber(event.correctCount),
    accuracy: cleanNumber(event.accuracy, 100),
    roundIndex: cleanNumber(event.roundIndex, 200),
    answerMs: cleanNumber(event.answerMs, 30 * 60 * 1000),
  };

  if (!cleaned.id || !cleaned.sessionId || !cleaned.profileHash || !cleaned.itemKey) return null;
  return cleaned;
};

export async function POST(request: Request) {
  let payload: PlayEventsPayload;

  try {
    payload = (await request.json()) as PlayEventsPayload;
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const rawEvents = Array.isArray(payload.events) ? payload.events : payload.event ? [payload.event] : [];
  const events = rawEvents.slice(0, maxBatchSize).map(cleanEvent).filter((event): event is NonNullable<ReturnType<typeof cleanEvent>> => event !== null);

  if (!events.length) {
    return Response.json({ error: "No valid play events" }, { status: 422 });
  }

  for (const event of events) {
    console.info("burrow.play_event", JSON.stringify(event));
  }

  let persisted = false;
  if (process.env.NODE_ENV !== "production" || process.env.BURROW_PLAY_EVENT_LOG === "1") {
    try {
      await mkdir(playEventLogDir, { recursive: true });
      await appendFile(playEventLogPath, `${events.map((event) => JSON.stringify(event)).join("\n")}\n`, "utf8");
      persisted = true;
    } catch (error) {
      console.warn("Play events could not be written to the local log.", error);
    }
  }

  return Response.json({ ok: true, accepted: events.length, persisted });
}
