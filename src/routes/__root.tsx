import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Quiz4Job — কুইজ দিন, চাকরি পান, পুরস্কার জিতুন!" },
      { name: "description", content: "বাংলাদেশের #১ চাকরির কুইজ প্ল্যাটফর্ম। বিসিএস, ব্যাংক, প্রাইমারি প্রস্তুতি।" },
      { property: "og:title", content: "Quiz4Job — কুইজ দিন, চাকরি পান, পুরস্কার জিতুন!" },
      { property: "og:description", content: "বাংলাদেশের #১ চাকরির কুইজ প্ল্যাটফর্ম। বিসিএস, ব্যাংক, প্রাইমারি প্রস্তুতি।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Quiz4Job — কুইজ দিন, চাকরি পান, পুরস্কার জিতুন!" },
      { name: "twitter:description", content: "বাংলাদেশের #১ চাকরির কুইজ প্ল্যাটফর্ম। বিসিএস, ব্যাংক, প্রাইমারি প্রস্তুতি।" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a23672ce-651b-4d59-8115-e549ac9f8403/id-preview-caf561dc--d2314876-a3cf-46f3-a7b2-c7db8e355a57.lovable.app-1781467312665.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a23672ce-651b-4d59-8115-e549ac9f8403/id-preview-caf561dc--d2314876-a3cf-46f3-a7b2-c7db8e355a57.lovable.app-1781467312665.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Quiz4Job",
          url: "https://quiz4job.com",
          inLanguage: "bn-BD",
          description:
            "বাংলাদেশের #১ চাকরির কুইজ প্ল্যাটফর্ম। বিসিএস, ব্যাংক, প্রাইমারি প্রস্তুতি।",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://quiz4job.com/quiz?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Quiz4Job",
          url: "https://quiz4job.com",
          logo: "https://quiz4job.com/favicon.ico",
          sameAs: [],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-F6ETJZVSBK"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-F6ETJZVSBK');
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideChrome = ["/login", "/signup", "/forgot-password", "/reset-password", "/admin"].some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  return (
    <QueryClientProvider client={queryClient}>
      {hideChrome ? (
        <Outlet />
      ) : (
        <div className="min-h-screen flex flex-col bg-background">
          <SiteHeader />
          <main className="flex-1 pb-16 lg:pb-0">
            <Outlet />
          </main>
          <SiteFooter />
          <MobileBottomNav />
        </div>
      )}
    </QueryClientProvider>
  );
}
