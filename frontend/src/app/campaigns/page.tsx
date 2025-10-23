import Link from "next/link";
import { CampaignAPI } from "@/lib/api";
import type { Campaign } from "@/types/api";

// Helper function to construct proper image URLs
function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) return imageUrl;
  
  // If it's a relative path, prepend the backend base URL
  if (imageUrl.startsWith('/uploads/')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000';
    return `${backendUrl}${imageUrl}`;
  }
  
  return imageUrl;
}

export default async function CampaignsPage() {
  const campaigns = await CampaignAPI.list({ limit: 30 });
  const items = Array.isArray(campaigns) ? campaigns : [];
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Campaigns</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 && <div className="text-gray-500">No campaigns found.</div>}
        {items.map((c: Campaign) => (
          <Link href={`/campaign/${c.id}`} key={c.id} className="group rounded-xl border p-4 hover:shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {c.image_url ? <img alt="" src={getImageUrl(c.image_url) || ''} className="mb-3 h-40 w-full rounded object-cover" /> : <div className="mb-3 h-40 w-full rounded bg-gray-100" />}
            <h3 className="line-clamp-1 text-lg font-semibold group-hover:underline">{c.title}</h3>
            <p className="line-clamp-2 text-sm text-gray-600">{c.description}</p>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                <span>${'{'}c.current_amount{'}'} raised</span>
                <span>Goal ${'{'}c.goal_amount{'}'}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
                <div className="h-full bg-green-600" style={{ width: `${'{'}Math.min(100, c.progress_percentage){'}'}%` }} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


