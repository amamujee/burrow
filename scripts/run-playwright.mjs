#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const timeoutExitCode = 124;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const playwrightCli = path.join(repositoryRoot, "node_modules", "@playwright", "test", "cli.js");

const parseMilliseconds = (value, option) => {
  const milliseconds = Number(value);
  if (!Number.isInteger(milliseconds) || milliseconds <= 0) {
    throw new Error(`${option} must be a positive integer, received ${JSON.stringify(value)}.`);
  }
  return milliseconds;
};

const readWatchdogOptions = (argumentsList) => {
  const options = {
    idleMs: 150_000,
    maxMs: 600_000,
    graceMs: 5_000,
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

const killProcessTree = (child, signal) => {
  if (!child.pid) return;

  if (process.platform === "win32") {
    if (signal === "SIGTERM") child.kill(signal);
    else spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }

  try {
    process.kill(-child.pid, signal);
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }
};

const runPlaywright = (argumentsList, label, options) => new Promise((resolve) => {
  const startedAt = Date.now();
  const child = spawn(process.execPath, [playwrightCli, "test", ...argumentsList], {
    cwd: repositoryRoot,
    detached: process.platform !== "win32",
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
  });

  let settled = false;
  let timeoutReason = null;
  let idleTimer;
  let maxTimer;
  let hardKillTimer;
  let forcedFinishTimer;

  const clearTimers = () => {
    clearTimeout(idleTimer);
    clearTimeout(maxTimer);
    clearTimeout(hardKillTimer);
    clearTimeout(forcedFinishTimer);
  };

  const finish = (exitCode) => {
    if (settled) return;
    settled = true;
    clearTimers();
    process.off("SIGINT", handleSigint);
    process.off("SIGTERM", handleSigterm);
    resolve(exitCode);
  };

  const terminate = (reason) => {
    if (timeoutReason || settled) return;
    timeoutReason = reason;
    clearTimeout(idleTimer);
    clearTimeout(maxTimer);
    process.stderr.write(`\n[playwright-watchdog] ${reason} Terminating Playwright and its server.\n`);
    killProcessTree(child, "SIGTERM");
    hardKillTimer = setTimeout(() => {
      process.stderr.write(`[playwright-watchdog] Playwright did not stop within ${formatSeconds(options.graceMs)}; forcing shutdown.\n`);
      killProcessTree(child, "SIGKILL");
    }, options.graceMs);
    forcedFinishTimer = setTimeout(() => finish(timeoutExitCode), options.graceMs + 2_000);
  };

  const resetIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      terminate(`No output from ${label} for ${formatSeconds(options.idleMs)}.`);
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
    finish(130);
  };
  const handleSigterm = () => {
    killProcessTree(child, "SIGTERM");
    finish(143);
  };

  process.on("SIGINT", handleSigint);
  process.on("SIGTERM", handleSigterm);
  forwardOutput(child.stdout, process.stdout);
  forwardOutput(child.stderr, process.stderr);
  resetIdleTimer();
  maxTimer = setTimeout(() => {
    terminate(`${label} exceeded its ${formatSeconds(options.maxMs)} wall-clock limit.`);
  }, options.maxMs);

  child.on("error", (error) => {
    process.stderr.write(`[playwright-watchdog] Could not start ${label}: ${error.message}\n`);
    finish(1);
  });
  child.on("close", (code, signal) => {
    const duration = formatSeconds(Date.now() - startedAt);
    if (timeoutReason) {
      process.stderr.write(`[playwright-watchdog] Stopped ${label} after ${duration}; exiting ${timeoutExitCode}.\n`);
      finish(timeoutExitCode);
      return;
    }
    if (signal) {
      process.stderr.write(`[playwright-watchdog] ${label} exited on signal ${signal} after ${duration}.\n`);
      finish(1);
      return;
    }
    process.stdout.write(`[playwright-watchdog] ${label} finished in ${duration}.\n`);
    finish(code ?? 1);
  });
});

const main = async () => {
  if (!existsSync(playwrightCli)) {
    throw new Error("The local Playwright CLI is missing. Run npm install before testing.");
  }

  const { options, playwrightArguments } = readWatchdogOptions(process.argv.slice(2));
  const hasExplicitProject = playwrightArguments.some((argument) => argument === "--project" || argument.startsWith("--project="));
  const runs = options.projects.length > 0 && !hasExplicitProject
    ? options.projects.map((project) => ({ label: `Playwright project ${project}`, argumentsList: [...playwrightArguments, `--project=${project}`] }))
    : [{ label: "Playwright", argumentsList: playwrightArguments }];

  for (const run of runs) {
    process.stdout.write(`[playwright-watchdog] Starting ${run.label} (idle ${formatSeconds(options.idleMs)}, max ${formatSeconds(options.maxMs)}).\n`);
    const exitCode = await runPlaywright(run.argumentsList, run.label, options);
    if (exitCode !== 0) {
      process.exitCode = exitCode;
      return;
    }
  }
};

main().catch((error) => {
  process.stderr.write(`[playwright-watchdog] ${error.message}\n`);
  process.exitCode = 1;
});
