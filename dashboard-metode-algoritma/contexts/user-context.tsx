"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteCookie, getCookie } from "cookies-next";
import { toast } from "sonner";

type User = {
  id: number;
  username: string;
  telepon: string;
  email: string;
  role?: string;
  avatar?: string;
};

type UserContextType = User | null;
const UserContext = createContext<UserContextType>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const token1 = getCookie("token");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!router) return;
    const userToken = getCookie("token");

    if (!userToken) {
      toast.error("Session expired, please login again", {
        duration: 5000,
        description: "Redirecting to login page...",
        icon: "❌",
        style: {
          background: "#fff",
          color: "#EF4444",
        },
      });
      router.push("/login");
    } else {
      setToken(userToken as string);
    }
  }, [router]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("http://localhost:3000/api/auth/check", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token1}`,
          },
        });

        if (!res.ok) {
          deleteCookie("token");
          toast.dismiss();
          toast.error("Session expired, please login again...", {
            duration: 5000,
            description: "Redirecting to login page...",
            icon: "❌",
            style: {
              background: "#fff",
              color: "#EF4444",
            },
          });
          router.push("/login");
          return;
        }

        const data = await res.json();

        if (data.message === "Unauthorized") {
          deleteCookie("token");
          toast.dismiss();
          toast.error("Session expired, please login again...", {
            duration: 5000,
            description: "Redirecting to login page...",
            icon: "❌",
            style: {
              background: "#fff",
              color: "#EF4444",
            },
          });
          router.push("/login");
          return;
        }
        setUser(data.user[0]);
      } catch (err) {
        // console.error("Error fetching user data:", err);
        toast.dismiss();
        toast.error("Failed to fetch user data", {
          duration: 5000,
          description: "Please try again later.",
          icon: "❌",
          style: {
            background: "#fff",
            color: "#EF4444",
          },
        });
      }
    }
    fetchUser();
  }, [token]);

  if (!isMounted || !token || !user) return null;

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
