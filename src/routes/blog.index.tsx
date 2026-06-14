import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "ব্লগ — পরীক্ষার প্রস্তুতি ও ক্যারিয়ার গাইড | Quiz4Job" },
      { name: "description", content: "বিসিএস, ব্যাংক, প্রাইমারি পরীক্ষার প্রস্তুতি, ক্যারিয়ার গাইড ও পরীক্ষার টিপস। বাংলাদেশের সেরা চাকরির প্রস্তুতি ব্লগ।" },
      { name: "keywords", content: "বিসিএস প্রস্তুতি, ব্যাংক জব, পরীক্ষার টিপস, চাকরির খবর, BCS MCQ, online quiz Bangladesh" },
      { property: "og:title", content: "Quiz4Job ব্লগ — পরীক্ষার প্রস্তুতি গাইড" },
      { property: "og:description", content: "বিসিএস, ব্যাংক, প্রাইমারি প্রস্তুতির সম্পূর্ণ গাইড।" },
      { property: "og:url", content: "/blog" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
});

const CATEGORIES = [
  { key: "all", label: "সব" },
  { key: "bcs", label: "BCS" },
  { key: "bank", label: "ব্যাংক" },
  { key: "career", label: "ক্যারিয়ার" },
  { key: "exam_tips", label: "পরীক্ষার টিপস" },
  { key: "motivation", label: "অনুপ্রেরণা" },
  { key: "news", label: "চাকরির সংবাদ" },
];

function readTime(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

function BlogIndex() {
  const [cat, setCat] = useState("all");
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id,slug,title_bn,excerpt_bn,category,featured_image,published_at,content_bn")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(
    () => (cat === "all" ? posts : posts.filter((p) => p.category === cat)),
    [posts, cat]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-bd-green">পরীক্ষার প্রস্তুতি ও ক্যারিয়ার গাইড</h1>
        <p className="mt-2 text-muted-foreground">বিসিএস, ব্যাংক, প্রাইমারি — সব পরীক্ষার সম্পূর্ণ গাইড</p>
      </header>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
              cat === c.key
                ? "bg-bd-green text-white border-bd-green"
                : "bg-white text-foreground border-border hover:border-bd-green"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-12">লোড হচ্ছে...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">কোনো পোস্ট পাওয়া যায়নি।</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <article key={p.id} className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition group">
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="block">
                {p.featured_image && (
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={p.featured_image}
                      alt={p.title_bn}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                )}
                <div className="p-5">
                  <span className="inline-block px-2 py-0.5 rounded bg-bd-green-light text-bd-green text-xs font-bold mb-2">
                    {CATEGORIES.find((c) => c.key === p.category)?.label || p.category}
                  </span>
                  <h2 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-bd-green transition">
                    {p.title_bn}
                  </h2>
                  {p.excerpt_bn && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt_bn}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {p.published_at && formatDate(p.published_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {readTime(p.content_bn || "")} মিনিট
                    </span>
                  </div>
                  <div className="mt-3 text-bd-green text-sm font-semibold flex items-center gap-1">
                    পড়ুন <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}