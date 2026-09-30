"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      className="w-full justify-start gap-3"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}
