"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchStoreContext } from "@/lib/store-db";
import { canAccessRoute, canManageInventory, canManageTeam } from "@/lib/permissions";
import {
  clearPosLock,
  isPosLocked as readPosLocked,
  setPosLocked,
} from "@/lib/pos-lock";
import {
  applyDemoSessions,
  clearDemoTerminalSession,
  clearPosSession,
  isTerminalInUse,
  loadPosOperator,
  loadPosSessionTerminalId,
  savePosSession,
  setDemoTerminalSession,
} from "@/lib/pos-session";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { PosTerminal, Store, StoreMember, StoreRole } from "@/types/store";
import { toast } from "sonner";

const TERMINAL_STORAGE_KEY = "pinoystock_terminal";
const DEMO_POS_PIN = "1234";

export interface ActivatePosPayload {
  terminalId: string;
  operatorName: string;
  pin: string;
}

interface StoreContextValue {
  store: Store | null;
  role: StoreRole | null;
  terminals: PosTerminal[];
  members: StoreMember[];
  displayName: string;
  accountNumber: string | null;
  posOperatorName: string | null;
  isPosSessionActive: boolean;
  selectedTerminal: PosTerminal | null;
  setSelectedTerminal: (terminal: PosTerminal) => void;
  loading: boolean;
  isDemoMode: boolean;
  isPosLocked: boolean;
  canManageInventory: boolean;
  canManageTeam: boolean;
  verifyPosPin: (pin: string) => Promise<boolean>;
  activatePosSession: (
    payload: ActivatePosPayload
  ) => Promise<{ ok: boolean; error?: string }>;
  deactivatePosLock: (pin: string) => Promise<boolean>;
  setPosPin: (pin: string) => Promise<boolean>;
  updateStoreSettings: (settings: {
    useMarginPricing: boolean;
    posVatEnabled: boolean;
    posVatPercent: number;
  }) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const DEMO_STORE: Store = {
  id: "demo-store",
  name: "PinoyStock Demo Store",
  ownerId: "demo-owner",
  createdAt: new Date().toISOString(),
  hasPosPin: true,
  useMarginPricing: true,
  posVatEnabled: true,
  posVatPercent: 12,
};

const DEMO_TERMINALS: PosTerminal[] = [
  { id: "term-1", storeId: "demo-store", code: "POS-01", name: "Counter 1", isActive: true },
  { id: "term-2", storeId: "demo-store", code: "POS-02", name: "Counter 2", isActive: true },
  { id: "term-3", storeId: "demo-store", code: "POS-03", name: "Counter 3", isActive: true },
];

function loadStoredTerminal(storeId: string, terminals: PosTerminal[]) {
  if (typeof window === "undefined") return terminals[0] ?? null;
  const sessionId = loadPosSessionTerminalId(storeId);
  if (sessionId) {
    const sessionTerminal = terminals.find((t) => t.id === sessionId);
    if (sessionTerminal) return sessionTerminal;
  }
  const savedId = localStorage.getItem(`${TERMINAL_STORAGE_KEY}_${storeId}`);
  return terminals.find((t) => t.id === savedId) ?? null;
}

function restorePosSession(
  storeId: string,
  terminals: PosTerminal[]
): { terminal: PosTerminal | null; operator: string | null } {
  if (!readPosLocked(storeId)) {
    return { terminal: null, operator: null };
  }
  const operator = loadPosOperator(storeId);
  const terminal = loadStoredTerminal(storeId, terminals);
  return { terminal, operator };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isDemoMode = !isSupabaseConfigured();

  const [store, setStore] = useState<Store | null>(isDemoMode ? DEMO_STORE : null);
  const [role, setRole] = useState<StoreRole | null>(isDemoMode ? "store_admin" : null);
  const [terminals, setTerminals] = useState<PosTerminal[]>(
    isDemoMode ? applyDemoSessions(DEMO_TERMINALS) : []
  );
  const [members, setMembers] = useState<StoreMember[]>([]);
  const [displayName, setDisplayName] = useState("Demo Admin");
  const [accountNumber, setAccountNumber] = useState<string | null>(
    isDemoMode ? "K7M3NP2X9A" : null
  );
  const [posOperatorName, setPosOperatorName] = useState<string | null>(null);
  const [selectedTerminal, setSelectedTerminalState] = useState<PosTerminal | null>(null);
  const [loading, setLoading] = useState(!isDemoMode);
  const [posLocked, setPosLockedState] = useState(false);

  const syncPosLock = useCallback((storeId: string | undefined, nextTerminals: PosTerminal[]) => {
    if (!storeId) {
      setPosLockedState(false);
      setPosOperatorName(null);
      return;
    }

    const locked = readPosLocked(storeId);
    setPosLockedState(locked);

    if (locked) {
      const { terminal, operator } = restorePosSession(storeId, nextTerminals);
      if (terminal) setSelectedTerminalState(terminal);
      if (operator) setPosOperatorName(operator);
    }
  }, []);

  const setSelectedTerminal = useCallback(
    (terminal: PosTerminal) => {
      setSelectedTerminalState(terminal);
      if (store) {
        localStorage.setItem(`${TERMINAL_STORAGE_KEY}_${store.id}`, terminal.id);
      }
    },
    [store]
  );

  const verifyPosPin = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!store) return false;

