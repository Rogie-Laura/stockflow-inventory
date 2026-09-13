"use client";

import { useState } from "react";
import { Lock, Monitor } from "lucide-react";
import type { PosTerminal } from "@/types/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PosActivationDialogProps {
  open: boolean;
  terminal: PosTerminal | null;
  onConfirm: (pin: string) => Promise<boolean>;
  onSkip: () => void;
  onClose: () => void;
}

export function PosActivationDialog({
  open,
  terminal,
  onConfirm,
  onSkip,
  onClose,
}: PosActivationDialogProps) {
  const [step, setStep] = useState<"confirm" | "pin">("confirm");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleOpenChange(next: boolean) {
    if (!next) {
      setStep("confirm");
      setPin("");
      setError("");
      onClose();
    }
  }

  async function handleActivate() {
    setLoading(true);
    setError("");
    const ok = await onConfirm(pin);
    setLoading(false);
    if (ok) {
      setPin("");
      setStep("confirm");
      onClose();
    } else {
      setError("Maling POS PIN. Subukan ulit.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-emerald-500" />
                I-activate ang POS sa device na ito?
              </DialogTitle>
              <DialogDescription>
                {terminal ? (
                  <>
                    <strong>{terminal.code}</strong> · {terminal.name}
                    <br />
                    <br />
                    Kapag na-activate, ang device na ito ay{" "}
                    <strong>POS lang</strong> — hindi ma-access ang Products,
                    Settings, at iba pang modules hanggang mag-enter ng POS PIN
                    ulit para mag-exit.
                  </>
                ) : (
                  "Piliin muna ang terminal."
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={onSkip}>
                Hindi muna (POS lang, bukas pa ang ibang modules)
              </Button>
              <Button
                className="bg-gradient-to-r from-emerald-500 to-teal-600"
                onClick={() => setStep("pin")}
                disabled={!terminal}
              >
                Oo, i-activate
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-500" />
                Ilagay ang POS PIN
              </DialogTitle>
              <DialogDescription>
                Ang PIN na ito ay naka-set ng store admin sa Settings. Cashiers
                ay hindi makaka-exit sa POS mode nang walang PIN na ito.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="pos-pin">POS Activation PIN</Label>
              <Input
                id="pos-pin"
                type="password"
                inputMode="numeric"
                maxLength={8}
                placeholder="4-8 digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleActivate()}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setStep("confirm")}>
                Bumalik
              </Button>
              <Button
                className="bg-gradient-to-r from-emerald-500 to-teal-600"
                onClick={handleActivate}
                disabled={pin.length < 4 || loading}
              >
                {loading ? "Verifying..." : "Activate POS Mode"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
