import fs from "node:fs";
import path from "node:path";
import type { Pack } from "./pack-types";

const packsRoot = path.join(process.cwd(), "content", "packs");

const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));

const isPack = (value: unknown): value is Pack => {
  if (!isObject(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.summary === "string" &&
    Array.isArray(value.sources) &&
    Array.isArray(value.cards)
  );
};

export const loadPlayablePacks = (): Pack[] => {
  if (!fs.existsSync(packsRoot)) return [];

  return fs
    .readdirSync(packsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith("_"))
    .map((entry) => path.join(packsRoot, entry.name, "pack.json"))
    .filter((packFile) => fs.existsSync(packFile))
    .flatMap((packFile) => {
      try {
        const parsed = JSON.parse(fs.readFileSync(packFile, "utf8")) as unknown;
        return isPack(parsed) && parsed.status === "playable" ? [parsed] : [];
      } catch {
        return [];
      }
    });
};
