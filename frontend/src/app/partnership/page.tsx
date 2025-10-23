"use client";
import React, { useState } from "react";
import { PartnershipAPI } from "@/lib/api";

export default function PartnershipPage() {
  const [form, setForm] = useState({ company: "", contact: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await PartnershipAPI.request({
        company: form.company,
        contact: form.contact,
        email: form.email,
        message: form.message
      });
      setSent(true);
    } catch (err) {
      setError("Failed to send partnership request. Please try again.");
      console.error("Partnership request error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Partnerships</h1>
      <p className="mb-6 text-gray-600">Join us to support student success through scholarships, mentorships, and sponsorships.</p>
      {sent ? (
        <div className="rounded border bg-green-50 p-4 text-green-700">
          Thanks! We received your partnership request and will get back to you soon.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">Organization</label>
            <input className="w-full rounded border px-3 py-2" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm">Contact name</label>
            <input className="w-full rounded border px-3 py-2" required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm">Email</label>
            <input type="email" className="w-full rounded border px-3 py-2" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm">Message</label>
            <textarea className="w-full rounded border px-3 py-2" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          {error && (
            <div className="rounded border bg-red-50 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}
          <button 
            type="submit"
            disabled={loading}
            className="w-full rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Request partnership"}
          </button>
        </form>
      )}
    </div>
  );
}


