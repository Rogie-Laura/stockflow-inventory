"use client";

import { Monitor } from "lucide-react";
import { useStore } from "@/context/store-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface TerminalPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TerminalPicker({ open, onOpenChange }: TerminalPickerProps) {
  const { store, terminals, selectedTerminal, setSelectedTerminal } = useStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Piliin ang POS Terminal</DialogTitle>
          <DialogDescription>
            {store?.name} — piliin kung aling counter ang gagamitin mo ngayon.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-2">
          {terminals.map((terminal) => {
            const active = selectedTerminal?.id === terminal.id;
            return (
              <Button
                key={terminal.id}
                variant={active ? "default" : "outline"}
                className={cn(
                  "h-auto justify-start gap-3 px-4 py-3",
                  active && "bg-gradient-to-r from-emerald-500 to-teal-600"
                )}
                onClick={() => {
                  setSelectedTerminal(terminal);
                  onOpenChange(false);
                }}
              >
                <Monitor className="h-5 w-5 shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">{terminal.code}</p>
                  <p className="text-xs opacity-80">{terminal.name}</p>
                </div>
                {active && <Badge className="ml-auto bg-white/20">Active</Badge>}
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
