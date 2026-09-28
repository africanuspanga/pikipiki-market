"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { whatsappLink, PHONE_DISPLAY } from "@/lib/format";
import { WhatsAppGlyph } from "@/components/icons";
import { Logo } from "@/components/logo";

const LINKS = [
  { href: "/#bikes", label: "Bikes" },
  { href: "/#brands", label: "Brands" },
  { href: "/#why", label: "Why us" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/bikes", label: "Shop all" },
];

const TEL = `tel:+${PHONE_DISPLAY.replace(/\D/g, "")}`;

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent only while sitting on top of the dark homepage hero.
  const solid = scrolled || pathname !== "/";

  return (
    <>
      <header
        className={`theme-dark fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          solid ? "border-b border-line/70 bg-ink/90 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20">
          <Logo />
          <ul className="hidden items-center gap-8 text-sm font-medium text-bone/80 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-ignite">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="hidden items-center gap-3 lg:flex">
            <a href={TEL} className="text-sm text-mute hover:text-bone">
              {PHONE_DISPLAY}
            </a>
            <a
              href={whatsappLink("Habari! I'd like to ask about a motorbike.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-ignite px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ignite-2"
            >
              <WhatsAppGlyph className="h-4 w-4" /> Chat with us
            </a>
          </div>
          <a
            href={TEL}
            className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-xs font-bold lg:hidden"
            aria-label={`Call ${PHONE_DISPLAY}`}
          >
            <Icon d={ICONS.phone} className="h-4 w-4 text-ignite" /> Call us
          </a>
        </nav>
      </header>
      <MobileDock />
    </>
  );
}

const ICONS = {
  home: "M3 11.5 12 4l9 7.5M5.5 9.5V20h5v-5.5h3V20h5V9.5",
  shop: "M2 16.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M15 16.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M5.5 16.5 9 10h5.5l4 6.5M9 10 7.5 7H5M14.5 10l1.5-3h2.5M9 10l3 6.5h3",
  brands: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  reviews: "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
};

type DockItem = { key: string; href: string; label: string; icon: string };

const DOCK: DockItem[] = [
  { key: "home", href: "/", label: "Home", icon: ICONS.home },
  { key: "shop", href: "/bikes", label: "Shop", icon: ICONS.shop },
  { key: "brands", href: "/#brands", label: "Brands", icon: ICONS.brands },
  { key: "reviews", href: "/#reviews", label: "Reviews", icon: ICONS.reviews },
];

/** Floating bottom tab bar for phones — black pill, active tab in a red gradient tile. */
function MobileDock() {
  const pathname = usePathname();
  const [section, setSection] = useState("home");

  // On the homepage, highlight the tab for whichever section is on screen.
  useEffect(() => {
    if (pathname !== "/") return;
    // Section ids in page order, mapped to the tab they belong to.
    const sections: [string, string][] = [["brands", "brands"], ["bikes", "home"], ["why", "home"], ["reviews", "reviews"]];
    const onScroll = () => {
      const mid = window.innerHeight * 0.5;
      let current = "home";
      for (const [id, tab] of sections) {
        const r = document.getElementById(id)?.getBoundingClientRect();
        if (r && r.top < mid && r.bottom > 0) current = tab;
      }
      setSection(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const active = pathname.startsWith("/bikes") ? "shop" : pathname === "/" ? section : "";

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden"
    >
      <ul className="mx-auto flex max-w-sm items-center justify-between rounded-[1.75rem] bg-night p-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/15">
        {DOCK.map((item) => {
          const on = active === item.key;
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={on ? "page" : undefined}
                className={`relative mx-auto flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl transition-all duration-300 ${
                  on
                    ? "w-full max-w-[4.5rem] bg-gradient-to-b from-ignite-2 to-ignite text-white shadow-[0_8px_20px_-6px_rgba(227,13,25,0.8)]"
                    : "w-14 text-white/55 active:scale-90"
                }`}
              >
                <Icon d={item.icon} className="h-[22px] w-[22px]" filled={on} />
                <span className={`text-[10px] font-bold ${on ? "" : "sr-only"}`}>{item.label}</span>
                {on && <span className="absolute bottom-1 h-[3px] w-5 rounded-full bg-white/90" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Icon({ d, className, filled = false }: { d: string; className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      fillOpacity={filled ? 0.18 : undefined}
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
