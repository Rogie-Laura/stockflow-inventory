"use client";

import { Monitor, Shield, Users } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/context/store-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const roleLabels = {
  store_admin: "Store Admin",
  supervisor: "Supervisor",
  cashier: "Cashier / POS Handler",
};

export default function TeamPage() {
  const router = useRouter();
  const { store, role, members, terminals, canManageTeam, loading } = useStore();

  useEffect(() => {
    if (!loading && !canManageTeam) {
      router.replace("/dashboard");
    }
  }, [loading, canManageTeam, router]);

  if (loading || !canManageTeam) {
    return null;
  }

  return (
    <>
      <Header
        title="Store & Team"
        subtitle="Manage POS terminals and team roles"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-indigo-500" />
                {store?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Store admin ang namamahala sa inventory, settings, billing, at
                lahat ng POS terminals. Cashiers ay POS access lang — shared
                inventory, sariling sales log.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="h-5 w-5 text-emerald-500" />
                POS Terminals ({terminals.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {terminals.map((terminal) => (
                <div
                  key={terminal.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{terminal.code}</p>
                    <p className="text-sm text-muted-foreground">{terminal.name}</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-600">
                    Active
                  </Badge>
                </div>
              ))}
              <p className="pt-2 text-xs text-muted-foreground">
                Bawat device sa counter, piliin ang terminal sa POS screen
                (POS-01, POS-02, POS-03).
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-violet-500" />
                Team Members ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {member.fullName || member.email || member.userId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.email ?? "Team member"}
                    </p>
                  </div>
                  <Badge>{roleLabels[member.role]}</Badge>
                </div>
              ))}
              <p className="pt-2 text-xs text-muted-foreground">
                Demo setup: demo1 = store_admin, demo2 = cashier sa same store.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
