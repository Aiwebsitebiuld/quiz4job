import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, Briefcase, Trophy, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const TABS = [
  { href: "/", label: "হোম", icon: Home },
  { href: "/quiz", label: "কুইজ", icon: BookOpen },
  { href: "/jobs", label: "জব", icon: Briefcase },
  { href: "/leaderboard", label: "লিডার", icon: Trophy },
];

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAdmin } = useAuth();
  const profileHref = !user ? "/login" : isAdmin ? "/admin/dashboard" : "/dashboard";

  const items = [...TABS, { href: profileHref, label: user ? "আমি" : "লগইন", icon: UserIcon }];

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={label}>
              <Link
                to={href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition ${
                  active ? "text-bd-green" : "text-foreground/60 hover:text-bd-green"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "scale-110" : ""}`} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
