"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, RegisterData, AuthContextType } from "@/types";
import { useRouter } from "next/navigation";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as { user: User };
        return data.user;
      })
      .then((sessionUser) => {
        if (active) setUser(sessionUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (
    email: string,
    password: string,
    role: string,
  ): Promise<boolean> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      user?: User;
      code?: string;
    };

    if (data.code === "PENDING_APPROVAL") {
      throw new Error("PENDING_APPROVAL");
    }
    if (!response.ok || !data.user) return false;

    setUser(data.user);
    return true;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = (await response.json().catch(() => ({}))) as {
      user?: User;
    };

    if (response.status === 409) return false;
    if (!response.ok) throw new Error("REGISTRATION_FAILED");
    if (data.user) setUser(data.user);
    return true;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
    router.push("/");
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((currentUser) => currentUser ? { ...currentUser, ...userData } : null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
