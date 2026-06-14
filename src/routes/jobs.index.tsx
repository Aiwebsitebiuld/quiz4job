import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toBn } from "@/lib/bn";
import { DISTRICTS_BD } from "@/lib/districts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bookmark, MapPin, Users, Wallet, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/jobs/")({
  head: () => ({
    meta: [
      { title: "চাকরির বোর্ড — সর্বশেষ চাকরির বিজ্ঞপ্তি | Quiz4Job" },
      { name: "description", content: "বাংলাদেশের সব সরকারি, ব্যাংক, এনজিও, বেসরকারি ও বিশ্ববিদ্যালয় চাকরির বিজ্ঞপ্তি এক জায়গায়।" },
      { property: "og:title", content: "চাকরির বোর্ড — Quiz4Job" },
      { property: "og:description", content: "সর্বশেষ চাকরির বিজ্ঞপ্তি — বিসিএস, ব্যাংক, এনজিও ও আরো।" },
    ],
  }),
  component: JobsPage,
});

type OrgType = "all" | "government" | "bank" | "ngo" | "private" | "university";
type Deadline = "all" | "week" | "month";
type Sort = "newest" | "deadline" | "featured";

const ORG_TABS: { value: OrgType; label: string; icon: string }[] = [
  { value: "all", label: "সব", icon: "📋" },
  { value: "government", label: "সরকারি", icon: "🏛️" },
  { value: "bank", label: "ব্যাংক", icon: "🏦" },
  { value: "ngo", label: "এনজিও", icon: "🌿" },
  { value: "private", label: "বেসরকারি", icon: "🏢" },
  { value: "university", label: "বিশ্ববিদ্যালয়", icon: "🎓" },
];

const ORG_LABEL_BN: Record<string, string> = {
  government: "সরকারি",
  bank: "ব্যাংক",
  ngo: "এনজিও",
  private: "বেসরকারি",
  university: "বিশ্ববিদ্যালয়",
};

const PAGE_SIZE = 12;

function daysLeft(deadline: string | null) {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}

