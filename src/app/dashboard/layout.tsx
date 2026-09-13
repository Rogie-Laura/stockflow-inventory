"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DemoBanner } from "@/components/dashboard/demo-banner";
import { InventoryProvider } from "@/context/inventory-context";
import { StoreProvider, useStore } from "@/context/store-context";
import { DashboardUIProvider, useDashboardUI } from "@/context/dashboard-ui-context";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useDashboardUI();
  const { isPosLocked } = useStore();
  const hideSidebar = isPosLocked && pathname.startsWith("/dashboard/pos");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {!hideSidebar && <Sidebar open={sidebarOpen} onClose={closeSidebar} />}
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
