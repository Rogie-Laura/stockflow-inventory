"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { useInventory } from "@/context/inventory-context";

export function DemoBanner() {
  const { isDemoMode } = useInventory();

  if (!isDemoMode) return null;

  return (
    <div className="flex items-center justify-center gap-2 border-b border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-700 dark:text-indigo-300">
      <Info className="h-4 w-4 shrink-0" />
      <span>
        Demo mode — data is stored locally.{" "}
        <Link href="/auth/signup" className="font-medium underline">
          Sign up
        </Link>{" "}
        with Supabase to save to the cloud.
      </span>
    </div>
  );
}
