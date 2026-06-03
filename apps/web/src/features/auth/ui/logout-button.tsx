"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { sessionModel } from "@/entities/session";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    sessionModel.clearToken();
    router.replace("/login");
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      Выйти
    </Button>
  );
}
