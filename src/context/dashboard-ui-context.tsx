"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface DashboardUIContextValue {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const DashboardUIContext = createContext<DashboardUIContextValue | null>(null);

export function DashboardUIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <DashboardUIContext.Provider
      value={{ sidebarOpen, openSidebar, closeSidebar }}
    >
      {children}
    </DashboardUIContext.Provider>
  );
}

export function useDashboardUI() {
  const context = useContext(DashboardUIContext);
  if (!context) {
    throw new Error("useDashboardUI must be used within DashboardUIProvider");
  }
  return context;
}
