"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

interface MobileActionBarProps {
  summaryLabel: string;
  summaryValue: string;
  actionLabel: string;
  href?: string;
  onAction?: () => void;
  disabled?: boolean;
  pending?: boolean;
  pendingLabel?: string;
  form?: string;
  actionType?: "button" | "submit";
}

export function MobileActionBar({
  summaryLabel,
  summaryValue,
  actionLabel,
  href,
  onAction,
  disabled = false,
  pending = false,
  pendingLabel,
  form,
  actionType = "button",
}: MobileActionBarProps) {
  const label = pending && pendingLabel ? pendingLabel : actionLabel;

  return (
    <div
      data-slot="mobile-action-bar"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 shadow-[0_-8px_24px_rgba(74,63,53,0.08)] backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto flex max-w-screen-sm items-center gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{summaryLabel}</p>
          <p className="truncate text-base font-semibold">{summaryValue}</p>
        </div>
        {href ? (
          <Link
            href={href}
            className={buttonVariants({
              size: "lg",
              className: "min-w-[10rem] flex-1 rounded-full",
            })}
          >
            {label}
          </Link>
        ) : (
          <Button
            size="lg"
            type={actionType}
            form={form}
            disabled={disabled}
            onClick={onAction}
            className="min-w-[10rem] flex-1 rounded-full"
          >
            {label}
          </Button>
        )}
      </div>
    </div>
  );
}
