"use client";

import { useEffect, useState } from "react";
import { Lock, Percent, Receipt } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/context/store-context";
import { toast } from "sonner";

export default function SettingsPage() {
  const {
    canManageTeam,
    setPosPin,
    store,
    isDemoMode,
    updateStoreSettings,
  } = useStore();
  const [posPin, setPosPinValue] = useState("");
  const [posPinConfirm, setPosPinConfirm] = useState("");
  const [savingPin, setSavingPin] = useState(false);
  const [useMarginPricing, setUseMarginPricing] = useState(true);
  const [posVatEnabled, setPosVatEnabled] = useState(true);
  const [posVatPercent, setPosVatPercent] = useState("12");
  const [savingStoreSettings, setSavingStoreSettings] = useState(false);

  useEffect(() => {
    if (!store) return;
    setUseMarginPricing(store.useMarginPricing);
    setPosVatEnabled(store.posVatEnabled);
    setPosVatPercent(String(store.posVatPercent));
  }, [store]);

  async function handleSavePosPin() {
    if (posPin.length < 4 || posPin.length > 8) {
      toast.error("POS PIN dapat 4-8 characters.");
      return;
    }
    if (posPin !== posPinConfirm) {
      toast.error("Hindi match ang PIN confirmation.");
      return;
    }
    setSavingPin(true);
    await setPosPin(posPin);
    setSavingPin(false);
    setPosPinValue("");
    setPosPinConfirm("");
  }

  async function handleSaveStoreSettings() {
    const vat = parseFloat(posVatPercent);
    if (Number.isNaN(vat) || vat < 0 || vat > 100) {
      toast.error("VAT percent dapat 0–100.");
      return;
    }
    setSavingStoreSettings(true);
    await updateStoreSettings({
      useMarginPricing,
      posVatEnabled,
      posVatPercent: vat,
    });
    setSavingStoreSettings(false);
  }

  return (
    <>
      <Header
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {canManageTeam && (
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  POS Activation PIN
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ito ang password para i-activate ang POS mode sa bawat
                  counter device. Cashiers ay hindi makaka-access ng ibang
                  modules habang naka-lock ang device — kailangan nila (o ikaw)
                  ang PIN na ito para mag-exit.
                </p>
                {isDemoMode && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Demo PIN: <strong>1234</strong>
                  </p>
                )}
                {store?.hasPosPin && !isDemoMode && (
                  <p className="text-xs text-muted-foreground">
                    May naka-set nang POS PIN. Ilagay ang bago para palitan.
                  </p>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="posPin">Bagong POS PIN</Label>
                    <Input
                      id="posPin"
                      type="password"
                      inputMode="numeric"
                      maxLength={8}
                      value={posPin}
                      onChange={(e) => setPosPinValue(e.target.value)}
                      placeholder="4-8 digit PIN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="posPinConfirm">Confirm PIN</Label>
                    <Input
                      id="posPinConfirm"
                      type="password"
                      inputMode="numeric"
                      maxLength={8}
                      value={posPinConfirm}
                      onChange={(e) => setPosPinConfirm(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSavePosPin}
                  disabled={savingPin}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600"
                >
                  Save POS PIN
                </Button>
              </CardContent>
            </Card>
          )}

          {canManageTeam && (
            <Card className="border-indigo-500/20 bg-indigo-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Receipt className="h-4 w-4 text-indigo-600" />
                  Pricing & POS (VAT)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      Kalkulahin ang tubo mula sa %
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ON: cost + margin % ang presyo. OFF: diretso kang mag-input
                      ng presyo (pwede nang kasama ang tubo).
                    </p>
                  </div>
                  <Switch
                    checked={useMarginPricing}
                    onCheckedChange={setUseMarginPricing}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Mag-apply ng VAT sa POS</p>
                    <p className="text-xs text-muted-foreground">
                      I-off kung VAT-inclusive na ang presyo o exempt ang tindahan.
                    </p>
                  </div>
                  <Switch
                    checked={posVatEnabled}
                    onCheckedChange={setPosVatEnabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatPercent" className="flex items-center gap-1">
                    <Percent className="h-3.5 w-3.5" />
                    VAT percent sa POS
                  </Label>
                  <Input
                    id="vatPercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={!posVatEnabled}
                    value={posVatPercent}
                    onChange={(e) => setPosVatPercent(e.target.value)}
                    className="max-w-[140px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Default 12%. Palitan kung magbago ang tax rate sa future.
                  </p>
                </div>
                <Button
                  onClick={handleSaveStoreSettings}
                  disabled={savingStoreSettings}
                  className="bg-gradient-to-r from-indigo-500 to-violet-600"
                >
                  Save pricing & VAT
                </Button>
              </CardContent>
            </Card>
          )}

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
                <Input id="currency" defaultValue="PHP (₱)" />
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
