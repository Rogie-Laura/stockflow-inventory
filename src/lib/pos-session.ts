import type { PosTerminal } from "@/types/store";

const OPERATOR_KEY = "pinoystock_pos_operator";
const SESSION_TERMINAL_KEY = "pinoystock_pos_session_terminal";
const DEMO_SESSIONS_KEY = "pinoystock_demo_terminal_sessions";

const STALE_MS = 8 * 60 * 60 * 1000;

export function isTerminalInUse(terminal: PosTerminal): boolean {
  if (!terminal.activeOperator || !terminal.activatedAt) return false;
  return Date.now() - new Date(terminal.activatedAt).getTime() < STALE_MS;
}

export function savePosSession(storeId: string, terminalId: string, operatorName: string) {
  localStorage.setItem(`${OPERATOR_KEY}_${storeId}`, operatorName);
  localStorage.setItem(`${SESSION_TERMINAL_KEY}_${storeId}`, terminalId);
}

export function loadPosOperator(storeId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${OPERATOR_KEY}_${storeId}`);
}

export function loadPosSessionTerminalId(storeId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${SESSION_TERMINAL_KEY}_${storeId}`);
}

export function clearPosSession(storeId: string) {
  localStorage.removeItem(`${OPERATOR_KEY}_${storeId}`);
  localStorage.removeItem(`${SESSION_TERMINAL_KEY}_${storeId}`);
}

type DemoSessions = Record<string, { operator: string; since: string }>;

export function getDemoTerminalSessions(): DemoSessions {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(DEMO_SESSIONS_KEY) ?? "{}") as DemoSessions;
  } catch {
    return {};
  }
}

export function setDemoTerminalSession(terminalId: string, operator: string) {
  const sessions = getDemoTerminalSessions();
  sessions[terminalId] = { operator, since: new Date().toISOString() };
  localStorage.setItem(DEMO_SESSIONS_KEY, JSON.stringify(sessions));
}

export function clearDemoTerminalSession(terminalId: string) {
  const sessions = getDemoTerminalSessions();
  delete sessions[terminalId];
  localStorage.setItem(DEMO_SESSIONS_KEY, JSON.stringify(sessions));
}

export function applyDemoSessions(terminals: PosTerminal[]): PosTerminal[] {
  const sessions = getDemoTerminalSessions();
  return terminals.map((t) => {
    const session = sessions[t.id];
    if (!session) return t;
    const age = Date.now() - new Date(session.since).getTime();
    if (age >= STALE_MS) return t;
    return {
      ...t,
      activeOperator: session.operator,
      activatedAt: session.since,
    };
  });
}
