import { PaymentAPI } from "@/lib/api";
import { cookies } from "next/headers";
import type { Payment } from "@/types/api";

export default async function DonorDashboard() {
  const cookieStore = cookies();
  // Auth is stored in localStorage on client; for server, show instruction if not available.
  const authCookie = cookieStore.get("auth");
  let payments: Payment[] = [];
  if (!authCookie) {
    // render a message to use client nav
  } else {
    try {
      const parsed = JSON.parse(authCookie.value) as { token: string; user: { id: number } };
      payments = await PaymentAPI.forUser(parsed.user.id, parsed.token);
    } catch {
      payments = [];
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Your Donations</h1>
      <div className="rounded border p-4">
        {payments.length === 0 ? (
          <p className="text-gray-600">Sign in to view your donations.</p>
        ) : (
          <ul className="divide-y">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                <span className="truncate">Campaign #{p.campaign_id}</span>
                <span>${'{'}p.amount{'}'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


