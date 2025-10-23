"use client";
import React, { useState, useRef } from "react";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const monthsNum = Number(form.duration_months);
  const monthlyFee = 10;
  const totalFee = monthlyFee * monthsNum;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setForm({ ...form, image_url: "" }); // Clear URL when file is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("goal_amount", form.goal_amount.toString());
      formData.append("duration_months", form.duration_months);
      formData.append("category", form.category);
      formData.append("story", form.story);
      
      if (selectedFile) {
        formData.append("image_file", selectedFile);
      } else if (form.image_url) {
        formData.append("image_url", form.image_url);
      }
      
      const response = await fetch(`${API_BASE_URL}/campaigns/with-image`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed: ${response.status}`);
      }
      
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
            <label className="mb-1 block text-sm font-medium">Campaign Image</label>
            <div className="space-y-3">
              {/* File Upload */}
              <div>
                <label className="block">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="w-full bg-[#00AFF0] hover:bg-[#0099D6] text-white px-4 py-2 rounded-lg text-sm font-medium text-center cursor-pointer transition-colors duration-200 border border-[#00AFF0] hover:border-[#0099D6]">
                    📁 Choose Image File
                  </div>
                </label>
                <p className="mt-2 text-xs text-gray-600">
                  <strong>Recommended:</strong> 600x600 pixels, JPG or PNG format
                </p>
              </div>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-full rounded-md object-cover border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {/* OR Image URL */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">OR</span>
                </div>
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium">Image URL</label>
                <input
                  className="w-full rounded-md border border-blue-700 px-3 py-2 outline-none focus:ring focus:ring-blue-500"
                  value={form.image_url}
                  onChange={(e) => {
                    setForm({ ...form, image_url: e.target.value });
                    if (e.target.value) {
                      setSelectedFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }
                  }}
                  placeholder="Enter image URL instead of uploading"
                />
              </div>
            </div>
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
        {user?.role === "student" && (
          <p className="mt-3 text-xs text-gray-600">Note: Referral requirement of 5 accepted invites must be met to start a campaign.</p>
        )}
      </div>
    </div>
  );
}


