import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

function daysLeftInMonth() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}

export function PrizeBanner() {
  const [days, setDays] = useState(daysLeftInMonth());
  useEffect(() => {
    const id = setInterval(() => setDays(daysLeftInMonth()), 60_000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="prize-gradient text-white">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:text-sm font-semibold">
        <span className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4" /> এই মাসের পুরস্কার: ৳৩,০০০ টাকা!
        </span>
        <span className="bg-white/20 rounded-full px-2.5 py-0.5 backdrop-blur">
          দিন বাকি: {days}
        </span>
        <a href="/prizes" className="underline underline-offset-2 hover:text-gold-light">
          পুরস্কার জিতুন →
        </a>
      </div>
    </div>
  );
}