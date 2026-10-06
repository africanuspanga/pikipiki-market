import Image from "next/image";
import Link from "next/link";

/** Red "PM" emblem from the brand logo + wordmark set in white so it reads on dark backgrounds. */
export function Logo({ href = "/", suffix }: { href?: string; suffix?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-2.5" aria-label="PikiPiki Market home">
      <Image
        src="/logo-mark.webp"
        alt=""
        width={187}
        height={256}
        priority
        className="h-10 w-auto transition-transform group-hover:-rotate-3"
      />
      <span className="font-display text-[1.35rem] font-black uppercase leading-[0.85] tracking-wide">
        Pikipiki
        <br />
        <span className="text-ignite">{suffix ?? "Market"}</span>
      </span>
    </Link>
  );
}
