#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const timeoutExitCode = 124;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const playwrightCli = process.env.BURROW_PLAYWRIGHT_CLI
  ? path.resolve(process.env.BURROW_PLAYWRIGHT_CLI)
  : path.join(repositoryRoot, "node_modules", "@playwright", "test", "cli.js");

const parseMilliseconds = (value, option) => {
  const milliseconds = Number(value);
  if (!Number.isInteger(milliseconds) || milliseconds <= 0) {
    throw new Error(`${option} must be a positive integer, received ${JSON.stringify(value)}.`);
  }
  return milliseconds;
};

const parseRetryCount = (value, option) => {
  const count = Number(value);
  if (!Number.isInteger(count) || count < 0) {
    throw new Error(`${option} must be a non-negative integer, received ${JSON.stringify(value)}.`);
  }
  return count;
};

const readWatchdogOptions = (argumentsList) => {
  const options = {
    idleMs: 150_000,
    maxMs: 600_000,
    graceMs: 5_000,
    retryCount: 0,
    projects: [],
  };
  const playwrightArguments = [];

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    const [name, inlineValue] = argument.split("=", 2);
    if (!name.startsWith("--watchdog-")) {
      playwrightArguments.push(argument);
      continue;
    }

    const value = inlineValue ?? argumentsList[index + 1];
    if (inlineValue === undefined) index += 1;
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`${name} requires a value.`);
    }

    if (name === "--watchdog-idle-ms") options.idleMs = parseMilliseconds(value, name);
    else if (name === "--watchdog-max-ms") options.maxMs = parseMilliseconds(value, name);
    else if (name === "--watchdog-grace-ms") options.graceMs = parseMilliseconds(value, name);
    else if (name === "--watchdog-retries") options.retryCount = parseRetryCount(value, name);
    else if (name === "--watchdog-projects") {
      options.projects = value.split(",").map((project) => project.trim()).filter(Boolean);
      if (options.projects.length === 0) throw new Error(`${name} requires at least one project.`);
    } else {
      throw new Error(`Unknown watchdog option ${name}.`);
    }
  }

  return { options, playwrightArguments };
};

const formatSeconds = (milliseconds) => `${Math.round(milliseconds / 1_000)}s`;

const availablePort = () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.unref();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    if (!address || typeof address === "string") {
      server.close(() => reject(new Error("Could not reserve a local Playwright server port.")));
      return;
    }
    server.close((error) => error ? reject(error) : resolve(address.port));
  });
});

const withSerialWorkers = (argumentsList) => {
  const serialArguments = [];
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--workers") {
      index += 1;
      continue;
    }
    if (argument.startsWith("--workers=")) continue;
    serialArguments.push(argument);
  }
  return [...serialArguments, "--workers=1"];
};

const projectRun = (projectSpec, playwrightArguments) => {
  const shardMatch = projectSpec.match(/^(.+?)@(\d+)\/(\d+)$/);
  if (!shardMatch) {
    return {
      label: `Playwright project ${projectSpec}`,
      argumentsList: [...playwrightArguments, `--project=${projectSpec}`],
    };
  }

  const [, project, currentText, totalText] = shardMatch;
  const current = Number(currentText);
  const total = Number(totalText);
  if (current < 1 || total < 1 || current > total) {
    throw new Error(`Invalid shard in --watchdog-projects: ${projectSpec}.`);
  }
  return {
    label: `Playwright project ${project} shard ${current}/${total}`,
    argumentsList: [...playwrightArguments, `--project=${project}`, `--shard=${current}/${total}`],
  };
};

const killProcessTree = (child, signal) => {
  if (!child.pid) return;

  if (process.platform === "win32") {
    if (signal === "SIGKILL") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else child.kill(signal);
    return;
  }

  try {
    process.kill(-child.pid, signal);
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }
};

