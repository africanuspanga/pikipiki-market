import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/shell";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const count = (table: string, filter?: [string, string | boolean]) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    return q.then((r) => r.count ?? 0);
  };

  const [products, published, soldOut, spares, newLeads, reviews, recent] = await Promise.all([
    count("products"),
    count("products", ["is_published", true]),
    count("products", ["stock_status", "sold_out"]),
    count("spares"),
    count("inquiries", ["status", "new"]),
    count("testimonials"),
    supabase
      .from("inquiries")
      .select("id, name, phone, created_at, status, product:products(name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Total bikes", value: products, href: "/admin/products" },
    { label: "Live on site", value: published, href: "/admin/products" },
    { label: "Sold", value: soldOut, href: "/admin/products" },
    { label: "Spares", value: spares, href: "/admin/spares" },
    { label: "New leads", value: newLeads, href: "/admin/inquiries", hot: newLeads > 0 },
    { label: "Reviews", value: reviews, href: "/admin/testimonials" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Karibu! Here's what's happening in the showroom."
        action={
          <Link href="/admin/products/new" className="rounded-full bg-ignite px-5 py-3 text-sm font-extrabold uppercase text-white hover:bg-ignite-2">
            + Add bike
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`rounded-2xl border p-4 transition hover:border-ignite ${s.hot ? "border-ignite bg-ignite/10" : "border-line bg-ink-2"}`}>
            <p className="text-xs uppercase tracking-widest text-mute">{s.label}</p>
            <p className="mt-2 font-display text-4xl font-black">{s.value}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl font-black uppercase">Latest leads</h2>
          <Link href="/admin/inquiries" className="text-sm font-semibold text-ignite">View all →</Link>
        </div>
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-ink-2">
          {(recent.data ?? []).map((l) => {
            const product = l.product as unknown as { name: string } | null;
            return (
              <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{l.name} · <a href={`tel:${l.phone}`} className="text-ignite">{l.phone}</a></p>
                  <p className="truncate text-xs text-mute">{product?.name ?? "General"} · {new Date(l.created_at).toLocaleDateString("en-GB")}</p>
                </div>
                <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-xs capitalize">{l.status}</span>
              </li>
            );
          })}
          {!recent.data?.length && <li className="px-4 py-6 text-center text-sm text-mute">No leads yet.</li>}
        </ul>
      </section>
    </>
  );
}
