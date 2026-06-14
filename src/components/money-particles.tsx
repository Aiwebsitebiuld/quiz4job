import { useMemo } from "react";

/**
 * Decorative floating ৳ symbols on the hero.
 * Positions are deterministic (seeded) so SSR + client match.
 */
export function MoneyParticles({ count = 18 }: { count?: number }) {
  const items = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      // simple deterministic pseudo-random
      const s = (i * 9301 + 49297) % 233280;
      const r = s / 233280;
      const r2 = ((i + 7) * 1103515245 % 2147483647) / 2147483647;
      const r3 = ((i + 13) * 16807 % 2147483647) / 2147483647;
      return {
        left: `${(r * 100).toFixed(2)}%`,
        size: 14 + Math.floor(r2 * 28),
        delay: `${(r3 * 8).toFixed(2)}s`,
        duration: `${(10 + r2 * 12).toFixed(2)}s`,
        opacity: 0.15 + r3 * 0.35,
      };
    });
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it, i) => (
        <span
          key={i}
          className="absolute bottom-[-40px] text-gold animate-float-up font-bold"
          style={{
            left: it.left,
            fontSize: `${it.size}px`,
            animationDelay: it.delay,
            animationDuration: it.duration,
            opacity: it.opacity,
          }}
        >
          ৳
        </span>
      ))}
      {/* soap-bubble circles */}
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={`b-${i}`}
          className="absolute rounded-full bg-bd-green/20 blur-2xl animate-pulse-slow"
          style={{
            width: `${120 + i * 60}px`,
            height: `${120 + i * 60}px`,
            left: `${(i * 23) % 90}%`,
            top: `${(i * 37) % 80}%`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}
    </div>
  );
}