import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileQuestion, Plus, FolderTree, Clock, CheckCircle2,
  Trophy, Gift, History, Briefcase, Users, FileText, Settings, LogOut, ListChecks,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Quiz4Job" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number };

function AdminLayout() {
  const { user, profile, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/login" });
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .then(({ count }) => setPendingCount(count ?? 0));
  }, [isAdmin, pathname]);

  if (loading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">লোড হচ্ছে...</div>;
  }

  const groups: { title?: string; items: NavItem[] }[] = [
    { items: [{ to: "/admin/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard }] },
    {
      title: "কুইজ ব্যবস্থাপনা",
      items: [
        { to: "/admin/questions", label: "প্রশ্ন ব্যাংক", icon: FileQuestion },
        { to: "/admin/questions/new", label: "প্রশ্ন যোগ করুন", icon: Plus },
        { to: "/admin/categories", label: "ক্যাটাগরি", icon: FolderTree },
      ],
    },
    {
      title: "সাবস্ক্রিপশন",
      items: [
        { to: "/admin/subscriptions", label: "অপেক্ষামাণ", icon: Clock, badge: pendingCount },
        { to: "/admin/subscriptions/verified", label: "যাচাইকৃত", icon: CheckCircle2 },
      ],
    },
    {
      title: "পুরস্কার",
      items: [
        { to: "/admin/leaderboard", label: "লিডারবোর্ড", icon: Trophy },
        { to: "/admin/leaderboard?tab=distribute", label: "পুরস্কার বিতরণ", icon: Gift },
        { to: "/admin/leaderboard?tab=history", label: "বিজয়ীদের ইতিহাস", icon: History },
      ],
    },
    {
      items: [
        { to: "/admin/jobs", label: "চাকরি ব্যবস্থাপনা", icon: Briefcase },
        { to: "/admin/users", label: "ব্যবহারকারী", icon: Users },
        { to: "/admin/blog", label: "ব্লগ", icon: FileText },
        { to: "/admin/settings", label: "সেটিংস", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 -mt-px">
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="px-5 py-4 border-b border-slate-800">
          <div className="font-bold text-green-400">Quiz4Job Admin</div>
          <div className="text-xs text-slate-400 truncate">{profile?.email}</div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {groups.map((g, gi) => (
            <div key={gi} className="py-1">
              {g.title && <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider text-slate-500">{g.title}</div>}
              {g.items.map((it) => {
                const active = pathname === it.to.split("?")[0];
                const Icon = it.icon;
                return (
                  <Link
                    key={it.to}
                    to={it.to.split("?")[0]}
                    search={it.to.includes("?tab=") ? { tab: it.to.split("=")[1] } as any : undefined as any}
                    className={cn(
                      "flex items-center gap-2 rounded px-3 py-2 text-sm",
                      active ? "bg-green-600 text-white" : "text-slate-300 hover:bg-slate-800",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{it.label}</span>
                    {!!it.badge && it.badge > 0 && (
                      <span className="rounded-full bg-red-500 text-white text-[10px] px-1.5 py-0.5">{it.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <button
          onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
          className="flex items-center gap-2 px-5 py-3 text-sm text-red-400 hover:bg-slate-800 border-t border-slate-800"
        >
          <LogOut className="h-4 w-4" /> লগ আউট
        </button>
      </aside>
      <main className="flex-1 min-w-0 p-6"><Outlet /></main>
    </div>
  );
}

export { ListChecks };