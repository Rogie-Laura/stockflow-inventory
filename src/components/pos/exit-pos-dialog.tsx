"use client";

import { useState } from "react";
import { LockOpen } from "lucide-react";
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

interface ExitPosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (pin: string) => Promise<boolean>;
}

export function ExitPosDialog({ open, onOpenChange, onConfirm }: ExitPosDialogProps) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleExit() {
    setLoading(true);
    setError("");
    const ok = await onConfirm(pin);
    setLoading(false);
    if (ok) {
      setPin("");
      onOpenChange(false);
    } else {
      setError("Maling POS PIN.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setPin("");
          setError("");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockOpen className="h-5 w-5" />
            Exit POS Mode
          </DialogTitle>
          <DialogDescription>
            Ilagay ang POS PIN para ma-unlock ang buong dashboard sa device na
            ito.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="exit-pin">POS PIN</Label>
          <Input
            id="exit-pin"
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExit()}
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            onClick={handleExit}
            disabled={pin.length < 4 || loading}
          >
            {loading ? "Verifying..." : "Unlock Dashboard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
