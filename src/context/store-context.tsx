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
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { PosTerminal, Store, StoreMember, StoreRole } from "@/types/store";
import { toast } from "sonner";

const TERMINAL_STORAGE_KEY = "pinoystock_terminal";
const DEMO_POS_PIN = "1234";

interface StoreContextValue {
  store: Store | null;
  role: StoreRole | null;
  terminals: PosTerminal[];
  members: StoreMember[];
  displayName: string;
  selectedTerminal: PosTerminal | null;
  setSelectedTerminal: (terminal: PosTerminal) => void;
  loading: boolean;
  isDemoMode: boolean;
  isPosLocked: boolean;
  canManageInventory: boolean;
  canManageTeam: boolean;
  verifyPosPin: (pin: string) => Promise<boolean>;
  activatePosLock: (pin: string) => Promise<boolean>;
  deactivatePosLock: (pin: string) => Promise<boolean>;
  setPosPin: (pin: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const DEMO_STORE: Store = {
  id: "demo-store",
  name: "PinoyStock Demo Store",
  ownerId: "demo-owner",
  createdAt: new Date().toISOString(),
  hasPosPin: true,
};

const DEMO_TERMINALS: PosTerminal[] = [
  { id: "term-1", storeId: "demo-store", code: "POS-01", name: "Counter 1", isActive: true },
  { id: "term-2", storeId: "demo-store", code: "POS-02", name: "Counter 2", isActive: true },
  { id: "term-3", storeId: "demo-store", code: "POS-03", name: "Counter 3", isActive: true },
];

function loadStoredTerminal(storeId: string, terminals: PosTerminal[]) {
  if (typeof window === "undefined") return terminals[0] ?? null;
  const savedId = localStorage.getItem(`${TERMINAL_STORAGE_KEY}_${storeId}`);
  return terminals.find((t) => t.id === savedId) ?? terminals[0] ?? null;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isDemoMode = !isSupabaseConfigured();

  const [store, setStore] = useState<Store | null>(isDemoMode ? DEMO_STORE : null);
  const [role, setRole] = useState<StoreRole | null>(isDemoMode ? "store_admin" : null);
  const [terminals, setTerminals] = useState<PosTerminal[]>(
    isDemoMode ? DEMO_TERMINALS : []
  );
  const [members, setMembers] = useState<StoreMember[]>([]);
  const [displayName, setDisplayName] = useState("Demo Admin");
  const [selectedTerminal, setSelectedTerminalState] = useState<PosTerminal | null>(
    isDemoMode ? DEMO_TERMINALS[0] : null
  );
  const [loading, setLoading] = useState(!isDemoMode);
  const [posLocked, setPosLockedState] = useState(false);

  const syncPosLock = useCallback((storeId: string | undefined) => {
    if (!storeId) {
      setPosLockedState(false);
      return;
    }
    setPosLockedState(readPosLocked(storeId));
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

  const activatePosLock = useCallback(
    async (pin: string): Promise<boolean> => {
      const ok = await verifyPosPin(pin);
      if (ok && store) {
        setPosLocked(store.id);
        setPosLockedState(true);
        toast.success("POS mode activated — POS lang ang access sa device na ito.");
      }
      return ok;
    },
    [verifyPosPin, store]
  );

  const deactivatePosLock = useCallback(
    async (pin: string): Promise<boolean> => {
      const ok = await verifyPosPin(pin);
      if (ok) {
        clearPosLock();
        setPosLockedState(false);
        toast.success("POS mode na-exit — buong dashboard available na ulit.");
      }
      return ok;
    },
    [verifyPosPin]
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
      syncPosLock(DEMO_STORE.id);
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
      setSelectedTerminalState(loadStoredTerminal(ctx.store.id, ctx.terminals));
      syncPosLock(ctx.store.id);
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

  const value = useMemo(
    () => ({
      store,
      role,
      terminals,
      members,
      displayName,
      selectedTerminal,
      setSelectedTerminal,
      loading,
      isDemoMode,
      isPosLocked: posLocked,
      canManageInventory: canManageInventory(role, posLocked),
      canManageTeam: canManageTeam(role) && !posLocked,
      verifyPosPin,
      activatePosLock,
      deactivatePosLock,
      setPosPin,
      refresh,
    }),
    [
      store,
      role,
      terminals,
      members,
      displayName,
      selectedTerminal,
      setSelectedTerminal,
      loading,
      isDemoMode,
      posLocked,
      verifyPosPin,
      activatePosLock,
      deactivatePosLock,
      setPosPin,
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
