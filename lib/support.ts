export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";

export type SupportTicketCategory =
  | "general"
  | "account"
  | "payment"
  | "booking"
  | "safety"
  | "technical"
  | "other";

export interface SupportFaqEntry {
  id: string;
  question: string;
  answer: string;
}

export interface CreateSupportTicketPayload {
  subject: string;
  category?: SupportTicketCategory;
  priority?: SupportTicketPriority;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_PUBLIC_URL || "http://localhost:3333";

export class SupportApiError extends Error {
  constructor(
    readonly status: number,
    readonly data?: { message?: string | string[] },
  ) {
    super(`Support API error ${status}`);
  }
}

/** Jeton d'un utilisateur déjà connecté (cookie posé par l'application), sinon null. */
export const getAccessToken = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export async function fetchFaq(signal?: AbortSignal): Promise<SupportFaqEntry[]> {
  const response = await fetch(`${API_BASE_URL}/support/faq`, { signal });
  if (!response.ok) return [];
  const body = (await response.json()) as SupportFaqEntry[] | { data?: SupportFaqEntry[] };
  return Array.isArray(body) ? body : (body.data ?? []);
}

export async function createTicket(payload: CreateSupportTicketPayload): Promise<{ id: string }> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}/support/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => undefined);
  if (!response.ok) throw new SupportApiError(response.status, data);
  return data as { id: string };
}
