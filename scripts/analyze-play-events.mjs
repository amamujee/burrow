import { readFile } from "node:fs/promises";

const inputPath = process.argv[2] ?? ".burrow/play-events.jsonl";
const minViews = Number(process.env.MIN_VIEWS ?? 3);
const minAnswers = Number(process.env.MIN_ANSWERS ?? 3);

const readEvents = async () => {
  let raw;
  try {
    raw = await readFile(inputPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      console.error(`No play event log found at ${inputPath}`);
      process.exitCode = 1;
      return [];
    }
    throw error;
  }

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line, index) => {
      try {
        return [JSON.parse(line)];
      } catch {
        console.warn(`Skipping invalid JSONL line ${index + 1}`);
        return [];
      }
    });
};

const percent = (value) => `${Math.round(value * 100)}%`;
const average = (values) => (values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0);
const short = (value, length = 86) => {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length - 1)}...` : text;
};

const emptyStats = (event) => ({
  itemKey: event.itemKey,
  itemHash: event.itemHash,
  challengeMode: event.challengeMode,
  topic: event.topic,
  questionKind: event.questionKind,
  title: event.title,
  prompt: event.prompt,
  views: 0,
  answers: 0,
  skips: 0,
  flags: 0,
  correct: 0,
  answerMs: [],
  sessions: new Set(),
  profiles: new Set(),
});

const eventSort = (score) => (a, b) => score(b) - score(a);

const printSection = (title, rows, formatter) => {
  console.log(`\n${title}`);
  if (!rows.length) {
    console.log("  Nothing notable yet.");
    return;
  }
  rows.forEach((row, index) => {
    console.log(`  ${index + 1}. ${formatter(row)}`);
  });
};

const events = await readEvents();
if (!events.length) process.exit();

const byItem = new Map();
const viewRepeats = new Map();
const sessions = new Set();
const profiles = new Set();

for (const event of events) {
  if (!event?.itemKey) continue;
  const stats = byItem.get(event.itemKey) ?? emptyStats(event);
  byItem.set(event.itemKey, stats);
  stats.title ||= event.title;
  stats.prompt ||= event.prompt;
  stats.questionKind ||= event.questionKind;
  stats.challengeMode ||= event.challengeMode;
  stats.topic ||= event.topic;
  if (event.sessionId) {
    sessions.add(event.sessionId);
    stats.sessions.add(event.sessionId);
  }
  if (event.profileHash) {
    profiles.add(event.profileHash);
    stats.profiles.add(event.profileHash);
  }

  if (event.action === "view") {
    stats.views += 1;
    const repeatKey = `${event.sessionId ?? "unknown"}:${event.itemKey}`;
    viewRepeats.set(repeatKey, (viewRepeats.get(repeatKey) ?? 0) + 1);
  }
  if (event.action === "answer") {
    stats.answers += 1;
    if (event.correct) stats.correct += 1;
    if (typeof event.answerMs === "number") stats.answerMs.push(event.answerMs);
  }
  if (event.action === "skip") stats.skips += 1;
  if (event.action === "flag") stats.flags += 1;
}

const rows = [...byItem.values()];
const repeatedInSession = [...viewRepeats.entries()]
  .filter(([, count]) => count > 1)
  .map(([key, count]) => {
    const itemKey = key.slice(key.indexOf(":") + 1);
    return { ...byItem.get(itemKey), repeatedViews: count };
  })
  .filter(Boolean)
  .sort(eventSort((row) => row.repeatedViews))
  .slice(0, 10);

console.log(`Play events: ${events.length} events, ${sessions.size} sessions, ${profiles.size} anonymous profiles, ${rows.length} items`);
console.log(`Source: ${inputPath}`);

printSection(
  "Most Viewed Items",
  rows.filter((row) => row.views > 0).sort(eventSort((row) => row.views)).slice(0, 10),
  (row) => `${row.views} views | ${row.challengeMode}/${row.topic} | ${short(row.title || row.prompt)} | ${row.itemKey}`,
);

printSection(
  "Repeated Inside A Session",
  repeatedInSession,
  (row) => `${row.repeatedViews} views in one session | ${row.challengeMode}/${row.topic} | ${short(row.title || row.prompt)} | ${row.itemKey}`,
);

printSection(
  "Highest Skip Rate",
  rows
    .filter((row) => row.views >= minViews && row.skips > 0)
    .sort(eventSort((row) => row.skips / Math.max(1, row.views)))
    .slice(0, 10),
  (row) => `${percent(row.skips / row.views)} skipped (${row.skips}/${row.views}) | ${row.challengeMode}/${row.topic} | ${short(row.prompt || row.title)} | ${row.itemKey}`,
);

printSection(
  "Lowest Accuracy",
  rows
    .filter((row) => row.answers >= minAnswers)
    .sort((a, b) => a.correct / a.answers - b.correct / b.answers)
    .slice(0, 10),
  (row) => `${percent(row.correct / row.answers)} correct (${row.correct}/${row.answers}) | avg ${average(row.answerMs)}ms | ${row.challengeMode}/${row.topic} | ${short(row.prompt || row.title)} | ${row.itemKey}`,
);

printSection(
  "Flagged Items",
  rows.filter((row) => row.flags > 0).sort(eventSort((row) => row.flags)).slice(0, 10),
  (row) => `${row.flags} flags | ${row.challengeMode}/${row.topic} | ${short(row.prompt || row.title)} | ${row.itemKey}`,
);
