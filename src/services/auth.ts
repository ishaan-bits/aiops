const API_BASE_URL = "/api";

export interface MeResponse {
  user_id: string;
  role: string;
}

export async function login(userId: string, password: string): Promise<MeResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST" });
}

export async function fetchMe(): Promise<MeResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/me`);
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}
