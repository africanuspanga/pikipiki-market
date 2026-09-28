import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/sections";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
