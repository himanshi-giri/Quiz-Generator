"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, logout, User } from "../utils/authUtils";
import { Button } from "./Button";

interface ExtendedUser extends User {
  isAdmin?: boolean;
}

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  // List of paths where navbar should not appear
  const hiddenPaths = ["/login", "/signup", "/admin/login"];

  // Get current user immediately to prevent flickering
  const [user, setUser] = useState<ExtendedUser | null>(() => getCurrentUser());

  useEffect(() => {
    setUser(getCurrentUser());

    const handleLogin = (event: Event) => {
      const customEvent = event as CustomEvent<ExtendedUser>;
      setUser(customEvent.detail);
    };

    window.addEventListener("userLogin", handleLogin);

    return () => {
      window.removeEventListener("userLogin", handleLogin);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push("/login");
  };

  if (!user || user.isAdmin || hiddenPaths.includes(pathname)) {
    return null;
  }

  return (
    <nav className="bg-brand-light-blue text-white p-4 shadow-sm">
      <div className="container mx-auto flex justify-end items-center">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="font-semibold text-white">{user.username}</span>
            {user.email && (
              <span className="text-xs text-gray-200">{user.email}</span>
            )}
          </div>
          <Button intent="primary" size="small" onClick={() => router.push("/report-card")}>
            Report Card
          </Button>
          <Button intent="primary" size="small" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};
