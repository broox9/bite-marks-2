import { appendFileSync } from "node:fs";

const LOG_PATH = "/Users/brooxm2/projects/bite-marks-2/.cursor/debug-d90c6a.log";

export function agentDebugLog(payload: Record<string, unknown>) {
  try {
    appendFileSync(
      LOG_PATH,
      `${JSON.stringify({ sessionId: "d90c6a", timestamp: Date.now(), ...payload })}\n`,
    );
  } catch {
    // ignore logging failures
  }
}
