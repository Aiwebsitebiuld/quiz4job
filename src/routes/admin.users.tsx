import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { adminFetchUsers } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { toBn } from "@/lib/bn";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");
  const [premiumDialog, setPremiumDialog] = useState<any | null>(null);
  const [tier, setTier] = useState<"basic" | "pro">("basic");
  const [days, setDays] = useState(30);
  const fetchUsers = useServerFn(adminFetchUsers);

  const load = async () => {
    try {
      const data = await fetchUsers({ data: { q } });
      setRows(data ?? []);
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q]);

  const toggleAdmin = async (u: any) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", u.id);
    if (error) return toast.error(error.message);
    toast.success("ভূমিকা পরিবর্তিত");
    load();
  };
  const toggleActive = async (u: any) => {
    await supabase.from("profiles").update({ is_active: !u.is_active }).eq("id", u.id);
    load();
  };

  const grantPremium = async () => {
    if (!premiumDialog) return;
    const expires = new Date(Date.now() + days * 86400000).toISOString();
    const { error } = await supabase.from("profiles").update({
      is_premium: true,
      premium_tier: tier,
      premium_started_at: new Date().toISOString(),
      premium_expires_at: expires,
    }).eq("id", premiumDialog.id);
    if (error) return toast.error(error.message);
    toast.success("প্রিমিয়াম সক্রিয় করা হয়েছে");
    setPremiumDialog(null);
    load();
  };

  const revokePremium = async (u: any) => {
    if (!confirm(`${u.full_name}-এর প্রিমিয়াম বাতিল করবেন?`)) return;
    const { error } = await supabase.from("profiles").update({
      is_premium: false,
      premium_tier: "free",
      premium_expires_at: null,
    }).eq("id", u.id);
    if (error) return toast.error(error.message);
    toast.success("প্রিমিয়াম বাতিল");
    load();
  };

  const filtered = useMemo(() => {
    if (filter === "free") return rows.filter((u) => !u.is_premium || (u.premium_expires_at && new Date(u.premium_expires_at) < new Date()));
    if (filter === "premium") return rows.filter((u) => u.is_premium && (!u.premium_expires_at || new Date(u.premium_expires_at) > new Date()));
    return rows;
  }, [rows, filter]);

  const freeCount = rows.filter((u) => !u.is_premium).length;
  const premiumCount = rows.length - freeCount;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">ব্যবহারকারী</h1>
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="নাম বা ইমেইল খুঁজুন..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
        <div className="flex gap-2">
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>সব ({toBn(rows.length)})</Button>
          <Button size="sm" variant={filter === "free" ? "default" : "outline"} onClick={() => setFilter("free")}>ফ্রি ({toBn(freeCount)})</Button>
          <Button size="sm" variant={filter === "premium" ? "default" : "outline"} onClick={() => setFilter("premium")}>প্রিমিয়াম ({toBn(premiumCount)})</Button>
        </div>
      </div>
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>নাম</TableHead><TableHead>ইমেইল</TableHead><TableHead>ফোন</TableHead>
            <TableHead>কুইজ</TableHead><TableHead>মোট স্কোর</TableHead><TableHead>এই মাস</TableHead>
            <TableHead>প্ল্যান</TableHead><TableHead>মেয়াদ</TableHead><TableHead>ভূমিকা</TableHead>
            <TableHead>সক্রিয়</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((u) => {
              const active = u.is_premium && (!u.premium_expires_at || new Date(u.premium_expires_at) > new Date());
              return (
              <TableRow key={u.id}>
                <TableCell>{u.full_name}</TableCell>
                <TableCell className="text-xs">{u.email}</TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>{toBn(u.total_quizzes_taken)}</TableCell>
                <TableCell className="font-semibold">{toBn(u.total_score ?? 0)}</TableCell>
                <TableCell>{toBn(u.current_month_score ?? 0)}</TableCell>
                <TableCell>
                  {active ? (
                    <span className="rounded bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs">⭐ {u.premium_tier}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">ফ্রি</span>
                  )}
                </TableCell>
                <TableCell className="text-xs">{active && u.premium_expires_at ? new Date(u.premium_expires_at).toLocaleDateString("bn-BD") : "—"}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.is_active ? "✅" : "🚫"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {active ? (
                      <Button size="sm" variant="outline" onClick={() => revokePremium(u)}>প্রিমিয়াম বাতিল</Button>
                    ) : (
                      <Button size="sm" onClick={() => { setPremiumDialog(u); setTier("basic"); setDays(30); }}>প্রিমিয়াম করুন</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => toggleAdmin(u)}>{u.role === "admin" ? "Admin সরান" : "Admin করুন"}</Button>
                    <Button size="sm" variant="outline" onClick={() => toggleActive(u)}>{u.is_active ? "নিষ্ক্রিয়" : "সক্রিয়"}</Button>
                  </div>
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!premiumDialog} onOpenChange={(o) => !o && setPremiumDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>প্রিমিয়াম সক্রিয় করুন — {premiumDialog?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>টিয়ার</Label>
              <Select value={tier} onValueChange={(v) => setTier(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic — ৳৩০ (৫ কুইজ/দিন, ৪০ প্রশ্ন)</SelectItem>
                  <SelectItem value="pro">Pro — ৳৫০ (১০ কুইজ/দিন, ৬০ প্রশ্ন)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>মেয়াদ (দিন)</Label>
              <Input type="number" value={days} onChange={(e) => setDays(Number(e.target.value) || 30)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPremiumDialog(null)}>বাতিল</Button>
            <Button onClick={grantPremium}>সক্রিয় করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}