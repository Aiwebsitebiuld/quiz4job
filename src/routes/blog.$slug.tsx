import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, ArrowRight, Trophy } from "lucide-react";

async function fetchPost(slug: string) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound();
  return data;
}

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => fetchPost(params.slug),
  head: ({ loaderData, params }) => {
    const p = loaderData;
    const title = p?.seo_title_bn || `${p?.title_bn} | Quiz4Job ব্লগ`;
    const desc = p?.seo_desc_bn || p?.excerpt_bn || "Quiz4Job ব্লগ পোস্ট";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: p?.title_bn },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${params.slug}` },
        ...(p?.featured_image ? [{ property: "og:image", content: p.featured_image }] : []),
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: p
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: p.title_bn,
                description: desc,
                image: p.featured_image,
                datePublished: p.published_at,
                dateModified: p.published_at,
                author: { "@type": "Organization", name: "Quiz4Job" },
                publisher: {
                  "@type": "Organization",
                  name: "Quiz4Job",
                  logo: { "@type": "ImageObject", url: "/favicon.ico" },
                },
                mainEntityOfPage: `/blog/${params.slug}`,
              }),
            },
          ]
        : [],
    };
  },
  component: BlogPost,
  notFoundComponent: () => (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">পোস্ট পাওয়া যায়নি</h1>
      <Link to="/blog" className="text-bd-green underline mt-4 inline-block">সব পোস্ট দেখুন</Link>
    </div>
  ),
});

function BlogPost() {
  const post = Route.useLoaderData();
  const { data: related = [] } = useQuery({
    queryKey: ["blog-related", post.category, post.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id,slug,title_bn,featured_image,published_at")
        .eq("is_published", true)
        .eq("category", post.category ?? "")
        .neq("id", post.id)
        .order("published_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
  });

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/blog" className="text-sm text-bd-green hover:underline">← ব্লগে ফিরুন</Link>
      <header className="mt-4 mb-6">
        <span className="inline-block px-2 py-0.5 rounded bg-bd-green-light text-bd-green text-xs font-bold mb-3">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">{post.title_bn}</h1>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.published_at && new Date(post.published_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Quiz4Job টিম</span>
        </div>
      </header>

      {post.featured_image && (
        <img src={post.featured_image} alt={post.title_bn} className="w-full rounded-xl mb-8" />
      )}

      <div
        className="prose prose-lg max-w-none prose-headings:text-bd-green prose-p:text-foreground/80 prose-a:text-bd-green"
        dangerouslySetInnerHTML={{ __html: post.content_bn || "" }}
      />

      <div className="mt-10 rounded-2xl bg-gradient-to-br from-bd-green to-bd-green-dark text-white p-6 text-center">
        <Trophy className="w-10 h-10 mx-auto mb-2" />
        <h3 className="text-xl font-bold">এই বিষয়ে কুইজ দিন!</h3>
        <p className="text-sm opacity-90 mt-1">নিজের প্রস্তুতি যাচাই করুন এবং পুরস্কার জিতুন।</p>
        <Link to="/quiz" className="inline-block mt-4 px-5 py-2.5 rounded-lg bg-white text-bd-green font-bold hover:bg-white/90 transition">
          এখনই কুইজ দিন <ArrowRight className="inline w-4 h-4" />
        </Link>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">সম্পর্কিত পোস্ট</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link key={r.id} to="/blog/$slug" params={{ slug: r.slug }} className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition">
                {r.featured_image && <img src={r.featured_image} alt="" className="aspect-video w-full object-cover" />}
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2">{r.title_bn}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}