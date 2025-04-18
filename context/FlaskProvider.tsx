// app/context/FlaskProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";

interface FlaskContextType {
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const FlaskContext = createContext<FlaskContextType | undefined>(undefined);

const getToken = () => {
  return localStorage.getItem("token");
};

const setTokenInStorage = (token: string) => {
  localStorage.setItem("token", token);
};

export const FlaskProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authLoading, error: authError } = useUser();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticate = async () => {
      try {
        if (authLoading) return;
        if (authError) {
          throw new Error("Auth0 authentication failed");
        }
        if (!user) {
          console.log("User not authenticated");
          return;
        }
        const email = user.email;
        if (!email) {
          throw new Error("User email not found in Auth0 profile");
        }
        let jwtToken = getToken();
        if (!jwtToken) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });
          if (!response.ok) {
            router.push("/welcome");
            throw new Error("Failed to authenticate with Flask server");
          }
          const data = await response.json();
          jwtToken = data.access_token;
          if (!jwtToken) {
            throw new Error("No JWT token received from Flask server");
          }
          setTokenInStorage(jwtToken);
        }
        setToken(jwtToken);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        if (err instanceof Error && (err.message.includes("Auth0") || err.message.includes("email"))) {
          router.push("/api/auth/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    authenticate();
  }, [user, authLoading, authError, router]);

  return (
    <FlaskContext.Provider value={{ token, isLoading, error }}>
      {children}
    </FlaskContext.Provider>
  );
};

export const useFlask = () => {
  const context = useContext(FlaskContext);
  if (!context) {
    throw new Error("useFlask must be used within a FlaskProvider");
  }
  return context;
};