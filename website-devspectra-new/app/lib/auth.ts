// Placeholder — auth tanpa logic
export type SessionUser = {
  username: string;
  role: "admin";
};

export function getSession(): SessionUser | null {
  return null;
}

export function clearSession() {}
