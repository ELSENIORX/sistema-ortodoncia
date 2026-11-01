"use client";

import { useFormStatus } from "react-dom";
import { primaryButtonClass } from "@/components/ui";

export function SubmitButton({
  children,
  pendingLabel = "Guardando…",
  className = primaryButtonClass,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}
