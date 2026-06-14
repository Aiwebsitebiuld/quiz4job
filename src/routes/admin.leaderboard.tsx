import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { adminFetchLeaderboard, adminFetchPrizeHistory } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { toBn, bnCurrency } from "@/lib/bn";

export const Route = createFileRoute("/admin/leaderboard")({ component: LBAdmin });

const PRIZES = [1500, 1000, 500];

function LBAdmin() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState<any[]>([]);
  const [payFor, setPayFor] = useState<{ row: any; pos: number; amount: number } | null>(null);
  const [bkash, setBkash] = useState(""); const [txn, setTxn] = useState("");
  const [historyRows, setHistoryRows] = useState<any[]>([]);
  const fetchLB = useServerFn(adminFetchLeaderboard);
  const fetchHistory = useServerFn(adminFetchPrizeHistory);

  const load = async () => {
    try {
      const data = await fetchLB({ data: { month, year } });
      setRows((data ?? []).map((r: any, i: number) => ({ ...r, rankPos: i + 1 })));
    } catch (e: any) { toast.error(e.message); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [month, year]);

  useEffect(() => {
    fetchHistory({}).then((data) => setHistoryRows(data ?? [])).catch((e: any) => toast.error(e.message));
    // eslint-disable-next-line
  }, []);

  const openPay = (row: any, pos: number) => {
    setPayFor({ row, pos, amount: PRIZES[pos - 1] });
    setBkash(row.profiles?.phone ?? ""); setTxn("");
  };

  const confirmPay = async () => {
    if (!payFor) return;
    if (!txn) return toast.error("ট্রানজেকশন ID দরকার");
    const { error } = await supabase.from("prize_records").insert({
      user_id: payFor.row.user_id, month, year, position: payFor.pos,
      prize_amount: payFor.amount, payment_method: "bkash", payment_number: bkash,
      transaction_id: txn, paid_at: new Date().toISOString(), status: "paid",
    });
    if (error) return toast.error(error.message);
    await supabase.from("monthly_leaderboard").update({
      prize_paid: true, prize_paid_at: new Date().toISOString(),
      prize_payment_method: "bkash", prize_transaction_id: txn,
      prize_amount: payFor.amount, prize_position: String(payFor.pos),
    }).eq("id", payFor.row.id);
    await supabase.from("notifications").insert({
      user_id: payFor.row.user_id, type: "success",
      title_bn: "🎉 অভিনন্দন!",
      message_bn: `আপনি এই মাসে ${toBn(payFor.pos)} স্থান পেয়েছেন এবং ${bnCurrency(payFor.amount)} পুরস্কার পেয়েছেন!`,
      link: "/dashboard",
    });
    toast.success("পুরস্কার নিশ্চিত করা হয়েছে");
    setPayFor(null); load();
  };

  const eligible = rows.filter((r) => r.is_prize_eligible).slice(0, 3);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">লিডারবোর্ড ব্যবস্থাপনা</h1>
      <div className="flex gap-2">
        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>{Array.from({length:12}).map((_,i) => <SelectItem key={i+1} value={String(i+1)}>{toBn(i+1)}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>{[2025,2026,2027].map((y) => <SelectItem key={y} value={String(y)}>{toBn(y)}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="rankings">
        <TabsList>
          <TabsTrigger value="rankings">র‍্যাঙ্কিং</TabsTrigger>
          <TabsTrigger value="distribute">পুরস্কার বিতরণ</TabsTrigger>
          <TabsTrigger value="history">বিজয়ী ইতিহাস</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings">
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>র‍্যাঙ্ক</TableHead><TableHead>নাম</TableHead>
                <TableHead>স্কোর</TableHead><TableHead>প্রিমিয়াম</TableHead>
                <TableHead>FB</TableHead><TableHead>যোগ্য</TableHead><TableHead>পুরস্কার</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{toBn(r.rankPos)}</TableCell>
                    <TableCell>{r.profiles?.full_name}</TableCell>
                    <TableCell>{toBn(r.total_score)}</TableCell>
                    <TableCell>{r.is_premium ? "✅" : "❌"}</TableCell>
                    <TableCell>{r.facebook_liked ? "✅" : "❌"}</TableCell>
                    <TableCell>{r.is_prize_eligible ? "✅" : "❌"}</TableCell>
                    <TableCell>{r.prize_amount ? bnCurrency(r.prize_amount) : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="distribute">
          <Card className="p-5 space-y-3 bg-gradient-to-br from-yellow-50 to-amber-100">
            <h2 className="font-bold text-lg">এই মাসের বিজয়ী</h2>
            {eligible.length === 0 && <div className="text-muted-foreground">কোন যোগ্য বিজয়ী নেই</div>}
            {eligible.map((r, i) => (
              <div key={r.id} className="flex items-center gap-3 bg-white p-3 rounded border">
                <div className="text-2xl">{["🥇","🥈","🥉"][i]}</div>
                <div className="flex-1">
                  <div className="font-semibold">{r.profiles?.full_name}</div>
                  <div className="text-xs text-muted-foreground">{r.profiles?.phone || "ফোন নেই"} • স্কোর: {toBn(r.total_score)}</div>
                </div>
                <div className="font-bold text-amber-700">{bnCurrency(PRIZES[i])}</div>
                <Button size="sm" disabled={r.prize_paid} onClick={() => openPay(r, i + 1)}>
                  {r.prize_paid ? "পরিশোধিত" : "পুরস্কার পাঠান"}
                </Button>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>মাস/বছর</TableHead><TableHead>বিজয়ী</TableHead><TableHead>স্থান</TableHead>
                <TableHead>পরিমাণ</TableHead><TableHead>পদ্ধতি</TableHead><TableHead>TxID</TableHead><TableHead>স্ট্যাটাস</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {historyRows.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{toBn(p.month)}/{toBn(p.year)}</TableCell>
                    <TableCell>{p.profiles?.full_name}</TableCell>
                    <TableCell>{toBn(p.position)}</TableCell>
                    <TableCell>{bnCurrency(p.prize_amount)}</TableCell>
                    <TableCell>{p.payment_method}</TableCell>
                    <TableCell className="font-mono text-xs">{p.transaction_id}</TableCell>
                    <TableCell>{p.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!payFor} onOpenChange={(o) => !o && setPayFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>পুরস্কার পাঠান</DialogTitle></DialogHeader>
          {payFor && (
            <div className="space-y-3">
              <div className="text-sm">প্রাপক: <b>{payFor.row.profiles?.full_name}</b></div>
              <div><Label>bKash/Nagad নম্বর</Label><Input value={bkash} onChange={(e) => setBkash(e.target.value)} /></div>
              <div><Label>পরিমাণ</Label><Input value={bnCurrency(payFor.amount)} disabled /></div>
              <div><Label>ট্রানজেকশন ID</Label><Input value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="পেমেন্ট পাঠানোর পরে" /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayFor(null)}>বাতিল</Button>
            <Button onClick={confirmPay}>পুরস্কার নিশ্চিত করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}