import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "";

const STATIC_PATHS = [
  "/",
  "/quiz",
  "/jobs",
  "/leaderboard",
  "/prizes",
  "/premium",
  "/blog",
  "/faq",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/login",
  "/signup",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [postsRes, jobsRes, catsRes] = await Promise.all([
          supabase.from("blog_posts").select("slug,published_at").eq("is_published", true),
          supabase.from("jobs").select("slug,created_at").eq("is_active", true),
          supabase.from("quiz_categories").select("slug").eq("is_active", true),
        ]);

        const urls: { loc: string; lastmod?: string | null }[] = [
          ...STATIC_PATHS.map((p) => ({ loc: p })),
          ...((catsRes.data ?? []).map((c) => ({ loc: `/quiz/${c.slug}` }))),
          ...((jobsRes.data ?? []).map((j) => ({ loc: `/jobs/${j.slug}`, lastmod: j.created_at }))),
          ...((postsRes.data ?? []).map((p) => ({ loc: `/blog/${p.slug}`, lastmod: p.published_at }))),
        ];

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls.map((u) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${u.loc}</loc>`,
              u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : null,
              `  </url>`,
            ].filter(Boolean).join("\n")
          ),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});