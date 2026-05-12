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
    if (typeof window !== "undefined") {
      // 1. Seed the default accounts if the system is empty
      const registeredUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]",
      );
      if (registeredUsers.length === 0) {
        const defaultAccounts = [
          {
            id: crypto.randomUUID(),
            fullName: "Main Administrator",
            email: "admin@bells.edu.ng",
            password: "admin123",
            role: "main_admin",
            status: "approved",
          },
          {
            id: crypto.randomUUID(),
            fullName: "Lecturer Account",
            email: "lecturer@bells.edu.ng",
            password: "lecturer123",
            role: "lecturer",
            status: "approved",
            rank: "Lecturer I",
            departments: [],
            specializations: [],
            minWorkload: 3,
            maxWorkload: 12,
          },
          {
            id: crypto.randomUUID(),
            fullName: "Student Account",
            email: "student@bells.edu.ng",
            password: "student123",
            role: "student",
            status: "approved",
            matricNumber: "STU001",
            level: 100,
            department: "Computer Science",
          },
        ];
        localStorage.setItem(
          "registeredUsers",
          JSON.stringify(defaultAccounts),
        );

        // Also seed the lecturer account in the lecturers list
        const lecturerAccount = defaultAccounts.find(
          (acc) => acc.role === "lecturer",
        );
        if (lecturerAccount) {
          const lecturers = JSON.parse(
            localStorage.getItem("lecturers") || "[]",
          );
          const newLecturer = {
            id: lecturerAccount.id,
            fullName: lecturerAccount.fullName,
            email: lecturerAccount.email,
            rank: lecturerAccount.rank || "Lecturer I",
            departments: lecturerAccount.departments || [],
            specializations: lecturerAccount.specializations || [],
            expertiseRatings: {},
            preferenceRatings: {},
            availability: {
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
            },
            minWorkload: lecturerAccount.minWorkload || 3,
            maxWorkload: lecturerAccount.maxWorkload || 12,
          };
          lecturers.push(newLecturer);
          localStorage.setItem("lecturers", JSON.stringify(lecturers));
        }
      }

      // 2. Restore active session
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          localStorage.removeItem("currentUser");
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    role: string,
  ): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]",
    );
    const foundUser = registeredUsers.find(
      (u: any) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password &&
        (u.role === role || (role === "admin" && u.role === "main_admin")),
    );

    if (foundUser) {
      // Reject login if they are not approved yet
      if (foundUser.status === "pending") {
        throw new Error("PENDING_APPROVAL");
      }

      const userData: User = {
        id: foundUser.id,
        fullName: foundUser.fullName,
        email: foundUser.email,
        role: foundUser.role,
        status: foundUser.status,
        rank: foundUser.rank,
      };

      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]",
    );

    if (registeredUsers.find((u: any) => u.email === userData.email)) {
      return false; // Email already exists
    }

    // Admins are pending by default. Lecturers are approved immediately.
    const isNewAdmin = userData.role === "admin";
    const newUser = {
      ...userData,
      id: crypto.randomUUID(),
      status: isNewAdmin ? "pending" : "approved",
    };

    localStorage.setItem(
      "registeredUsers",
      JSON.stringify([...registeredUsers, newUser]),
    );

    if (userData.role === "lecturer") {
      const lecturers = JSON.parse(localStorage.getItem("lecturers") || "[]");
      const newLecturer = {
        id: newUser.id,
        fullName: userData.fullName,
        email: userData.email,
        rank: userData.rank || "Lecturer I",
        departments: userData.departments || [],
        specializations: userData.specializations || [],
        expertiseRatings: {},
        preferenceRatings: {},
        availability: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
        },
        minWorkload: userData.minWorkload || 3,
        maxWorkload: userData.maxWorkload || 12,
      };
      localStorage.setItem(
        "lecturers",
        JSON.stringify([...lecturers, newLecturer]),
      );
    }

    // ONLY auto-login if the user is approved (i.e., not a pending admin)
    if (!isNewAdmin) {
      const sessionUser: User = {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role as any,
        status: "approved",
        rank: newUser.rank,
      };
      setUser(sessionUser);
      localStorage.setItem("currentUser", JSON.stringify(sessionUser));
    }

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser: () => {} }}
    >
      {children}
    </AuthContext.Provider>
  );
}
