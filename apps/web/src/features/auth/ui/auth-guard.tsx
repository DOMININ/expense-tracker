"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { sessionModel } from "@/entities/session";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!sessionModel.isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
