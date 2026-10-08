export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("helpdesk_token") || "";
  }

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Something went wrong");
  }

  if (response.status === 204) return null;

  return response.json();
}
