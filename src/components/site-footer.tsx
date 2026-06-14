import { Trophy, Facebook, Youtube, Send } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-[#0F172A] text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-bd-green grid place-items-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Quiz4Job</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            বাংলাদেশের সেরা চাকরির কুইজ প্ল্যাটফর্ম
          </p>
          <div className="flex items-center gap-3 mt-4">
            <a href="https://facebook.com" aria-label="Facebook" className="w-9 h-9 grid place-items-center rounded-lg bg-slate-800 hover:bg-bd-green transition">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" aria-label="YouTube" className="w-9 h-9 grid place-items-center rounded-lg bg-slate-800 hover:bg-bd-red transition">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="https://t.me" aria-label="Telegram" className="w-9 h-9 grid place-items-center rounded-lg bg-slate-800 hover:bg-info transition">
              <Send className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-sm">কুইজ সমূহ</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/quiz/bcs" className="hover:text-white">BCS</a></li>
            <li><a href="/quiz/bank" className="hover:text-white">ব্যাংক</a></li>
            <li><a href="/quiz/primary-teacher" className="hover:text-white">প্রাইমারি</a></li>
            <li><a href="/quiz/english" className="hover:text-white">ইংরেজি</a></li>
            <li><a href="/quiz/math" className="hover:text-white">গণিত</a></li>
            <li><a href="/quiz/general-knowledge" className="hover:text-white">সাধারণ জ্ঞান</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-sm">চাকরির বোর্ড</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/jobs?type=government" className="hover:text-white">সরকারি চাকরি</a></li>
            <li><a href="/jobs?type=bank" className="hover:text-white">ব্যাংক জব</a></li>
            <li><a href="/jobs?type=ngo" className="hover:text-white">এনজিও</a></li>
            <li><a href="/jobs?type=private" className="hover:text-white">বেসরকারি</a></li>
            <li><a href="/jobs?type=university" className="hover:text-white">বিশ্ববিদ্যালয়</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 text-sm">সহায়তা</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:text-white">আমাদের সম্পর্কে</a></li>
            <li><a href="/contact" className="hover:text-white">যোগাযোগ</a></li>
            <li><a href="/terms" className="hover:text-white">শর্তাবলী</a></li>
            <li><a href="/privacy" className="hover:text-white">গোপনীয়তা নীতি</a></li>
            <li><a href="/faq" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-5 text-xs text-slate-500 text-center">
          © 2025 Quiz4Job. সকল অধিকার সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
}