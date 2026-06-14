import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({ component: CatsPage });

function CatsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [edit, setEdit] = useState<any | null>(null);

  const load = () => supabase.from("quiz_categories").select("*").order("display_order", { ascending: true }).then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!edit.name_bn || !edit.slug) return toast.error("নাম ও স্লাগ আবশ্যক");
    const payload = { ...edit };
    const op = edit.id
      ? supabase.from("quiz_categories").update(payload).eq("id", edit.id)
      : supabase.from("quiz_categories").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("সংরক্ষিত");
    setEdit(null); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">ক্যাটাগরি</h1>
        <Button onClick={() => setEdit({ name_bn: "", name_en: "", slug: "", icon: "📚", color: "#006A4E", is_active: true })}>নতুন ক্যাটাগরি</Button>
      </div>
      <Card className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {rows.map((c) => (
          <div key={c.id} className="border rounded p-3 flex items-center gap-3">
            <div className="text-2xl">{c.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{c.name_bn}</div>
              <div className="text-xs text-muted-foreground truncate">/{c.slug}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEdit(c)}>সম্পাদনা</Button>
          </div>
        ))}
      </Card>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.id ? "সম্পাদনা" : "নতুন"} ক্যাটাগরি</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-3">
              <div><Label>নাম (বাংলা)</Label><Input value={edit.name_bn} onChange={(e) => setEdit({ ...edit, name_bn: e.target.value })} /></div>
              <div><Label>নাম (English)</Label><Input value={edit.name_en} onChange={(e) => setEdit({ ...edit, name_en: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>আইকন</Label><Input value={edit.icon} onChange={(e) => setEdit({ ...edit, icon: e.target.value })} /></div>
                <div><Label>রঙ</Label><Input type="color" value={edit.color} onChange={(e) => setEdit({ ...edit, color: e.target.value })} /></div>
              </div>
              <div><Label>বিবরণ</Label><Textarea value={edit.description_bn ?? ""} onChange={(e) => setEdit({ ...edit, description_bn: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch checked={edit.is_active} onCheckedChange={(v) => setEdit({ ...edit, is_active: v })} /><Label>সক্রিয়</Label></div>
            </div>
          )}
          <DialogFooter><Button onClick={save}>সংরক্ষণ</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}