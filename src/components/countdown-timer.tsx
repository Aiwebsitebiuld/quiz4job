import { useEffect, useState } from "react";
import { toBn } from "@/lib/bn";

function getTimeLeft() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
  let diff = Math.max(0, end.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000); diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
  const minutes = Math.floor(diff / 60000); diff -= minutes * 60000;
  const seconds = Math.floor(diff / 1000);
  return { days, hours, minutes, seconds };
}

const labels = [
  { key: "days", label: "দিন" },
  { key: "hours", label: "ঘণ্টা" },
  { key: "minutes", label: "মিনিট" },
  { key: "seconds", label: "সেকেন্ড" },
] as const;

export function CountdownTimer() {
  const [t, setT] = useState<ReturnType<typeof getTimeLeft> | null>(null);
  useEffect(() => {
    setT(getTimeLeft());
    const id = setInterval(() => setT(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3" suppressHydrationWarning>
      {labels.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-2xl border border-gold/40 bg-black/30 backdrop-blur px-3 py-2 sm:px-4 sm:py-3 min-w-[64px] sm:min-w-[80px] text-center shadow-[0_0_30px_-10px_rgba(245,158,11,0.6)]"
        >
          <div className="text-2xl sm:text-3xl font-extrabold text-gold tabular-nums leading-none">
            {t ? toBn(String(t[key]).padStart(2, "0")) : "০০"}
          </div>
          <div className="text-[10px] sm:text-xs text-white/80 mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}