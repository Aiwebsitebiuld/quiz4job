import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toBn } from "@/lib/bn";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Calendar, Users, Wallet, MapPin, Bookmark, ExternalLink, Eye, Share2, Brain } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export const Route = createFileRoute("/jobs/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase.from("jobs").select("*").eq("slug", params.slug).maybeSingle();
    if (!data) throw notFound();
    return { job: data };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.job.title_bn ?? "চাকরি"} — Quiz4Job` },
      { name: "description", content: `${loaderData?.job.organization_name ?? ""} - ${loaderData?.job.title_bn ?? ""}` },
      { property: "og:title", content: loaderData?.job.title_bn ?? "চাকরি" },
      { property: "og:description", content: loaderData?.job.organization_name ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="container mx-auto py-20 text-center">
      <p className="text-lg mb-4">এই চাকরিটি পাওয়া যায়নি।</p>
      <Button asChild><Link to="/jobs">চাকরির বোর্ডে ফিরুন</Link></Button>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="container mx-auto py-20 text-center">
      <p className="mb-4">কিছু সমস্যা হয়েছে।</p>
      <Button onClick={reset}>আবার চেষ্টা করুন</Button>
    </div>
  ),
  component: JobDetailPage,
});

const ORG_LABEL_BN: Record<string, string> = {
  government: "সরকারি", bank: "ব্যাংক", ngo: "এনজিও", private: "বেসরকারি", university: "বিশ্ববিদ্যালয়",
};
const ORG_QUIZ_SLUG: Record<string, string> = {
  government: "bcs", bank: "bank", ngo: "general-knowledge", private: "english", university: "general-knowledge",
};

function daysLeft(d: string | null) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}
function hoursLeft(d: string | null) {
  if (!d) return 0;
  return Math.max(0, Math.floor(((new Date(d).getTime() - Date.now()) % 86400000) / 3600000));
}

function JobDetailPage() {
  const { job } = Route.useLoaderData();
  const { user } = useAuth();
  const dl = daysLeft(job.application_deadline);
  const orgLabel = ORG_LABEL_BN[job.organization_type ?? ""] ?? "অন্যান্য";
  const quizSlug = ORG_QUIZ_SLUG[job.organization_type ?? ""] ?? "general-knowledge";

  // Increment views once
  useEffect(() => {
    supabase.from("jobs").update({ views_count: (job.views_count ?? 0) + 1 }).eq("id", job.id).then(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.id]);

  const { data: relatedQuiz } = useQuery({
    queryKey: ["quiz-cat", quizSlug],
    queryFn: async () => {
      const { data } = await supabase.from("quiz_categories").select("*").eq("slug", quizSlug).maybeSingle();
      return data;
    },
  });

  const { data: related = [] } = useQuery({
    queryKey: ["related-jobs", job.id, job.organization_type],
    queryFn: async () => {
      const { data } = await supabase
        .from("jobs").select("*")
        .eq("is_active", true).eq("organization_type", job.organization_type)
        .neq("id", job.id).limit(4);
      return data ?? [];
    },
  });

  const { data: isSaved, refetch: refetchSaved } = useQuery({
    queryKey: ["is-saved", job.id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("saved_jobs").select("id").eq("user_id", user!.id).eq("job_id", job.id).maybeSingle();
      return !!data;
    },
  });

  const toggleSave = async () => {
    if (!user) { toast.error("সেভ করতে লগইন করুন"); return; }
    if (isSaved) {
      await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", job.id);
      toast.success("সরানো হয়েছে");
    } else {
      await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: job.id });
      toast.success("সেভ করা হয়েছে");
    }
    refetchSaved();
  };

  const share = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "width=600,height=400");
  };

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title_bn,
    description: job.description_bn ?? "",
    datePosted: job.published_date,
    validThrough: job.application_deadline,
    employmentType: "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: job.organization_name },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.district, addressCountry: "BD" } },
    baseSalary: job.salary_min ? { "@type": "MonetaryAmount", currency: "BDT", value: { "@type": "QuantitativeValue", minValue: job.salary_min, maxValue: job.salary_max, unitText: "MONTH" } } : undefined,
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/jobs">চাকরির বোর্ড</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/jobs">{orgLabel}</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage className="line-clamp-1">{job.title_bn}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-muted flex items-center justify-center text-3xl shrink-0">
            {job.organization_logo ? <img src={job.organization_logo} alt={job.organization_name} className="w-full h-full object-cover rounded-xl" /> : "🏢"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary">{orgLabel}</Badge>
              {job.is_featured && <Badge className="bg-amber-500 hover:bg-amber-500">⭐ ফিচার্ড</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{job.title_bn}</h1>
            <p className="text-muted-foreground">{job.organization_name}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
              {job.published_date && <span>প্রকাশিত: {new Date(job.published_date).toLocaleDateString("bn-BD")}</span>}
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{toBn(job.views_count ?? 0)} বার দেখা</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Key info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="p-4"><Calendar className="w-5 h-5 text-primary mb-2" /><p className="text-xs text-muted-foreground">আবেদনের শেষ</p><p className="font-semibold text-sm">{job.application_deadline ? new Date(job.application_deadline).toLocaleDateString("bn-BD") : "—"}</p></Card>
        <Card className="p-4"><Users className="w-5 h-5 text-primary mb-2" /><p className="text-xs text-muted-foreground">পদসংখ্যা</p><p className="font-semibold text-sm">{job.vacancy_count ? toBn(job.vacancy_count) : "—"}</p></Card>
        <Card className="p-4"><Wallet className="w-5 h-5 text-primary mb-2" /><p className="text-xs text-muted-foreground">বেতন</p><p className="font-semibold text-xs">{job.salary_text ?? "আলোচনা সাপেক্ষ"}</p></Card>
        <Card className="p-4"><MapPin className="w-5 h-5 text-primary mb-2" /><p className="text-xs text-muted-foreground">স্থান</p><p className="font-semibold text-sm">{job.location_bn ?? job.district ?? "—"}</p></Card>
      </div>

      {/* Deadline countdown */}
      {dl !== null && dl >= 0 && dl <= 7 && (
        <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <p className="font-bold text-red-700 text-center">
            ⚠️ আবেদনের সময় শেষ হচ্ছে: {toBn(dl)} দিন {toBn(hoursLeft(job.application_deadline))} ঘণ্টা বাকি
          </p>
        </Card>
      )}

      {/* Description */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">চাকরির বিবরণ</h2>
        <div className="prose prose-sm max-w-none [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-bold [&_p]:mb-3" dangerouslySetInnerHTML={{ __html: job.description_bn ?? "" }} />
        {(job.education_required || job.experience_required) && (
          <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            {job.education_required && <div><p className="text-xs text-muted-foreground mb-1">শিক্ষাগত যোগ্যতা</p><p className="font-medium">{job.education_required}</p></div>}
            {job.experience_required && <div><p className="text-xs text-muted-foreground mb-1">অভিজ্ঞতা</p><p className="font-medium">{job.experience_required}</p></div>}
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        {job.application_url ? (
          <Button asChild size="lg" className="flex-1 min-w-[200px]">
            <a href={job.application_url} target="_blank" rel="noopener noreferrer">আবেদন করুন <ExternalLink className="w-4 h-4" /></a>
          </Button>
        ) : (
          <Button size="lg" disabled className="flex-1">আবেদন লিংক নেই</Button>
        )}
        <Button size="lg" variant="outline" onClick={toggleSave}><Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} /> {isSaved ? "সেভড" : "সেভ করুন"}</Button>
        <Button size="lg" variant="outline" onClick={share}><Share2 className="w-4 h-4" /> শেয়ার</Button>
      </div>

      {/* Related quiz */}
      {relatedQuiz && (
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
              {relatedQuiz.icon ?? "🧠"}
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">এই চাকরির জন্য প্রস্তুতি নিন:</p>
              <h3 className="text-lg font-bold mb-1">{relatedQuiz.name_bn}</h3>
              <p className="text-sm text-muted-foreground mb-3">{relatedQuiz.description_bn}</p>
              <Button asChild><Link to="/quiz"><Brain className="w-4 h-4" /> এখনই কুইজ দিন</Link></Button>
            </div>
          </div>
        </Card>
      )}

      {/* Related jobs */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">একই ধরনের চাকরি</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {related.map((r) => {
              const rdl = daysLeft(r.application_deadline);
              return (
                <Link key={r.id} to="/jobs/$slug" params={{ slug: r.slug }} className="block">
                  <Card className="p-4 hover:shadow-md transition h-full">
                    <p className="text-xs text-muted-foreground mb-1">{r.organization_name}</p>
                    <h3 className="font-semibold mb-2 line-clamp-2">{r.title_bn}</h3>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{r.district}</span>
                      {rdl !== null && <span className={rdl <= 3 ? "text-red-600 font-semibold" : ""}>{rdl < 0 ? "শেষ" : `${toBn(rdl)} দিন বাকি`}</span>}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}