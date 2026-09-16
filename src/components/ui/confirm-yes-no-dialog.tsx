"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

type ConfirmYesNoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  onYes: () => void | Promise<void>;
  onNo?: () => void;
  yesLabel?: string;
  noLabel?: string;
  yesDisabled?: boolean;
  loading?: boolean;
  destructive?: boolean;
};

export function ConfirmYesNoDialog({
  open,
  onOpenChange,
  title,
  description,
  onYes,
  onNo,
  yesLabel = "Yes",
  noLabel = "No",
  yesDisabled = false,
  loading = false,
  destructive = false,
}: ConfirmYesNoDialogProps) {
  function handleNo() {
    onNo?.();
    onOpenChange(false);
  }

  async function handleYes() {
    await onYes();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {typeof description === "string" ? (
            <DialogDescription>{description}</DialogDescription>
          ) : description ? (
            <div className="text-sm text-muted-foreground">{description}</div>
          ) : null}
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleNo}
            disabled={loading}
          >
            {noLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            className={
              destructive
                ? undefined
                : "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
            }
            onClick={() => void handleYes()}
            disabled={yesDisabled || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {yesLabel}
              </>
            ) : (
              yesLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
