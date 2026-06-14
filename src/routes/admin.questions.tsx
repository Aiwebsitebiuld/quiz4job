import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/questions")({ component: QuestionsPage });

type Q = {
  id: string; question_text_bn: string; correct_option: string; difficulty: string;
  is_active: boolean; times_appeared: number; times_correct: number;
  category_id: string; quiz_categories?: { name_bn: string } | null;
};

function QuestionsPage() {
  const [rows, setRows] = useState<Q[]>([]);
  const [cats, setCats] = useState<{ id: string; name_bn: string }[]>([]);
  const [filters, setFilters] = useState({ cat: "all", diff: "all", active: "all", q: "" });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = async () => {
    let q: any = supabase.from("questions").select("id,question_text_bn,correct_option,difficulty,is_active,times_appeared,times_correct,category_id,quiz_categories(name_bn)").order("created_at", { ascending: false }).limit(200);
    if (filters.cat !== "all") q = q.eq("category_id", filters.cat);
    if (filters.diff !== "all") q = q.eq("difficulty", filters.diff);
    if (filters.active !== "all") q = q.eq("is_active", filters.active === "yes");
    if (filters.q) q = q.ilike("question_text_bn", `%${filters.q}%`);
    const { data } = await q;
    setRows((data ?? []) as any);
  };

  useEffect(() => {
    supabase.from("quiz_categories").select("id,name_bn").then(({ data }) => setCats(data ?? []));
  }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filters]);

  const bulk = async (action: "delete" | "deactivate") => {
    if (!selected.size) return;
    const ids = Array.from(selected);
    if (action === "delete") {
      if (!confirm(`${ids.length} টি প্রশ্ন মুছবেন?`)) return;
      await supabase.from("questions").delete().in("id", ids);
    } else {
      await supabase.from("questions").update({ is_active: false }).in("id", ids);
    }
    toast.success("সম্পন্ন");
    setSelected(new Set()); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">প্রশ্ন ব্যাংক</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline"><label className="cursor-pointer"><Upload className="h-4 w-4" /> CSV থেকে আমদানি<input type="file" accept=".csv" className="hidden" onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return;
            const text = await f.text();
            const lines = text.split(/\r?\n/).filter(Boolean);
            const headers = lines.shift()!.split(",");
            const rows = lines.map((l) => {
              const cols = l.split(",");
              const obj: any = {}; headers.forEach((h, i) => { obj[h.trim()] = (cols[i] ?? "").trim(); });
              return obj;
            });
            const catsMap: Record<string, string> = {};
            const { data: cs } = await supabase.from("quiz_categories").select("id,slug");
            (cs ?? []).forEach((c: any) => { catsMap[c.slug] = c.id; });
            const payload = rows.map((r) => ({
              category_id: catsMap[r.category_slug],
              question_text_bn: r.question_bn,
              option_a_bn: r.option_a_bn, option_b_bn: r.option_b_bn,
              option_c_bn: r.option_c_bn, option_d_bn: r.option_d_bn,
              correct_option: r.correct, explanation_bn: r.explanation_bn ?? "",
              difficulty: r.difficulty || "medium",
            })).filter((r) => r.category_id);
            const { error } = await supabase.from("questions").insert(payload);
            if (error) toast.error(error.message); else { toast.success(`${payload.length} টি প্রশ্ন আমদানি হয়েছে`); load(); }
          }} /></label></Button>
          <Button asChild><Link to="/admin/questions/new"><Plus className="h-4 w-4" /> প্রশ্ন যোগ করুন</Link></Button>
        </div>
      </div>

      <Card className="p-3 grid grid-cols-2 md:grid-cols-5 gap-2">
        <Select value={filters.cat} onValueChange={(v) => setFilters({ ...filters, cat: v })}>
          <SelectTrigger><SelectValue placeholder="ক্যাটাগরি" /></SelectTrigger>
          <SelectContent><SelectItem value="all">সব ক্যাটাগরি</SelectItem>
            {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name_bn}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.diff} onValueChange={(v) => setFilters({ ...filters, diff: v })}>
          <SelectTrigger><SelectValue placeholder="কঠিনতা" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব কঠিনতা</SelectItem>
            <SelectItem value="easy">সহজ</SelectItem><SelectItem value="medium">মাঝারি</SelectItem><SelectItem value="hard">কঠিন</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.active} onValueChange={(v) => setFilters({ ...filters, active: v })}>
          <SelectTrigger><SelectValue placeholder="স্ট্যাটাস" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব</SelectItem>
            <SelectItem value="yes">সক্রিয়</SelectItem><SelectItem value="no">নিষ্ক্রিয়</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="প্রশ্ন খুঁজুন..." value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} className="md:col-span-2" />
      </Card>

      {selected.size > 0 && (
        <div className="flex gap-2 items-center bg-yellow-50 p-2 rounded">
          <span className="text-sm">{selected.size} টি নির্বাচিত</span>
          <Button size="sm" variant="destructive" onClick={() => bulk("delete")}>মুছুন</Button>
          <Button size="sm" variant="outline" onClick={() => bulk("deactivate")}>নিষ্ক্রিয় করুন</Button>
        </div>
      )}

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>প্রশ্ন</TableHead><TableHead>ক্যাটাগরি</TableHead>
              <TableHead>সঠিক</TableHead><TableHead>কঠিনতা</TableHead>
              <TableHead>সফলতা</TableHead><TableHead>ক্রিয়া</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const rate = r.times_appeared ? Math.round((r.times_correct / r.times_appeared) * 100) : 0;
              return (
                <TableRow key={r.id}>
                  <TableCell><Checkbox checked={selected.has(r.id)} onCheckedChange={(v) => {
                    const s = new Set(selected); v ? s.add(r.id) : s.delete(r.id); setSelected(s);
                  }} /></TableCell>
                  <TableCell className="max-w-md truncate">{r.question_text_bn}</TableCell>
                  <TableCell className="text-xs">{r.quiz_categories?.name_bn}</TableCell>
                  <TableCell className="uppercase">{r.correct_option}</TableCell>
                  <TableCell>{r.difficulty}</TableCell>
                  <TableCell>{rate}%</TableCell>
                  <TableCell><Link to="/admin/questions/$id/edit" params={{ id: r.id }} className="text-primary underline text-sm">সম্পাদনা</Link></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}