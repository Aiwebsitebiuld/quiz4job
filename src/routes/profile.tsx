import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DISTRICTS_BD } from "@/lib/districts";
import { bnCurrency, toBn } from "@/lib/bn";
import { Crown, ThumbsUp, Upload, ShieldCheck, Bell, User as UserIcon, Check, X as XIcon } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "প্রোফাইল — Quiz4Job" }] }),
  component: ProfilePage,
});

type Tab = "profile" | "security" | "notifications";

function ProfilePage() {
  const { user, profile, isPremium, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  if (loading || !user || !profile) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">লোড হচ্ছে…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">আমার প্রোফাইল</h1>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <TabBtn active={tab === "profile"} onClick={() => setTab("profile")} icon={<UserIcon className="w-4 h-4" />} label="প্রোফাইল" />
          <TabBtn active={tab === "security"} onClick={() => setTab("security")} icon={<ShieldCheck className="w-4 h-4" />} label="নিরাপত্তা" />
          <TabBtn active={tab === "notifications"} onClick={() => setTab("notifications")} icon={<Bell className="w-4 h-4" />} label="বিজ্ঞপ্তি" />
        </div>

        {tab === "profile" && <ProfileTab profile={profile} isPremium={isPremium} onSaved={() => qc.invalidateQueries()} />}
        {tab === "security" && <SecurityTab />}
        {tab === "notifications" && <NotificationsTab profile={profile} onSaved={() => qc.invalidateQueries()} />}

        {/* Prize history */}
        <PrizeHistory userId={user.id} totalAmount={(profile as any).total_prize_amount ?? 0} />
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px transition ${
        active ? "border-bd-green text-bd-green" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}>
      {icon}{label}
    </button>
  );
}

