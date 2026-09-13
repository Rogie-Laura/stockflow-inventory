"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { DemoBanner } from "@/components/dashboard/demo-banner";
import { InventoryProvider } from "@/context/inventory-context";
import { StoreProvider } from "@/context/store-context";
import { DashboardUIProvider, useDashboardUI } from "@/context/dashboard-ui-context";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, closeSidebar } = useDashboardUI();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DemoBanner />
        {children}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <InventoryProvider>
        <DashboardUIProvider>
          <DashboardShell>{children}</DashboardShell>
        </DashboardUIProvider>
      </InventoryProvider>
    </StoreProvider>
  );
}
