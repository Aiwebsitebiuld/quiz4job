import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, Target, Heart, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমাদের সম্পর্কে | Quiz4Job" },
      { name: "description", content: "Quiz4Job হলো বাংলাদেশের অন্যতম জনপ্রিয় চাকরির কুইজ প্ল্যাটফর্ম। আমাদের লক্ষ্য, মিশন ও গল্প জানুন।" },
      { property: "og:title", content: "আমাদের সম্পর্কে — Quiz4Job" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-bd-green text-center">আমাদের সম্পর্কে</h1>
      <p className="mt-4 text-center text-muted-foreground text-lg">
        Quiz4Job — বাংলাদেশের চাকরি প্রার্থীদের জন্য তৈরি একটি আধুনিক কুইজ প্ল্যাটফর্ম।
      </p>
      <div className="mt-10 grid sm:grid-cols-2 gap-6">
        {[
          { icon: Target, title: "আমাদের মিশন", text: "প্রতিটি চাকরি প্রার্থীকে সহজ, মজাদার ও কার্যকর প্রস্তুতির সুযোগ দেওয়া।" },
          { icon: Heart, title: "মূল্যবোধ", text: "সততা, গুণগত মান এবং শিক্ষার্থীদের সাফল্যকে সবার আগে রাখা।" },
          { icon: Trophy, title: "পুরস্কার", text: "প্রতি মাসে ৳৩,০০০ পর্যন্ত নগদ পুরস্কার সেরা পারফর্মারদের জন্য।" },
          { icon: Users, title: "কমিউনিটি", text: "হাজারো শিক্ষার্থীর সক্রিয় কমিউনিটি।" },
        ].map((b) => (
          <div key={b.title} className="bg-card border border-border rounded-xl p-6">
            <b.icon className="w-8 h-8 text-bd-green" />
            <h2 className="mt-3 font-bold text-lg">{b.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 prose prose-lg max-w-none">
        <h2>আমাদের গল্প</h2>
        <p>Quiz4Job শুরু হয়েছিল একটি সহজ ধারণা থেকে — বাংলাদেশের চাকরি প্রার্থীদের জন্য প্রস্তুতিকে আরও আকর্ষণীয় ও পুরস্কারমূলক করা।</p>
      </div>
      <div className="mt-8 text-center">
        <Link to="/quiz" className="inline-block px-6 py-3 rounded-lg bg-bd-green text-white font-bold hover:bg-bd-green-dark transition">
          কুইজ শুরু করুন
        </Link>
      </div>
    </div>
  );
}