function ProfileTab({ profile, isPremium, onSaved }: { profile: any; isPremium: boolean; onSaved: () => void }) {
  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    username: profile.username ?? "",
    phone: profile.phone ?? "",
    district: profile.district ?? "",
    bio: profile.bio ?? "",
  });
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initial = (form.full_name || profile.email || "U").trim().charAt(0).toUpperCase();

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("ছবি ৫MB এর কম হতে হবে"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage.from("avatars")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (sErr) throw sErr;
      setAvatarUrl(signed.signedUrl);
      await supabase.from("profiles").update({ avatar_url: signed.signedUrl }).eq("id", profile.id);
      toast.success("অ্যাভাটার আপডেট হয়েছে");
      onSaved();
    } catch (e: any) {
      toast.error(e.message ?? "আপলোড ব্যর্থ হয়েছে");
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name.trim(),
      username: form.username.trim(),
      phone: form.phone.trim() || null,
      district: form.district || null,
      bio: form.bio.trim() || null,
    }).eq("id", profile.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("প্রোফাইল সংরক্ষিত হয়েছে");
    onSaved();
  };

  const eligible = isPremium && profile.facebook_liked;
  const reason = !isPremium ? "প্রিমিয়াম সদস্য নন" : !profile.facebook_liked ? "Facebook পেজ লাইক করেননি" : "";

  return (
    <div className="bg-white rounded-xl border p-5 space-y-5">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-bd-green/10 grid place-items-center overflow-hidden text-3xl font-bold text-bd-green">
          {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initial}
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" hidden
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-slate-50">
            <Upload className="w-4 h-4" /> {uploading ? "আপলোড হচ্ছে…" : "ছবি পরিবর্তন"}
          </button>
          <p className="text-xs text-muted-foreground mt-1">JPG/PNG · সর্বোচ্চ ৫MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="পুরো নাম">
          <input className="w-full h-10 rounded-md border px-3" value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} />
        </Field>
        <Field label="ইউজারনেম">
          <input className="w-full h-10 rounded-md border px-3" value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })} maxLength={50} />
        </Field>
        <Field label="ইমেইল">
          <input className="w-full h-10 rounded-md border px-3 bg-slate-50" value={profile.email ?? ""} disabled />
        </Field>
        <Field label="ফোন">
          <input className="w-full h-10 rounded-md border px-3" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} placeholder="01XXXXXXXXX" />
        </Field>
        <Field label="জেলা">
          <select className="w-full h-10 rounded-md border px-3 bg-white" value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}>
            <option value="">নির্বাচন করুন</option>
            {DISTRICTS_BD.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="বায়ো" full>
          <textarea className="w-full rounded-md border px-3 py-2 min-h-20" value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={500} />
        </Field>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="px-5 py-2.5 rounded-lg bg-bd-green text-white font-medium hover:bg-bd-green/90 disabled:opacity-60">
        {saving ? "সংরক্ষণ হচ্ছে…" : "পরিবর্তন সংরক্ষণ করুন"}
      </button>

      {/* Social verification */}
      <div className="border-t pt-5 space-y-3">
        <h3 className="font-semibold">সামাজিক যাচাইকরণ</h3>
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
          <span className="flex items-center gap-2 text-sm">
            {profile.facebook_liked
              ? <Check className="w-4 h-4 text-green-600" />
              : <XIcon className="w-4 h-4 text-red-500" />}
            Facebook পেজ লাইক
          </span>
          {!profile.facebook_liked && (
            <a href="https://facebook.com/quiz4job" target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">
              <ThumbsUp className="w-3.5 h-3.5" /> এখনই লাইক করুন
            </a>
          )}
        </div>
        <div className={`flex items-center justify-between p-3 rounded-lg ${eligible ? "bg-green-50" : "bg-amber-50"}`}>
          <span className="text-sm flex items-center gap-2">
            {eligible ? <Crown className="w-4 h-4 text-amber-600" /> : <XIcon className="w-4 h-4 text-amber-700" />}
            পুরস্কারের যোগ্যতা: <strong>{eligible ? "যোগ্য ✓" : "অযোগ্য"}</strong>
          </span>
          {!eligible && <span className="text-xs text-amber-800">কারণ: {reason}</span>}
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [saving, setSaving] = useState(false);

  const update = async () => {
    if (pwd.length < 8) { toast.error("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে"); return; }
    if (pwd !== pwd2) { toast.error("পাসওয়ার্ড মিলছে না"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("পাসওয়ার্ড আপডেট হয়েছে");
    setPwd(""); setPwd2("");
  };

  return (
    <div className="bg-white rounded-xl border p-5 space-y-4 max-w-md">
      <h3 className="font-semibold">পাসওয়ার্ড পরিবর্তন</h3>
      <Field label="নতুন পাসওয়ার্ড">
        <input type="password" className="w-full h-10 rounded-md border px-3" value={pwd}
          onChange={(e) => setPwd(e.target.value)} />
      </Field>
      <Field label="পাসওয়ার্ড নিশ্চিত করুন">
        <input type="password" className="w-full h-10 rounded-md border px-3" value={pwd2}
          onChange={(e) => setPwd2(e.target.value)} />
      </Field>
      <button onClick={update} disabled={saving}
        className="px-5 py-2.5 rounded-lg bg-bd-green text-white font-medium hover:bg-bd-green/90 disabled:opacity-60">
        {saving ? "আপডেট হচ্ছে…" : "পাসওয়ার্ড আপডেট করুন"}
      </button>
    </div>
  );
}

function NotificationsTab({ profile, onSaved }: { profile: any; onSaved: () => void }) {
  const [enabled, setEnabled] = useState(!!profile.email_notifications);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ email_notifications: enabled }).eq("id", profile.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("সংরক্ষিত হয়েছে");
    onSaved();
  };

  return (
    <div className="bg-white rounded-xl border p-5 space-y-4 max-w-md">
      <h3 className="font-semibold">বিজ্ঞপ্তি সেটিংস</h3>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="w-4 h-4" />
        <span className="text-sm">ইমেইলে বিজ্ঞপ্তি গ্রহণ করুন (নতুন কুইজ, পুরস্কার, ঘোষণা)</span>
      </label>
      <button onClick={save} disabled={saving}
        className="px-5 py-2.5 rounded-lg bg-bd-green text-white font-medium hover:bg-bd-green/90 disabled:opacity-60">
        {saving ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
      </button>
    </div>
  );
}

function PrizeHistory({ userId, totalAmount }: { userId: string; totalAmount: number }) {
  const { data } = useQuery({
    queryKey: ["prize-history", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("prize_records")
        .select("id, month, year, position, prize_amount, status, paid_at, payment_method")
        .eq("user_id", userId)
        .order("year", { ascending: false })
        .order("month", { ascending: false });
      return data ?? [];
    },
  });

  const BN_MONTHS = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];

  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-bold text-lg">জেতা পুরস্কার</h2>
        <div className="text-sm">মোট পুরস্কার: <strong className="text-amber-600">{bnCurrency(totalAmount)}</strong></div>
      </div>
      {data && data.length > 0 ? (
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground border-b">
            <tr><th className="py-2">মাস</th><th className="py-2">অবস্থান</th><th className="py-2">পুরস্কার</th><th className="py-2">পরিশোধ স্ট্যাটাস</th></tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2">{BN_MONTHS[(p.month ?? 1) - 1]} {toBn(p.year)}</td>
                <td className="py-2">#{toBn(p.position ?? 0)}</td>
                <td className="py-2 font-medium text-amber-700">{bnCurrency(p.prize_amount ?? 0)}</td>
                <td className="py-2">
                  {p.status === "paid"
                    ? <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">পরিশোধিত</span>
                    : <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs">{p.status ?? "অপেক্ষমাণ"}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-muted-foreground">এখনও কোনো পুরস্কার জেতেননি। কুইজ দিন এবং প্রিমিয়াম হয়ে পুরস্কার জিতুন!</p>
      )}
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}