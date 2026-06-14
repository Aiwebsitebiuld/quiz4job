import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Facebook } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ | Quiz4Job" },
      { name: "description", content: "Quiz4Job-এর সাথে যোগাযোগ করুন — ইমেইল, ফোন, Facebook ও বার্তার মাধ্যমে।" },
      { property: "og:title", content: "যোগাযোগ — Quiz4Job" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("আপনার বার্তা পাঠানো হয়েছে! আমরা শীঘ্রই উত্তর দেবো।");
    setName(""); setEmail(""); setMsg("");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-bd-green text-center">যোগাযোগ করুন</h1>
      <p className="mt-2 text-center text-muted-foreground">আমাদের সাথে যোগাযোগ করতে নিচের যেকোনো মাধ্যম ব্যবহার করুন।</p>
      <div className="mt-10 grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[
            { icon: Mail, label: "ইমেইল", value: "support@quiz4job.com" },
            { icon: Phone, label: "ফোন", value: "+880 1767-091490" },
            { icon: MapPin, label: "ঠিকানা", value: "ঢাকা, বাংলাদেশ" },
            { icon: Facebook, label: "Facebook", value: "facebook.com/quiz4job" },
          ].map((c) => (
            <div key={c.label} className="flex items-start gap-3 bg-card border border-border rounded-lg p-4">
              <c.icon className="w-5 h-5 text-bd-green mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="font-semibold">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={submit} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold">আপনার নাম</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" />
          </div>
          <div>
            <label className="text-sm font-semibold">ইমেইল</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" />
          </div>
          <div>
            <label className="text-sm font-semibold">বার্তা</label>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} required rows={5} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" />
          </div>
          <button type="submit" className="w-full px-4 py-2.5 rounded-lg bg-bd-green text-white font-bold hover:bg-bd-green-dark transition">
            পাঠান
          </button>
        </form>
      </div>
    </div>
  );
}