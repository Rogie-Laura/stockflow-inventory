"use client";

import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  return (
    <>
      <Header
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="john@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" defaultValue="Acme Corp" />
              </div>
              <Button
                onClick={() => toast.success("Profile updated successfully")}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  label: "Low stock alerts",
                  description: "Get notified when products run low",
                  default: true,
                },
                {
                  label: "Out of stock alerts",
                  description: "Immediate alerts for out-of-stock items",
                  default: true,
                },
                {
                  label: "Weekly reports",
                  description: "Receive weekly inventory summary via email",
                  default: false,
                },
                {
                  label: "New product notifications",
                  description: "Notify when team members add products",
                  default: true,
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch defaultChecked={item.default} />
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Inventory Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Input id="currency" defaultValue="USD ($)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStock">Default Low Stock Threshold</Label>
                <Input id="lowStock" type="number" defaultValue="20" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Auto-reorder suggestions
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Automatically suggest reorders for low stock items
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
