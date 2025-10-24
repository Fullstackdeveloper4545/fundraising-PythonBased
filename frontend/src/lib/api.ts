export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export async function apiFetch<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
    cache?: RequestCache;
  } = {}
): Promise<T> {
  const { method = "GET", body, token, headers = {}, cache } = options;
  const url = `${API_BASE_URL}${path}`;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  // @ts-expect-error allow non-json responses
  return undefined as T;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: { id: number; email: string; first_name: string; last_name: string; role: string };
}

export const AuthAPI = {
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    referral_code?: string;
  }) => apiFetch<{ id: number; email: string }>(`/auth/register`, { method: "POST", body: data }),
  login: (data: { email: string; password: string }) =>
    apiFetch<LoginResponse>(`/auth/login`, { method: "POST", body: data }),
  me: (token: string) => apiFetch(`/auth/me`, { token }),
};

export const CampaignAPI = {
  list: (params?: { status?: string; featured?: boolean; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.featured !== undefined) query.set("featured", String(params.featured));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return apiFetch(`/campaigns${qs ? `?${qs}` : ""}`);
  },
  featured: (limit?: number) => {
    const query = new URLSearchParams();
    if (limit) query.set("limit", String(limit));
    const qs = query.toString();
    return apiFetch(`/campaigns/featured${qs ? `?${qs}` : ""}`);
  },
  spotlight: (limit?: number) => {
    const query = new URLSearchParams();
    if (limit) query.set("limit", String(limit));
    const qs = query.toString();
    return apiFetch(`/campaigns/spotlight${qs ? `?${qs}` : ""}`);
  },
  get: (id: string | number) => apiFetch(`/campaigns/${id}`),
  create: (data: {
    title: string;
    description: string;
    goal_amount: number;
    duration_months: "1" | "3" | "6" | "12";
    category?: string;
    image_url?: string;
    video_url?: string;
    story?: string;
  }, token: string) => apiFetch(`/campaigns/`, { method: "POST", body: data, token }),
  createWithImage: (formData: FormData, token: string) => {
    const url = `${API_BASE_URL}/campaigns/with-image`;
    return fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed: ${res.status}`);
      }
      return res.json();
    });
  },
  update: (id: string | number, data: any, token: string) => 
    apiFetch(`/campaigns/${id}`, { method: "PUT", body: data, token }),
  delete: (id: string | number, token: string) => 
    apiFetch(`/campaigns/${id}`, { method: "DELETE", token }),
};

export const PaymentAPI = {
  donate: (data: {
    campaign_id: number;
    donor_email: string;
    donor_name?: string;
    amount: number;
    method: "credit_card" | "paypal" | "bank_transfer" | "square";
    is_anonymous?: boolean;
    message?: string;
  }, token?: string | null) => apiFetch(`/payments/`, { method: "POST", body: data, token: token || null }),
  forCampaign: (campaignId: number) => apiFetch(`/payments/campaign/${campaignId}`),
  forUser: (userId: number, token: string) => apiFetch(`/payments/user/${userId}`, { token }),
};

export const ReferralAPI = {
  stats: (campaignId: number, token: string) => apiFetch(`/referrals/stats/${campaignId}`, { token }),
};

export const MilestoneAPI = {
  forCampaign: (campaignId: number) => apiFetch(`/milestones/campaign/${campaignId}`),
};

export const ShoutoutAPI = {
  forCampaign: (campaignId: number) => apiFetch(`/shoutouts/campaign/${campaignId}`),
};

export const AdminAPI = {
  closeCampaign: (campaignId: number, token: string) =>
    apiFetch(`/admin/campaigns/${campaignId}/close`, { method: "POST", token }),
  setCampaignStatus: (campaignId: number, status: "draft" | "active" | "paused" | "completed" | "cancelled" | "expired", token: string) =>
    apiFetch(`/admin/campaigns/${campaignId}/status/${status}`, { method: "POST", token }),
};

export const PartnershipAPI = {
  request: (data: {
    company: string;
    contact: string;
    email: string;
    message?: string;
  }) => apiFetch(`/partnership/request`, { method: "POST", body: data }),
};


