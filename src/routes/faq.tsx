import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "কুইজ সম্পর্কে",
    items: [
      { q: "প্রতিদিন কতটি বিনামূল্যে কুইজ দিতে পারবো?", a: "প্রতিদিন ৫টি কুইজ সম্পূর্ণ বিনামূল্যে দেওয়া যাবে।" },
      { q: "র‍্যান্ক কুইজ কী?", a: "র‍্যান্ক কুইজ হলো প্রতিযোগিতামূলক কুইজ যা লিডারবোর্ডে স্কোর যোগ করে। শুধু প্রিমিয়াম সদস্যরা র‍্যান্ক কুইজ দিতে পারবেন।" },
      { q: "কুইজে সময়সীমা কত?", a: "প্রতিটি প্রশ্নের জন্য ৩০ সেকেন্ড সময় বরাদ্দ। মোট কুইজ ১০-২০ প্রশ্নের।" },
    ],
  },
  {
    title: "পুরস্কার সম্পর্কে",
    items: [
      { q: "পুরস্কার পেতে কী করতে হবে?", a: "প্রিমিয়াম সদস্য হতে হবে + আমাদের Facebook পেজ লাইক করতে হবে।" },
      { q: "পুরস্কার কীভাবে পাঠানো হয়?", a: "bKash বা Nagad-এ সরাসরি পাঠানো হয়।" },
      { q: "কখন পুরস্কার পাবো?", a: "প্রতি মাসের ৩-৫ তারিখের মধ্যে পাঠানো হয়।" },
      { q: "ফ্রি ইউজাররা কি পুরস্কার পাবে?", a: "না, শুধু প্রিমিয়াম ইউজাররা পুরস্কারের জন্য যোগ্য।" },
    ],
  },
  {
    title: "পেমেন্ট সম্পর্কে",
    items: [
      { q: "কীভাবে প্রিমিয়াম হবো?", a: "bKash বা Nagad-এ ৳১০ পাঠিয়ে ট্রানজেকশন ID জমা দিন। অ্যাডমিন যাচাইয়ের পর প্রিমিয়াম সক্রিয় হবে।" },
      { q: "একবার কি সারাজীবনের জন্য প্রিমিয়াম হওয়া যাবে?", a: "না, প্রতি মাসে ৳১০ দিয়ে রিনিউ করতে হবে।" },
      { q: "পেমেন্ট না হলে কী করবো?", a: "ট্রানজেকশন ID ও স্ক্রিনশট নিয়ে আমাদের যোগাযোগ করুন।" },
    ],
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "সাধারণ প্রশ্নোত্তর (FAQ) | Quiz4Job" },
      { name: "description", content: "Quiz4Job সম্পর্কে সাধারণ প্রশ্নোত্তর — কুইজ, পুরস্কার, পেমেন্ট ও প্রিমিয়াম সদস্যতা।" },
      { property: "og:title", content: "FAQ — Quiz4Job" },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: GROUPS.flatMap((g) =>
            g.items.map((i) => ({
              "@type": "Question",
              name: i.q,
              acceptedAnswer: { "@type": "Answer", text: i.a },
            }))
          ),
        }),
      },
    ],
  }),
  component: FAQPage,
});

function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-bd-green">সাধারণ প্রশ্নোত্তর</h1>
        <p className="mt-2 text-muted-foreground">আপনার যেসব প্রশ্ন আমরা প্রায়ই পাই</p>
      </header>

      {GROUPS.map((g) => (
        <section key={g.title} className="mb-8">
          <h2 className="text-xl font-bold mb-3 text-foreground">{g.title}</h2>
          <Accordion type="single" collapsible className="bg-card rounded-xl border border-border px-4">
            {g.items.map((it, i) => (
              <AccordionItem key={i} value={`${g.title}-${i}`} className="last:border-b-0">
                <AccordionTrigger className="text-left font-semibold">{it.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}
    </div>
  );
}