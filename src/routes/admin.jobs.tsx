import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DISTRICTS_BD as DISTRICTS } from "@/lib/districts";

export const Route = createFileRoute("/admin/jobs")({ component: JobsAdmin });

const ORG_TYPES = ["government","bank","ngo","private","university","army","police","other"];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) + "-" + Math.random().toString(36).slice(2, 6);
}

function JobsAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [edit, setEdit] = useState<any | null>(null);

  const load = () => supabase.from("jobs").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);

  const newJob = () => setEdit({
    title_bn: "", organization_name: "", organization_type: "government",
    location_bn: "বাংলাদেশ", district: "", vacancy_count: 1, salary_text: "",
    application_deadline: "", description_bn: "", application_url: "",
    source_url: "", organization_logo: "", is_featured: false, is_active: true,
  });

  const save = async () => {
    if (!edit.title_bn || !edit.organization_name) return toast.error("শিরোনাম ও প্রতিষ্ঠান আবশ্যক");
    const payload: any = { ...edit };
    if (!payload.slug) payload.slug = slugify(payload.title_bn);
    if (!payload.application_deadline) delete payload.application_deadline;
    const op = edit.id
      ? supabase.from("jobs").update(payload).eq("id", edit.id)
      : supabase.from("jobs").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("সংরক্ষিত");
    setEdit(null); load();
  };

  const uploadLogo = async (file: File) => {
    const path = `logos/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);
    if (error) return toast.error(error.message);
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    setEdit({ ...edit, organization_logo: data?.signedUrl ?? "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h1 className="text-2xl font-bold">চাকরি ব্যবস্থাপনা</h1><Button onClick={newJob}>নতুন চাকরি</Button></div>
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>শিরোনাম</TableHead><TableHead>সংস্থা</TableHead><TableHead>ধরন</TableHead>
            <TableHead>শেষ তারিখ</TableHead><TableHead>ফিচার্ড</TableHead><TableHead>সক্রিয়</TableHead>
            <TableHead>দেখা</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((j) => (
              <TableRow key={j.id}>
                <TableCell className="max-w-xs truncate">{j.title_bn}</TableCell>
                <TableCell>{j.organization_name}</TableCell>
                <TableCell>{j.organization_type}</TableCell>
                <TableCell>{j.application_deadline ?? "—"}</TableCell>
                <TableCell>{j.is_featured ? "⭐" : ""}</TableCell>
                <TableCell>{j.is_active ? "✅" : "❌"}</TableCell>
                <TableCell>{j.views_count}</TableCell>
                <TableCell><Button size="sm" variant="outline" onClick={() => setEdit(j)}>সম্পাদনা</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{edit?.id ? "সম্পাদনা" : "নতুন"} চাকরি</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-3">
              <div><Label>শিরোনাম (বাংলা) *</Label><Input value={edit.title_bn} onChange={(e) => setEdit({ ...edit, title_bn: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>প্রতিষ্ঠান *</Label><Input value={edit.organization_name} onChange={(e) => setEdit({ ...edit, organization_name: e.target.value })} /></div>
                <div><Label>ধরন</Label>
                  <Select value={edit.organization_type} onValueChange={(v) => setEdit({ ...edit, organization_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ORG_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>জেলা</Label>
                  <Select value={edit.district || "none"} onValueChange={(v) => setEdit({ ...edit, district: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="বেছে নিন" /></SelectTrigger>
                    <SelectContent><SelectItem value="none">—</SelectItem>{DISTRICTS.map((d: string) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>স্থান</Label><Input value={edit.location_bn} onChange={(e) => setEdit({ ...edit, location_bn: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>শূন্যপদ</Label><Input type="number" value={edit.vacancy_count} onChange={(e) => setEdit({ ...edit, vacancy_count: Number(e.target.value) })} /></div>
                <div><Label>সর্বনিম্ন বেতন</Label><Input type="number" value={edit.salary_min ?? ""} onChange={(e) => setEdit({ ...edit, salary_min: e.target.value ? Number(e.target.value) : null })} /></div>
                <div><Label>সর্বোচ্চ বেতন</Label><Input type="number" value={edit.salary_max ?? ""} onChange={(e) => setEdit({ ...edit, salary_max: e.target.value ? Number(e.target.value) : null })} /></div>
              </div>
              <div><Label>শেষ তারিখ *</Label><Input type="date" value={edit.application_deadline ?? ""} onChange={(e) => setEdit({ ...edit, application_deadline: e.target.value })} /></div>
              <div><Label>লোগো</Label>
                {edit.organization_logo && <img src={edit.organization_logo} className="h-12 w-12 rounded border my-1" />}
                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
              </div>
              <div><Label>বিবরণ (HTML)</Label><Textarea rows={6} value={edit.description_bn} onChange={(e) => setEdit({ ...edit, description_bn: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>আবেদনের URL</Label><Input value={edit.application_url} onChange={(e) => setEdit({ ...edit, application_url: e.target.value })} /></div>
                <div><Label>উৎস URL</Label><Input value={edit.source_url} onChange={(e) => setEdit({ ...edit, source_url: e.target.value })} /></div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2"><Switch checked={edit.is_featured} onCheckedChange={(v) => setEdit({ ...edit, is_featured: v })} /><Label>ফিচার্ড</Label></div>
                <div className="flex items-center gap-2"><Switch checked={edit.is_active} onCheckedChange={(v) => setEdit({ ...edit, is_active: v })} /><Label>সক্রিয়</Label></div>
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={save}>সংরক্ষণ করুন</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}