export const SITE = {
  name: "PikiPiki Market",
  tagline: "Pikipiki bora, bei poa.",
  description:
    "Tanzania's home of new and quality motorbikes — Honda, Yamaha, KTM, Ducati, TVS, Boxer, Haojue & Sinoray. Nationwide delivery, genuine papers, trusted service.",
  location: "Dar es Salaam, Tanzania",
  /** Studio cut-out used in the hero. */
  heroImage: "/hero-bike.png",
  whatsappIcon: "/whatsapp.png",
  url: "https://www.pikipikimarket.com",
};

export const SOCIALS = [
  { name: "TikTok", href: "https://www.tiktok.com/@pikipiki_market" },
  { name: "Instagram", href: "https://www.instagram.com/pikipiki_market/" },
  { name: "Facebook", href: "https://www.facebook.com/share/1DiumfDV8M/" },
  { name: "YouTube", href: "https://www.youtube.com/@pikipiki_market" },
] as const;

/** Logos in /public/brands, keyed by brand slug. Brands added later in the admin fall back to a text wordmark. */
export const BRAND_LOGOS: Record<string, string> = {
  sinoray: "/brands/sinoray.png",
  honda: "/brands/honda.png",
  boxer: "/brands/boxer.png",
  tvs: "/brands/tvs.png",
  ktm: "/brands/ktm.png",
  yamaha: "/brands/yamaha.png",
  ducati: "/brands/ducati.png",
  haojue: "/brands/haojue.png",
};
