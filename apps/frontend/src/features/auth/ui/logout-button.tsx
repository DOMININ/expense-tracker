"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/shared/ui/button";
import { sessionModel } from "@/entities/session";

interface LogoutButtonProps {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
}

export function LogoutButton({
  variant = "ghost",
  size = "sm",
  className,
  children = "Выйти",
  ...props
}: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    sessionModel.clearToken();
    router.replace("/login");
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      {...props}
    >
      {children}
    </Button>
  );
}
