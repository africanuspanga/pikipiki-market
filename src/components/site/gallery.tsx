"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ProductImage } from "@/lib/types";

export function Gallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const touchX = useRef<number | null>(null);

  if (!images.length) {
    return <div className="grid aspect-[4/3] place-items-center rounded-3xl border border-line bg-ink-2 text-mute">No photos yet</div>;
  }

  const go = (d: number) => setActive((i) => (i + d + images.length) % images.length);

  return (
    <div>
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-ink-3 sm:aspect-[4/3]"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {/* Blurred copy of the active photo fills the frame behind the uncropped image */}
        <Image
          key={`bg-${images[active].id}`}
          src={images[active].url}
          alt=""
          fill
          sizes="40vw"
          className="scale-110 object-cover opacity-40 blur-2xl"
        />
        {images.map((img, i) => (
          <Image
            key={img.id}
            src={img.url}
            alt={`${name} — photo ${i + 1}`}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className={`object-contain transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink/70 backdrop-blur hover:bg-ignite hover:text-white">
              ‹
            </button>
            <button onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink/70 backdrop-blur hover:bg-ignite hover:text-white">
              ›
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-bold backdrop-blur">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 bg-ink-2 transition ${i === active ? "border-ignite" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
