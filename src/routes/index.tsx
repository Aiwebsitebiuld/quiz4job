import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Trophy, Sparkles, BookOpen, Briefcase, Crown, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quiz4Job — কুইজ দিন, চাকরি পান, পুরস্কার জিতুন!" },
      { name: "description", content: "বাংলাদেশের #১ চাকরির কুইজ প্ল্যাটফর্ম। বিসিএস, ব্যাংক, প্রাইমারি প্রস্তুতি। মাসিক ৳৩,০০০ পুরস্কার।" },
      { property: "og:title", content: "Quiz4Job — কুইজ দিন, চাকরি পান, পুরস্কার জিতুন!" },
      { property: "og:description", content: "প্রিমিয়াম মাত্র ৳১০/মাস। আনলিমিটেড কুইজ + ক্যাশ প্রাইজ।" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="bg-background">

      {/* Hero */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-sm mb-6 border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-gold" /> বাংলাদেশের #১ চাকরি কুইজ প্ল্যাটফর্ম
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold leading-tight"
            >
              কুইজ দিন, চাকরি পান,<br />
              <span className="text-gradient-prize">পুরস্কার জিতুন!</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl"
            >
              বিসিএস, ব্যাংক, প্রাইমারি ও সাধারণ জ্ঞানের MCQ কুইজ। প্রতি মাসে সেরা ৩ জন পাবেন <span className="text-gold font-semibold">৳৩,০০০ পর্যন্ত ক্যাশ প্রাইজ</span>।
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/" className="px-6 py-3 rounded-xl bg-bd-green hover:bg-bd-green-dark font-semibold transition shadow-lg">
                ফ্রি কুইজ শুরু করুন
              </Link>
              <a href="#pricing" className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 font-semibold hover:bg-white/20 transition">
                ৳১০/মাস প্রিমিয়াম
              </a>
            </motion.div>
          </div>
        </div>
        {/* Floating cash */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-60"
            initial={{ y: "100vh", x: `${15 + i * 18}%`, rotate: 0 }}
            animate={{ y: "-20vh", rotate: 360 }}
            transition={{ duration: 8 + i, repeat: Infinity, delay: i * 1.2, ease: "linear" }}
          >
            💵
          </motion.div>
        ))}
      </section>

      {/* Prize tiers */}
      <section id="prize" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">এই মাসের পুরস্কার</h2>
            <p className="text-muted-foreground mt-2">শুধুমাত্র প্রিমিয়াম সাবস্ক্রাইবারদের জন্য</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { rank: "১ম", amount: "১,৫০০", icon: "🥇", color: "from-yellow-400 to-yellow-600" },
              { rank: "২য়", amount: "১,০০০", icon: "🥈", color: "from-gray-300 to-gray-500" },
              { rank: "৩য়", amount: "৫০০", icon: "🥉", color: "from-amber-600 to-amber-800" },
            ].map((p) => (
              <motion.div
                key={p.rank}
                whileHover={{ y: -6 }}
                className="relative rounded-2xl border border-border bg-card p-8 text-center overflow-hidden"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${p.color}`} />
                <div className="text-6xl mb-3">{p.icon}</div>
                <div className="text-xl font-semibold text-muted-foreground">{p.rank} স্থান</div>
                <div className="text-5xl font-bold text-bd-green mt-2">৳{p.amount}</div>
                <div className="text-sm text-muted-foreground mt-1">BDT ক্যাশ প্রাইজ</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-bd-green-light/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">কেন Quiz4Job?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "৪টি ক্যাটাগরি", desc: "বিসিএস, ব্যাংক, প্রাইমারি, সাধারণ জ্ঞান" },
              { icon: Briefcase, title: "জব বোর্ড", desc: "সরকারি, ব্যাংক, NGO, প্রাইভেট" },
              { icon: Trophy, title: "লিডারবোর্ড", desc: "মাসিক র‍্যাঙ্কিং ও ক্যাশ প্রাইজ" },
              { icon: Zap, title: "তাৎক্ষণিক ফলাফল", desc: "ব্যাখ্যাসহ উত্তর ও স্কোর" },
            ].map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-xl p-6">
                <div className="w-12 h-12 rounded-lg bg-bd-green/10 text-bd-green grid place-items-center mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <div className="font-semibold mb-1">{f.title}</div>
                <div className="text-sm text-muted-foreground">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="text-sm font-semibold text-muted-foreground">ফ্রি</div>
            <div className="text-4xl font-bold mt-2">৳০</div>
            <ul className="mt-6 space-y-2 text-sm">
              <li>✓ দিনে ৫টি কুইজ</li>
              <li>✓ সব ক্যাটাগরি</li>
              <li>✓ লিডারবোর্ড দেখুন</li>
              <li className="text-muted-foreground">✗ ক্যাশ প্রাইজ নেই</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-premium bg-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 prize-gradient text-white text-xs font-bold rounded-bl-lg">
              জনপ্রিয়
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-premium">
              <Crown className="w-4 h-4" /> প্রিমিয়াম
            </div>
            <div className="text-4xl font-bold mt-2">৳১০<span className="text-base text-muted-foreground font-normal">/মাস</span></div>
            <ul className="mt-6 space-y-2 text-sm">
              <li>✓ আনলিমিটেড কুইজ</li>
              <li>✓ ক্যাশ প্রাইজে যোগ্য</li>
              <li>✓ বিস্তারিত পরিসংখ্যান</li>
              <li>✓ প্রিমিয়াম ব্যাজ</li>
            </ul>
            <button className="mt-6 w-full py-3 rounded-lg prize-gradient text-white font-semibold">
              এখনই আপগ্রেড করুন
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Quiz4Job · বাংলাদেশ
      </footer>
    </div>
  );
}