      if (isDemoMode) {
        return pin === DEMO_POS_PIN;
      }

      const supabase = createClient();
      const { data, error } = await supabase.rpc("inv_verify_pos_pin", {
        p_store_id: store.id,
        p_pin: pin,
      });

      return !error && data === true;
    },
    [store, isDemoMode]
  );

  const activatePosSession = useCallback(
    async ({
      terminalId,
      operatorName,
      pin,
    }: ActivatePosPayload): Promise<{ ok: boolean; error?: string }> => {
      if (!store) {
        return { ok: false, error: "Walang store na naka-link." };
      }

      const terminal = terminals.find((t) => t.id === terminalId);
      if (!terminal) {
        return { ok: false, error: "Hindi mahanap ang terminal." };
      }

      if (isTerminalInUse(terminal)) {
        return {
          ok: false,
          error: `${terminal.code} ginagamit pa ni ${terminal.activeOperator}.`,
        };
      }

      if (isDemoMode) {
        if (pin !== DEMO_POS_PIN) {
          return { ok: false, error: "Maling POS PIN." };
        }

        setDemoTerminalSession(terminalId, operatorName);
        const nextTerminals = applyDemoSessions(DEMO_TERMINALS);
        const activeTerminal = nextTerminals.find((t) => t.id === terminalId) ?? terminal;

        setTerminals(nextTerminals);
        setSelectedTerminal(activeTerminal);
        setPosOperatorName(operatorName);
        setPosLocked(store.id);
        setPosLockedState(true);
        savePosSession(store.id, terminalId, operatorName);
        toast.success(`${activeTerminal.code} activated — ${operatorName}`);
        return { ok: true };
      }

      if (!store.hasPosPin) {
        return { ok: false, error: "Mag-set muna ng POS PIN sa Settings." };
      }

      const supabase = createClient();
      const { data, error } = await supabase.rpc("inv_claim_pos_terminal", {
        p_terminal_id: terminalId,
        p_operator_name: operatorName,
        p_pin: pin,
      });

      if (error) {
        if (error.message.includes("Terminal in use")) {
          return { ok: false, error: error.message.replace("Terminal in use by ", "Ginagamit pa ni ") };
        }
        if (error.message.includes("Operator name")) {
          return { ok: false, error: "Ilagay ang pangalan ng gagamit ng POS." };
        }
        return { ok: false, error: error.message };
      }

      if (!data) {
        return { ok: false, error: "Maling POS PIN." };
      }

      const activeTerminal: PosTerminal = {
        ...terminal,
        activeOperator: operatorName,
        activatedAt: new Date().toISOString(),
      };

      setTerminals((prev) =>
        prev.map((t) => (t.id === terminalId ? activeTerminal : t))
      );
      setSelectedTerminal(activeTerminal);
      setPosOperatorName(operatorName);
      setPosLocked(store.id);
      setPosLockedState(true);
      savePosSession(store.id, terminalId, operatorName);
      toast.success(`${activeTerminal.code} activated — ${operatorName}`);
      return { ok: true };
    },
    [store, terminals, isDemoMode, setSelectedTerminal]
  );

  const deactivatePosLock = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!store) return false;

      const ok = await verifyPosPin(pin);
      if (!ok) return false;

      if (selectedTerminal) {
        if (isDemoMode) {
          clearDemoTerminalSession(selectedTerminal.id);
          setTerminals(applyDemoSessions(DEMO_TERMINALS));
        } else {
          const supabase = createClient();
          await supabase.rpc("inv_release_pos_terminal", {
            p_terminal_id: selectedTerminal.id,
            p_pin: pin,
          });
          setTerminals((prev) =>
            prev.map((t) =>
              t.id === selectedTerminal.id
                ? { ...t, activeOperator: null, activatedAt: null }
                : t
            )
          );
        }
      }

      clearPosLock();
      clearPosSession(store.id);
      setPosLockedState(false);
      setPosOperatorName(null);
      setSelectedTerminalState(null);
      toast.success("POS mode na-exit — buong dashboard available na ulit.");
      return true;
    },
    [verifyPosPin, store, selectedTerminal, isDemoMode]
  );

  const updateStoreSettings = useCallback(
    async (settings: {
      useMarginPricing: boolean;
      posVatEnabled: boolean;
      posVatPercent: number;
    }): Promise<boolean> => {
      if (!store) return false;

      if (isDemoMode) {
        setStore((prev) =>
          prev
            ? {
                ...prev,
                useMarginPricing: settings.useMarginPricing,
                posVatEnabled: settings.posVatEnabled,
                posVatPercent: settings.posVatPercent,
              }
            : prev,
        );
        toast.success("Na-save ang store settings (demo).");
        return true;
      }

      const supabase = createClient();
      const { error } = await supabase.rpc("inv_update_store_settings", {
        p_store_id: store.id,
        p_use_margin_pricing: settings.useMarginPricing,
        p_pos_vat_enabled: settings.posVatEnabled,
        p_pos_vat_percent: settings.posVatPercent,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      setStore((prev) =>
        prev
          ? {
              ...prev,
              useMarginPricing: settings.useMarginPricing,
              posVatEnabled: settings.posVatEnabled,
              posVatPercent: settings.posVatPercent,
            }
          : prev,
      );
      toast.success("Na-save ang store settings.");
      return true;
    },
    [store, isDemoMode],
  );

  const setPosPin = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!store || isDemoMode) {
        toast.info(`Demo mode: gamitin ang PIN na ${DEMO_POS_PIN}`);
        return false;
      }

      const supabase = createClient();
      const { error } = await supabase.rpc("inv_set_pos_pin", {
        p_store_id: store.id,
        p_pin: pin,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      setStore((prev) => (prev ? { ...prev, hasPosPin: true } : prev));
      toast.success("POS PIN na-save.");
      return true;
    },
    [store, isDemoMode]
  );

  const refresh = useCallback(async () => {
    if (isDemoMode) {
      const nextTerminals = applyDemoSessions(DEMO_TERMINALS);
      setTerminals(nextTerminals);
      syncPosLock(DEMO_STORE.id, nextTerminals);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStore(null);
        setRole(null);
        return;
      }

      const ctx = await fetchStoreContext(
        supabase,
        user.id,
        user.email,
        user.user_metadata?.full_name as string | undefined
      );

      if (!ctx) {
        toast.error("Walang store na naka-link sa account mo.");
        return;
      }

      setStore(ctx.store);
      setRole(ctx.role);
      setTerminals(ctx.terminals);
      setMembers(ctx.members);
      setDisplayName(ctx.displayName);
      setAccountNumber(ctx.accountNumber);
      syncPosLock(ctx.store.id, ctx.terminals);
    } catch {
      toast.error("Failed to load store context");
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, syncPosLock]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (loading || isDemoMode || !role) return;

    const locked = store ? readPosLocked(store.id) : false;

    if (!canAccessRoute(role, pathname, locked)) {
      toast.info(
        locked
          ? "POS mode active — POS lang ang available sa device na ito."
          : "Cashier access: POS lang ang available."
      );
      router.replace("/dashboard/pos");
    }
  }, [loading, isDemoMode, role, pathname, router, store, posLocked]);

  const isPosSessionActive = Boolean(
    posLocked && selectedTerminal && posOperatorName
  );

  const value = useMemo(
    () => ({
      store,
      role,
      terminals,
      members,
      displayName,
      accountNumber,
      posOperatorName,
      isPosSessionActive,
      selectedTerminal,
      setSelectedTerminal,
      loading,
      isDemoMode,
      isPosLocked: posLocked,
      canManageInventory: canManageInventory(role, posLocked),
      canManageTeam: canManageTeam(role) && !posLocked,
      verifyPosPin,
      activatePosSession,
      deactivatePosLock,
      setPosPin,
      updateStoreSettings,
      refresh,
    }),
    [
      store,
      role,
      terminals,
      members,
      displayName,
      accountNumber,
      posOperatorName,
      isPosSessionActive,
      selectedTerminal,
      setSelectedTerminal,
      loading,
      isDemoMode,
      posLocked,
      verifyPosPin,
      activatePosSession,
      deactivatePosLock,
      setPosPin,
      updateStoreSettings,
      refresh,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}
