import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Menu, X, Crown, Trophy, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PrizeBanner } from "./prize-banner";

const NAV = [
  { href: "/quiz", label: "কুইজ" },
  { href: "/jobs", label: "জব বোর্ড" },
  { href: "/leaderboard", label: "লিডারবোর্ড" },
  { href: "/prizes", label: "পুরস্কার" },
  { href: "/blog", label: "ব্লগ" },
];

export function SiteHeader() {
  const { user, profile, isPremium, isAdmin } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [openDrop, setOpenDrop] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setOpenDrop(false);
    navigate({ to: "/" });
  };

  const initial = (profile?.full_name || profile?.email || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="sticky top-0 z-50">
      <PrizeBanner />
      <header className="bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-bd-green text-white grid place-items-center">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-bd-green">Quiz4Job</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-foreground/80">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-bd-green transition">
                {n.label}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold text-bd-green hover:bg-bd-green-light transition"
                >
                  লগ ইন
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg bg-bd-green text-white text-sm font-semibold hover:bg-bd-green-dark transition"
                >
                  নিবন্ধন করুন
                </Link>
              </>
            ) : (
              <>
                <button
                  className="hidden sm:grid w-9 h-9 place-items-center rounded-lg hover:bg-muted relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-foreground/70" />
                </button>

                {isPremium ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/15 text-[color:var(--gold)] text-xs font-bold border border-[color:var(--gold)]/40">
                    <Crown className="w-3.5 h-3.5" /> প্রিমিয়াম
                  </span>
                ) : (
                  <a
                    href="/premium"
                    className="hidden sm:inline-flex items-center gap-1 gold-shimmer text-foreground text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    <Crown className="w-4 h-4" /> প্রিমিয়াম হন ৳১০
                  </a>
                )}

                <div className="relative">
                  <button
                    onClick={() => setOpenDrop((v) => !v)}
                    className="w-9 h-9 rounded-full bg-bd-green text-white grid place-items-center font-bold text-sm hover:opacity-90"
                    aria-label="Account"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      initial
                    )}
                  </button>
                  {openDrop && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover shadow-lg overflow-hidden"
                      onMouseLeave={() => setOpenDrop(false)}
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold truncate">{profile?.full_name || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                      </div>
                      <a href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted">
                        <LayoutDashboard className="w-4 h-4" /> ড্যাশবোর্ড
                      </a>
                      <a href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted">
                        <UserIcon className="w-4 h-4" /> প্রোফাইল
                      </a>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted text-destructive"
                      >
                        <LogOut className="w-4 h-4" /> লগ আউট
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="lg:hidden grid w-9 h-9 place-items-center rounded-lg hover:bg-muted"
              onClick={() => setOpenMenu(true)}
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {openMenu && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenMenu(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-card shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-bold text-bd-green">মেনু</span>
              <button onClick={() => setOpenMenu(false)} className="w-9 h-9 grid place-items-center rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-2 overflow-y-auto">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="block px-4 py-3 rounded-lg text-sm font-semibold hover:bg-muted"
                  onClick={() => setOpenMenu(false)}
                >
                  {n.label}
                </a>
              ))}
              <div className="border-t border-border my-2" />
              {!user ? (
                <>
                  <Link to="/login" className="block px-4 py-3 rounded-lg text-sm font-semibold hover:bg-muted" onClick={() => setOpenMenu(false)}>
                    লগ ইন
                  </Link>
                  <Link to="/signup" className="block mx-2 my-2 px-4 py-3 rounded-lg bg-bd-green text-white text-sm font-bold text-center" onClick={() => setOpenMenu(false)}>
                    নিবন্ধন করুন
                  </Link>
                </>
              ) : (
                <>
                  <a href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="block px-4 py-3 rounded-lg text-sm font-semibold hover:bg-muted">
                    ড্যাশবোর্ড
                  </a>
                  {!isPremium && (
                    <a href="/premium" className="block mx-2 my-2 px-4 py-3 rounded-lg gold-shimmer text-foreground text-sm font-bold text-center">
                      <Crown className="inline w-4 h-4 mr-1" /> প্রিমিয়াম হন ৳১০
                    </a>
                  )}
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold hover:bg-muted text-destructive">
                    লগ আউট
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}