const runPlaywright = (argumentsList, label, options, environment = {}) => new Promise((resolve) => {
  const startedAt = Date.now();
  const child = spawn(process.execPath, [playwrightCli, "test", ...argumentsList], {
    cwd: repositoryRoot,
    detached: process.platform !== "win32",
    env: { ...process.env, ...environment },
    stdio: ["inherit", "pipe", "pipe"],
  });

  let settled = false;
  let timeoutReason = null;
  let idleTimer;
  let maxTimer;
  let termTimer;
  let hardKillTimer;
  let forcedFinishTimer;

  const clearTimers = () => {
    clearTimeout(idleTimer);
    clearTimeout(maxTimer);
    clearTimeout(termTimer);
    clearTimeout(hardKillTimer);
    clearTimeout(forcedFinishTimer);
  };

  const finish = (result) => {
    if (settled) return;
    settled = true;
    clearTimers();
    process.off("SIGINT", handleSigint);
    process.off("SIGTERM", handleSigterm);
    resolve(result);
  };

  const terminate = (reason, kind) => {
    if (timeoutReason || settled) return;
    timeoutReason = { message: reason, kind };
    clearTimeout(idleTimer);
    clearTimeout(maxTimer);
    process.stderr.write(`\n[playwright-watchdog] ${reason} Asking Playwright to stop cleanly.\n`);
    killProcessTree(child, "SIGINT");
    termTimer = setTimeout(() => {
      process.stderr.write(`[playwright-watchdog] Playwright did not stop within ${formatSeconds(options.graceMs)}; terminating its process tree.\n`);
      killProcessTree(child, "SIGTERM");
    }, options.graceMs);
    hardKillTimer = setTimeout(() => {
      process.stderr.write(`[playwright-watchdog] Playwright still did not stop; forcing shutdown.\n`);
      killProcessTree(child, "SIGKILL");
    }, options.graceMs * 2);
    forcedFinishTimer = setTimeout(() => finish({ exitCode: timeoutExitCode, timeoutKind: kind }), options.graceMs * 2 + 2_000);
  };

  const resetIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      terminate(`No output from ${label} for ${formatSeconds(options.idleMs)}.`, "idle");
    }, options.idleMs);
  };

  const forwardOutput = (source, destination) => {
    source.on("data", (chunk) => {
      resetIdleTimer();
      destination.write(chunk);
    });
  };

  const handleSigint = () => {
    killProcessTree(child, "SIGINT");
    finish({ exitCode: 130, timeoutKind: null });
  };
  const handleSigterm = () => {
    killProcessTree(child, "SIGTERM");
    finish({ exitCode: 143, timeoutKind: null });
  };

  process.on("SIGINT", handleSigint);
  process.on("SIGTERM", handleSigterm);
  forwardOutput(child.stdout, process.stdout);
  forwardOutput(child.stderr, process.stderr);
  resetIdleTimer();
  maxTimer = setTimeout(() => {
    terminate(`${label} exceeded its ${formatSeconds(options.maxMs)} wall-clock limit.`, "maximum");
  }, options.maxMs);

  child.on("error", (error) => {
    process.stderr.write(`[playwright-watchdog] Could not start ${label}: ${error.message}\n`);
    finish({ exitCode: 1, timeoutKind: null });
  });
  child.on("close", (code, signal) => {
    const duration = formatSeconds(Date.now() - startedAt);
    if (timeoutReason) {
      process.stderr.write(`[playwright-watchdog] Stopped ${label} after ${duration}; exiting ${timeoutExitCode}.\n`);
      finish({ exitCode: timeoutExitCode, timeoutKind: timeoutReason.kind });
      return;
    }
    if (signal) {
      process.stderr.write(`[playwright-watchdog] ${label} exited on signal ${signal} after ${duration}.\n`);
      finish({ exitCode: 1, timeoutKind: null });
      return;
    }
    process.stdout.write(`[playwright-watchdog] ${label} finished in ${duration}.\n`);
    finish({ exitCode: code ?? 1, timeoutKind: null });
  });
});

const main = async () => {
  if (!existsSync(playwrightCli)) {
    throw new Error("The local Playwright CLI is missing. Run npm install before testing.");
  }

  const { options, playwrightArguments } = readWatchdogOptions(process.argv.slice(2));
  const hasExplicitProject = playwrightArguments.some((argument) => argument === "--project" || argument.startsWith("--project="));
  const runs = options.projects.length > 0 && !hasExplicitProject
    ? options.projects.map((project) => projectRun(project, playwrightArguments))
    : [{ label: "Playwright", argumentsList: playwrightArguments }];

  for (const run of runs) {
    let argumentsList = run.argumentsList;
    for (let attempt = 0; attempt <= options.retryCount; attempt += 1) {
      const browserRun = !argumentsList.some((argument) => argument.includes("playwright.logic.config"));
      const environment = browserRun ? { BURROW_PLAYWRIGHT_PORT: String(await availablePort()) } : {};
      const attemptLabel = attempt === 0 ? run.label : `${run.label} retry ${attempt}/${options.retryCount}`;
      process.stdout.write(`[playwright-watchdog] Starting ${attemptLabel} (idle ${formatSeconds(options.idleMs)}, max ${formatSeconds(options.maxMs)}).\n`);
      const result = await runPlaywright(argumentsList, attemptLabel, options, environment);
      if (result.exitCode === 0) break;
      if (result.timeoutKind !== "idle" || attempt === options.retryCount) {
        process.exitCode = result.exitCode;
        return;
      }
      process.stderr.write(`[playwright-watchdog] Retrying ${run.label} once with one worker and a fresh local server.\n`);
      argumentsList = withSerialWorkers(argumentsList);
    }
  }
};

main().catch((error) => {
  process.stderr.write(`[playwright-watchdog] ${error.message}\n`);
  process.exitCode = 1;
});
