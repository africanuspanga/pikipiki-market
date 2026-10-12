"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const INTERVAL_MS = 5000;

/** Hero bike photos, cross-fading every few seconds. One photo just sits still. */
export function HeroSlider({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length < 2 || paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % images.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [images.length, paused]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === 0 ? "Superbike available at PikiPiki Market" : ""}
          aria-hidden={i !== active}
          fill
          priority={i === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={`object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)] transition-[opacity,transform] duration-1000 ease-out ${
            i === active ? "scale-100 opacity-100" : "translate-x-[6%] scale-95 opacity-0"
          }`}
        />
      ))}

      {images.length > 1 && (
        <div className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={`w-1.5 rounded-full transition-all ${i === active ? "h-8 bg-ignite" : "h-3 bg-bone/30 hover:bg-bone/60"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