function JobCard({ job, savedIds, onToggleSave }: { job: any; savedIds: Set<string>; onToggleSave: (id: string) => void }) {
  const dl = daysLeft(job.application_deadline);
  const urgent = dl !== null && dl <= 3;
  const warn = dl !== null && dl > 3 && dl <= 7;
  const isSaved = savedIds.has(job.id);
  return (
    <Card className={`p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 ${job.is_featured ? "border-2 border-primary/40" : ""}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
          {job.organization_logo ? <img src={job.organization_logo} alt="" className="w-full h-full object-cover rounded-lg" /> : "🏢"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">{ORG_LABEL_BN[job.organization_type] ?? "অন্যান্য"}</Badge>
            {job.is_featured && <Badge className="bg-amber-500 hover:bg-amber-500 text-xs"><Star className="w-3 h-3 mr-1" />ফিচার্ড</Badge>}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{job.organization_name}</p>
        </div>
      </div>
      <Link to="/jobs/$slug" params={{ slug: job.slug }}>
        <h3 className="font-bold text-base leading-snug mb-2 line-clamp-2 hover:text-primary">{job.title_bn}</h3>
      </Link>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.district ?? "—"}</span>
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.vacancy_count ? toBn(job.vacancy_count) + " পদ" : "—"}</span>
        {job.salary_text && <span className="flex items-center gap-1"><Wallet className="w-3 h-3" />{job.salary_text}</span>}
      </div>
      {dl !== null && (
        <div className={`text-xs font-semibold mb-3 rounded-md px-2 py-1.5 ${urgent ? "bg-red-50 text-red-700" : warn ? "bg-orange-50 text-orange-700" : "bg-muted text-muted-foreground"}`}>
          {dl < 0 ? "⏰ সময় শেষ" : `⚠️ আবেদনের শেষ: ${toBn(dl)} দিন বাকি`}
        </div>
      )}
      <div className="flex gap-2">
        <Button asChild size="sm" className="flex-1"><Link to="/jobs/$slug" params={{ slug: job.slug }}>বিস্তারিত</Link></Button>
        <Button size="sm" variant={isSaved ? "default" : "outline"} onClick={() => onToggleSave(job.id)}>
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
        </Button>
      </div>
    </Card>
  );
}

function JobsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [orgType, setOrgType] = useState<OrgType>("all");
  const [district, setDistrict] = useState<string>("all");
  const [deadline, setDeadline] = useState<Deadline>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", "all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("published_date", { ascending: false });
      return data ?? [];
    },
  });

  const { data: saved = [], refetch: refetchSaved } = useQuery({
    queryKey: ["saved-jobs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("saved_jobs").select("job_id").eq("user_id", user!.id);
      return (data ?? []).map((r) => r.job_id).filter(Boolean) as string[];
    },
  });
  const savedIds = useMemo(() => new Set(saved), [saved]);

  const toggleSave = async (jobId: string) => {
    if (!user) {
      toast.error("সেভ করতে লগইন করুন");
      return;
    }
    if (savedIds.has(jobId)) {
      await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId);
      toast.success("সরানো হয়েছে");
    } else {
      await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: jobId });
      toast.success("সেভ করা হয়েছে");
    }
    refetchSaved();
  };

  const filtered = useMemo(() => {
    const now = Date.now();
    let list = jobs.filter((j) => {
      if (orgType !== "all" && j.organization_type !== orgType) return false;
      if (district !== "all" && j.district !== district) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!j.title_bn?.toLowerCase().includes(q) && !j.organization_name?.toLowerCase().includes(q)) return false;
      }
      if (deadline !== "all" && j.application_deadline) {
        const dl = new Date(j.application_deadline).getTime();
        const limit = deadline === "week" ? 7 : 30;
        if (dl - now > limit * 86400000 || dl < now) return false;
      }
      return true;
    });
    if (sort === "deadline") {
      list = [...list].sort((a, b) => (a.application_deadline ?? "z").localeCompare(b.application_deadline ?? "z"));
    } else if (sort === "featured") {
      list = [...list].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    }
    return list;
  }, [jobs, orgType, district, search, deadline, sort]);

  const featured = jobs.filter((j) => j.is_featured).slice(0, 4);

  const resetFilters = () => {
    setSearch(""); setOrgType("all"); setDistrict("all"); setDeadline("all"); setVisible(PAGE_SIZE);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">সর্বশেষ চাকরির বিজ্ঞপ্তি</h1>
        <p className="text-muted-foreground">সরকারি, ব্যাংক, এনজিও, বেসরকারি — সব চাকরি এক জায়গায়</p>
      </header>

      {/* Filter bar */}
      <Card className="sticky top-16 z-30 p-4 mb-6 shadow-md">
        <div className="grid md:grid-cols-4 gap-3 mb-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="চাকরির নাম বা প্রতিষ্ঠান" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="all">সব জেলা</option>
            {DISTRICTS_BD.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={deadline} onChange={(e) => setDeadline(e.target.value as Deadline)}>
            <option value="all">সব শেষ তারিখ</option>
            <option value="week">এই সপ্তাহ</option>
            <option value="month">এই মাস</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {ORG_TABS.map((t) => (
              <button key={t.value} onClick={() => setOrgType(t.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${orgType === t.value ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <select className="h-8 rounded-md border border-input bg-background px-2 text-xs" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="newest">সর্বশেষ</option>
              <option value="deadline">শেষ তারিখ অনুযায়ী</option>
              <option value="featured">ফিচার্ড প্রথমে</option>
            </select>
            <Button variant="ghost" size="sm" onClick={resetFilters}>রিসেট</Button>
          </div>
        </div>
      </Card>

      {/* Featured */}
      {featured.length > 0 && orgType === "all" && !search && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500 fill-amber-500" /> ফিচার্ড চাকরি</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((j) => <JobCard key={j.id} job={j} savedIds={savedIds} onToggleSave={toggleSave} />)}
          </div>
        </section>
      )}

      {/* Job grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">সকল চাকরি ({toBn(filtered.length)})</h2>
        </div>
        {isLoading ? (
          <p className="text-center py-12 text-muted-foreground">লোড হচ্ছে...</p>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">কোনো চাকরি পাওয়া যায়নি।</Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.slice(0, visible).map((j) => <JobCard key={j.id} job={j} savedIds={savedIds} onToggleSave={toggleSave} />)}
            </div>
            {visible < filtered.length && (
              <div className="text-center mt-8">
                <Button onClick={() => setVisible((v) => v + PAGE_SIZE)} variant="outline" size="lg">আরো লোড করুন</Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* SEO copy */}
      <section className="mt-16 prose prose-sm max-w-none">
        <h2 className="text-2xl font-bold mb-4">বাংলাদেশে বিভিন্ন ধরনের চাকরি</h2>
        <div className="grid md:grid-cols-2 gap-4 not-prose">
          {ORG_TABS.slice(1).map((t) => (
            <button key={t.value} onClick={() => { setOrgType(t.value); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="text-left p-4 rounded-lg border hover:border-primary hover:bg-muted/30 transition">
              <p className="font-semibold mb-1">{t.icon} {t.label} চাকরি</p>
              <p className="text-sm text-muted-foreground">
                {t.value === "government" && "বিসিএস, পুলিশ, প্রাথমিক শিক্ষক ও অন্যান্য সরকারি পদে নিয়োগের বিজ্ঞপ্তি।"}
                {t.value === "bank" && "সরকারি ও বেসরকারি ব্যাংকের অফিসার, সিনিয়র অফিসার ও ক্যাশ পদে নিয়োগ।"}
                {t.value === "ngo" && "ব্র্যাক, ওয়ার্ল্ড ভিশন সহ দেশী-বিদেশী এনজিও-তে চাকরির সুযোগ।"}
                {t.value === "private" && "গ্রামীণফোন, স্কয়ার সহ বেসরকারি কোম্পানিতে চাকরি।"}
                {t.value === "university" && "পাবলিক ও প্রাইভেট বিশ্ববিদ্যালয়ে ফ্যাকাল্টি ও কর্মকর্তা নিয়োগ।"}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}