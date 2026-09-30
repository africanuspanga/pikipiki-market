import { ImageResponse } from "next/og";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { PHONE_DISPLAY } from "@/lib/format";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — Motorbikes for sale in Tanzania`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const [bike, mark] = await Promise.all([
  readFile(join(process.cwd(), "assets/og/hero-bike.png"), "base64"),
  readFile(join(process.cwd(), "public/logo-mark.png"), "base64"),
]);

/** Share card used by WhatsApp, Facebook, X etc. when a page has no photo of its own. */
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0d0d10", color: "#f5f3ee", position: "relative" }}>
        <div style={{ position: "absolute", right: -120, top: -120, width: 760, height: 760, borderRadius: 9999, background: "#e30d19", display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 0 64px 72px", width: 620 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img src={`data:image/png;base64,${mark}`} height={84} alt="" />
            <div style={{ display: "flex", flexDirection: "column", fontSize: 40, fontWeight: 900, lineHeight: 0.9, textTransform: "uppercase" }}>
              <span>Pikipiki</span>
              <span style={{ color: "#e30d19" }}>Market</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 0.95, textTransform: "uppercase" }}>Motorbikes for sale in Tanzania</div>
            <div style={{ display: "flex", marginTop: 20, fontSize: 28, color: "#b9b6ae" }}>New & used · Nationwide delivery</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 30, fontWeight: 800 }}>
            <span>{PHONE_DISPLAY}</span>
            <span style={{ color: "#b9b6ae", fontWeight: 400 }}>www.pikipikimarket.com</span>
          </div>
        </div>
        <img src={`data:image/png;base64,${bike}`} width={640} height={596} alt="" style={{ position: "absolute", right: -30, bottom: 10, objectFit: "contain" }} />
      </div>
    ),
    size,
  );
}
