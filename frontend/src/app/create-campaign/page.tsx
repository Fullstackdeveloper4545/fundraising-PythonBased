"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CampaignAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function CreateCampaignPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    goal_amount: 1000,
    duration_months: "1" as "1" | "3" | "6" | "12",
    category: "",
    image_url: "",
    story: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const monthsNum = Number(form.duration_months);
  const monthlyFee = 10;
  const totalFee = monthlyFee * monthsNum;

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-4 text-2xl font-semibold">Sign in required</h1>
        <p className="mb-4 text-gray-600">Please sign in with a student or admin account to create a campaign.</p>
        <button className="btn-primary" onClick={() => router.push("/signin")}>Sign in</button>
      </div>
    );
  }
  if (user && !["student", "admin"].includes(user.role)) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-4 text-2xl font-semibold">Campaign creation is restricted</h1>
        <p className="mb-4 text-gray-600">Only student and admin accounts can create campaigns on this platform.</p>
        <button className="btn-primary" onClick={() => router.push("/campaigns")}>Browse campaigns</button>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Please sign in to create a campaign");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await CampaignAPI.create({ ...form, goal_amount: Number(form.goal_amount) }, token);
      router.push("/campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Create a campaign</h1>
      <div className="rounded-lg border border-blue-700 bg-white p-6 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input className="w-full rounded-md border border-blue-700 px-3 py-2 outline-none focus:ring focus:ring-blue-500" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea className="w-full rounded-md border border-blue-700 px-3 py-2 outline-none focus:ring focus:ring-blue-500" rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Goal amount ($)</label>
              <input type="number" min={1} className="w-full rounded-md border border-blue-700 px-3 py-2 outline-none focus:ring focus:ring-blue-500" value={form.goal_amount} onChange={(e) => setForm({ ...form, goal_amount: Number(e.target.value) })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Duration</label>
              <select className="w-full rounded-md border border-blue-700 px-3 py-2 outline-none focus:ring focus:ring-blue-500" value={form.duration_months} onChange={(e) => setForm({ ...form, duration_months: e.target.value as "1" | "3" | "6" | "12" })}>
                <option value="1">1 month</option>
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
              </select>
              <p className="mt-1 text-xs text-gray-600">Subscription: ${monthlyFee}/month × {monthsNum} month{monthsNum > 1 ? "s" : ""} = <span className="font-semibold">${totalFee}</span></p>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Image URL</label>
            <input className="w-full rounded-md border border-blue-700 px-3 py-2 outline-none focus:ring focus:ring-blue-500" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Story</label>
            <textarea className="w-full rounded-md border border-blue-700 px-3 py-2 outline-none focus:ring focus:ring-blue-500" rows={4} value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white focus:ring focus:ring-blue-200 disabled:opacity-50">
            {loading ? "Creating..." : `Create campaign ($${monthlyFee}/mo, total $${totalFee})`}
          </button>
        </form>
        <p className="mt-3 text-xs text-gray-600">Note: Referral requirement of 5 accepted invites must be met to start a campaign.</p>
      </div>
    </div>
  );
}


