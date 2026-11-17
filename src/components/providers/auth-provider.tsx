"use client";

import * as React from "react";

import {
  ApiError,
  apiRequest,
  type ApiEnvelope,
} from "@/lib/api-client";
import {
  getSessionServerSnapshot,
  getSessionSnapshot,
  subscribeToSession,
  writeSession,
  type AuthUser,
  type StoredSession,
} from "@/lib/auth-session";

/** Kept re-exported here so consumers can `import { useAuth, type AuthUser }`. */
export type { AuthUser };

type AuthCredentials = {
  email: string;
  password: string;
};

type SignUpInput = AuthCredentials & {
  name: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /** POST /api/auth/login - establishes the session or throws `ApiError`. */
  signIn: (input: AuthCredentials) => Promise<AuthUser>;
  /** POST /api/auth/register - creates the account and signs the user in. */
  signUp: (input: SignUpInput) => Promise<AuthUser>;
  /** Clears the local session immediately (navbar updates instantly). */
  signOut: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

/**
 * Raw user document the backend sends. MongoDB documents use `_id`, so
 * both `_id` and `id` are accepted and normalized into `AuthUser.id`.
 */
type AuthUserPayload = {
  user?: {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    avatarUrl?: string;
  };
  token?: string;
};

type AuthResponse = ApiEnvelope<AuthUserPayload>;

function extractUser(response: AuthResponse): AuthUser {
  const raw = response.user ?? {};
  const id = raw._id ?? raw.id;

  if (!id || !raw.email) {
    throw new ApiError("The server did not return a valid user profile.", 500);
  }

  return {
    id,
    name: raw.name?.trim() || raw.email,
    email: raw.email,
    avatarUrl: raw.avatarUrl,
    role: raw.role === "vendor" || raw.role === "customer" ? raw.role : undefined,
  };
}

function establishSession(response: AuthResponse): AuthUser {
  const user = extractUser(response);

  if (!response.token) {
    throw new ApiError("The server did not return an authentication token.", 500);
  }

  const session: StoredSession = {
    token: response.token,
    user,
  };

  writeSession(session);

  return user;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // The localStorage-backed session is the single source of truth:
  // server snapshot is `null`, so prerendered HTML always renders the
  // signed-out state and switches right after hydration.
  const session = React.useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getSessionServerSnapshot
  );

  const value = React.useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;

    return {
      user,
      token: session?.token ?? null,
      isAuthenticated: user !== null,
      signIn: async ({ email, password }) => {
        const response = await apiRequest<AuthUserPayload>("/api/auth/login", {
          method: "POST",
          body: { email, password },
        });

        return establishSession(response);
      },
      signUp: async ({ name, email, password }) => {
        const response = await apiRequest<AuthUserPayload>("/api/auth/register", {
          method: "POST",
          body: { name, email, password },
        });

        if (response.token) {
          // Backend signs the user in right after registration.
          return establishSession(response);
        }

        // Fallback: register only succeeded, sign the user in explicitly.
        return establishSession(
          await apiRequest<AuthUserPayload>("/api/auth/login", {
            method: "POST",
            body: { email, password },
          })
        );
      },
      signOut: () => {
        writeSession(null);
      },
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }

  return context;
}
