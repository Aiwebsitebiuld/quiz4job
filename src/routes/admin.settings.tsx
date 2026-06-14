import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

const SECTIONS: Record<string, { key: string; label: string }[]> = {
  general: [
    { key: "app_name", label: "অ্যাপ নাম" },
    { key: "app_tagline", label: "ট্যাগলাইন" },
    { key: "facebook_url", label: "Facebook URL" },
    { key: "youtube_url", label: "YouTube URL" },
  ],
  prizes: [
    { key: "prize_first", label: "১ম পুরস্কার (৳)" },
    { key: "prize_second", label: "২য় পুরস্কার (৳)" },
    { key: "prize_third", label: "৩য় পুরস্কার (৳)" },
  ],
  payment: [
    { key: "bkash_number", label: "bKash নম্বর" },
    { key: "nagad_number", label: "Nagad নম্বর" },
  ],
  limits: [
    { key: "free_daily_limit", label: "দৈনিক ফ্রি কুইজ সীমা" },
    { key: "min_quizzes_for_prize", label: "পুরস্কারের জন্য ন্যূনতম কুইজ" },
  ],
};

function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("site_settings").select("setting_key,setting_value").then(({ data }) => {
      const m: Record<string, string> = {};
      (data ?? []).forEach((r: any) => { m[r.setting_key] = r.setting_value ?? ""; });
      setValues(m);
    });
  }, []);

  const save = async (section: string) => {
    const items = SECTIONS[section];
    const updates = items.map((it) =>
      supabase.from("site_settings").upsert(
        { setting_key: it.key, setting_value: values[it.key] ?? "", updated_at: new Date().toISOString() },
        { onConflict: "setting_key" },
      ),
    );
    const results = await Promise.all(updates);
    const err = results.find((r) => r.error);
    if (err?.error) return toast.error(err.error.message);
    toast.success("সংরক্ষিত");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">সেটিংস</h1>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">সাধারণ</TabsTrigger>
          <TabsTrigger value="prizes">পুরস্কার</TabsTrigger>
          <TabsTrigger value="payment">পেমেন্ট</TabsTrigger>
          <TabsTrigger value="limits">সীমা</TabsTrigger>
        </TabsList>
        {Object.entries(SECTIONS).map(([section, items]) => (
          <TabsContent key={section} value={section}>
            <Card className="p-5 space-y-3">
              {items.map((it) => (
                <div key={it.key}>
                  <Label>{it.label}</Label>
                  <Input value={values[it.key] ?? ""} onChange={(e) => setValues({ ...values, [it.key]: e.target.value })} />
                </div>
              ))}
              <Button onClick={() => save(section)}>সংরক্ষণ করুন</Button>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}