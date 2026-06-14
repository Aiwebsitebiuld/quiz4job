import { Trophy, Check } from "lucide-react";

export function AuthHero() {
  return (
    <div className="hero-gradient text-white relative overflow-hidden flex flex-col justify-between p-8 lg:p-12">
      {/* glow orbs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[color:var(--gold)]/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-bd-green/40 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur grid place-items-center">
            <Trophy className="w-7 h-7 text-[color:var(--gold)]" />
          </div>
          <span className="text-3xl lg:text-4xl font-extrabold tracking-tight">Quiz4Job</span>
        </div>
        <p className="mt-3 text-base lg:text-lg text-white/80 max-w-md">
          কুইজ দিন, চাকরি পান, পুরস্কার জিতুন!
        </p>
      </div>

      {/* Prize card */}
      <div className="relative my-8 rounded-2xl p-[2px] gold-shimmer shadow-2xl">
        <div className="rounded-2xl bg-[#0a1a14]/85 backdrop-blur p-6">
          <div className="text-sm font-bold text-[color:var(--gold)] uppercase tracking-wider mb-1">
            💰 মাসিক নগদ পুরস্কার
          </div>
          <h3 className="text-2xl font-extrabold text-white mb-4">৳৩,০০০ টাকা প্রতি মাস</h3>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
              <span className="flex items-center gap-2"><span className="text-lg">🥇</span> ১ম স্থান</span>
              <span className="font-bold text-[color:var(--gold)]">৳১,৫০০</span>
            </li>
            <li className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
              <span className="flex items-center gap-2"><span className="text-lg">🥈</span> ২য় স্থান</span>
              <span className="font-bold text-[color:var(--gold)]">৳১,০০০</span>
            </li>
            <li className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
              <span className="flex items-center gap-2"><span className="text-lg">🥉</span> ৩য় স্থান</span>
              <span className="font-bold text-[color:var(--gold)]">৳৫০০</span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-white/70 leading-relaxed">
            মাত্র <span className="text-[color:var(--gold)] font-bold">৳১০/মাসে</span> প্রিমিয়াম হলেই পুরস্কারের যোগ্য!
          </p>
        </div>
      </div>

      <ul className="relative space-y-2 text-sm text-white/85">
        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[color:var(--gold)]" /> বিনামূল্যে ৫টি কুইজ প্রতিদিন</li>
        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[color:var(--gold)]" /> BCS / Bank / Primary প্রশ্ন</li>
      </ul>
    </div>
  );
}