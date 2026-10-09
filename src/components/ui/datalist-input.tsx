"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface DatalistOption {
  value: string;
  label?: string;
}

interface DatalistInputProps
  extends Omit<React.ComponentProps<typeof Input>, "list"> {
  options: readonly DatalistOption[] | readonly string[];
  listId: string;
}

function normalizeOptions(
  options: readonly DatalistOption[] | readonly string[],
): DatalistOption[] {
  return options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
}

export function DatalistInput({
  options,
  listId,
  className,
  ...props
}: DatalistInputProps) {
  const items = normalizeOptions(options);

  return (
    <>
      <Input list={listId} className={cn(className)} {...props} />
      <datalist id={listId}>
        {items.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label && opt.label !== opt.value ? opt.label : undefined}
          </option>
        ))}
      </datalist>
    </>
  );
}
