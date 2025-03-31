

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
  const pathname = usePathname(); // ✅ Hook must be at the top

  // List of paths where navbar should not appear
  const hiddenPaths = ["/login", "/signup", "/admin/login"];

  // State for user (ensure it runs only on client-side)
  const [user, setUser] = useState<ExtendedUser | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUser(getCurrentUser()); // ✅ Ensure this runs only on the client

      // Listen for custom login event
      const handleLogin = (event: CustomEvent) => {
        setUser(event.detail);
      };

      window.addEventListener("userLogin", handleLogin as EventListener);

      return () => {
        window.removeEventListener("userLogin", handleLogin as EventListener);
      };
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push("/login");
  };

  // ✅ Move pathname check to ensure hooks are not inside condition
  if (!user || user.isAdmin || hiddenPaths.includes(pathname)) {
    return null;
  }

  return (
    <nav className="bg-brand-light-blue text-white p-4 shadow-sm">
      <div className="container mx-auto flex justify-end items-center">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="font-semibold text-white">{user.username}</span>
            {user.email && <span className="text-xs text-gray-200">{user.email}</span>}
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
