import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/subscriptions")({ component: SubsPage });

type Sub = {
  id: string; user_id: string; amount: number; payment_method: string;
  transaction_id: string; bkash_number: string; payment_screenshot_url: string;
  status: string; created_at: string; admin_notes: string;
  profiles?: { full_name: string; email: string } | null;
};

function SubsPage() {
  const [tab, setTab] = useState("pending");
  const [rows, setRows] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectFor, setRejectFor] = useState<Sub | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const load = async (status: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("subscriptions")
      .select("*, profiles!subscriptions_user_id_fkey(full_name,email)")
      .eq("status", status)
      .order("created_at", { ascending: false });
    setRows((data ?? []) as any);
    setLoading(false);
  };
  useEffect(() => { load(tab); }, [tab]);

  const approve = async (s: Sub) => {
    const now = new Date();
    const expires = new Date(now); expires.setMonth(expires.getMonth() + 1);
    const { error: e1 } = await supabase.from("subscriptions").update({
      status: "verified", verified_at: now.toISOString(),
      premium_starts: now.toISOString(), premium_expires: expires.toISOString(),
    }).eq("id", s.id);
    if (e1) return toast.error(e1.message);
    await supabase.from("profiles").update({
      is_premium: true, premium_started_at: now.toISOString(), premium_expires_at: expires.toISOString(),
    }).eq("id", s.user_id);
    await supabase.from("notifications").insert({
      user_id: s.user_id, type: "success",
      title_bn: "প্রিমিয়াম সক্রিয় হয়েছে!",
      message_bn: "আপনার প্রিমিয়াম সদস্যতা সক্রিয় করা হয়েছে। এখন র‍্যাঙ্ক কুইজ দিন।",
      link: "/dashboard",
    });
    toast.success("অনুমোদিত!");
    load(tab);
  };

  const reject = async () => {
    if (!rejectFor) return;
    await supabase.from("subscriptions").update({
      status: "rejected", admin_notes: rejectReason, verified_at: new Date().toISOString(),
    }).eq("id", rejectFor.id);
    await supabase.from("notifications").insert({
      user_id: rejectFor.user_id, type: "error",
      title_bn: "পেমেন্ট প্রত্যাখ্যাত",
      message_bn: rejectReason || "আপনার পেমেন্ট যাচাই করা যায়নি।",
      link: "/premium",
    });
    toast.success("প্রত্যাখ্যাত");
    setRejectFor(null); setRejectReason("");
    load(tab);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">সাবস্ক্রিপশন ব্যবস্থাপনা</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">অপেক্ষামাণ</TabsTrigger>
          <TabsTrigger value="verified">যাচাইকৃত</TabsTrigger>
          <TabsTrigger value="rejected">প্রত্যাখ্যাত</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <Card className="p-4 overflow-x-auto">
            {loading ? <div>লোড হচ্ছে...</div> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ব্যবহারকারী</TableHead><TableHead>ইমেইল</TableHead>
                    <TableHead>পদ্ধতি</TableHead><TableHead>ট্রানজেকশন ID</TableHead>
                    <TableHead>নম্বর</TableHead><TableHead>স্ক্রিনশট</TableHead>
                    <TableHead>জমার তারিখ</TableHead><TableHead>ক্রিয়া</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.profiles?.full_name ?? "—"}</TableCell>
                      <TableCell className="text-xs">{s.profiles?.email}</TableCell>
                      <TableCell>{s.payment_method}</TableCell>
                      <TableCell className="font-mono text-xs">{s.transaction_id}</TableCell>
                      <TableCell>{s.bkash_number}</TableCell>
                      <TableCell>
                        {s.payment_screenshot_url ? (
                          <button onClick={() => setScreenshot(s.payment_screenshot_url)}>
                            <img src={s.payment_screenshot_url} className="h-10 w-10 object-cover rounded border" />
                          </button>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs">{new Date(s.created_at).toLocaleDateString("bn-BD")}</TableCell>
                      <TableCell>
                        {tab === "pending" && (
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => approve(s)}>✅ অনুমোদন</Button>
                            <Button size="sm" variant="destructive" onClick={() => setRejectFor(s)}>❌ প্রত্যাখ্যান</Button>
                          </div>
                        )}
                        {tab !== "pending" && <span className="text-xs text-muted-foreground">{s.admin_notes || "—"}</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!rows.length && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">কোন রেকর্ড নেই</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>প্রত্যাখ্যানের কারণ</DialogTitle></DialogHeader>
          <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="ট্রানজেকশন ID খুঁজে পাওয়া যায়নি..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFor(null)}>বাতিল</Button>
            <Button variant="destructive" onClick={reject}>প্রত্যাখ্যান নিশ্চিত করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!screenshot} onOpenChange={(o) => !o && setScreenshot(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>পেমেন্ট স্ক্রিনশট</DialogTitle></DialogHeader>
          {screenshot && <img src={screenshot} className="w-full rounded" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}