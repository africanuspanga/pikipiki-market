"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/app/admin/actions";
import { Logo } from "@/components/logo";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
  { href: "/admin/products", label: "Bikes", icon: "M2 16.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M15 16.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M5.5 16.5 9 10h5.5l4 6.5M9 10 7.5 7H5M14.5 10l1.5-3h2.5M9 10l3 6.5h3" },
  { href: "/admin/spares", label: "Spares", icon: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3.5 17.5a1.8 1.8 0 0 0 2.5 2.5l5.8-5.8a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.3-.2-.2-2.3z" },
  { href: "/admin/inquiries", label: "Leads", icon: "M4 6h16v12H4zM4 7l8 6 8-6" },
  { href: "/admin/testimonials", label: "Reviews", icon: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" },
  { href: "/admin/brands", label: "Brands", icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
  { href: "/admin/hero", label: "Hero", icon: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5a1 1 0 1 0 0-.01" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  async function logout() {
    await signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-[100svh] lg:grid lg:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-[100svh] flex-col border-r border-line bg-ink-2 p-5 lg:flex">
        <Logo href="/admin" suffix="Admin" />
        <nav className="mt-8 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive(n.href) ? "bg-ignite text-white" : "text-bone/70 hover:bg-ink-3 hover:text-bone"
              }`}
            >
              <Icon d={n.icon} /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-2 border-t border-line pt-4 text-sm">
          <Link href="/" target="_blank" className="block text-mute hover:text-bone">View website ↗</Link>
          <p className="truncate text-xs text-mute">{email}</p>
          <button onClick={logout} className="text-red-600 hover:underline">Sign out</button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-ink/90 px-4 backdrop-blur-xl lg:hidden">
        <Logo href="/admin" suffix="Admin" />
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" target="_blank" className="text-mute">Site ↗</Link>
          <button onClick={logout} className="text-red-600">Sign out</button>
        </div>
      </header>

      <main className="min-w-0 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-7 border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${isActive(n.href) ? "text-ignite" : "text-mute"}`}
          >
            <Icon d={n.icon} />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl font-black uppercase leading-none sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-mute">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
