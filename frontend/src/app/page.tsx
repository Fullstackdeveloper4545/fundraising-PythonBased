import Link from "next/link";
import { CampaignAPI } from "@/lib/api";
import type { Campaign } from "@/types/api";

async function getFeaturedCampaigns() {
  try {
    const campaigns = await CampaignAPI.list({ featured: true, limit: 6 });
    return Array.isArray(campaigns) ? campaigns : [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const featured = await getFeaturedCampaigns();
  return (
    <div className="space-y-12">
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-sm font-medium text-muted">Built for high school students</p>
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight">Launch a fundraising campaign that's simple, secure, and mobile-ready</h1>
          <p className="text-base text-muted">Choose a plan at $10/month, share your story, invite 5 friends, and accept donations in minutes.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/create-campaign" className="btn-primary">Start a Campaign</Link>
            <Link href="/partnership" className="btn-outline">Become a Partner</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="badge">ADA compliant</div>
            <div className="badge">Secure payments (UI)</div>
            <div className="badge">Automated receipts</div>
            <div className="badge">Admin oversight</div>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border ring-1 ring-[var(--brand-100)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1400&auto=format&fit=crop" alt="Students" className="h-full w-full object-cover" />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured Campaigns</h2>
          <Link className="text-sm underline" href="/campaigns">View all</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.length === 0 && <div className="text-muted">No featured campaigns yet.</div>}
          {featured.map((c: Campaign) => (
            <Link href={`/campaign/${c.id}`} key={c.id} className="group rounded-xl border p-4 hover:shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {c.image_url ? <img alt="" src={c.image_url} className="mb-3 h-40 w-full rounded object-cover" /> : <div className="mb-3 h-40 w-full rounded bg-gray-100" />}
              <h3 className="line-clamp-1 text-lg font-semibold group-hover:underline">{c.title}</h3>
              <p className="line-clamp-2 text-sm text-muted">{c.description}</p>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-muted">
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
      </section>
    </div>
  );
}
