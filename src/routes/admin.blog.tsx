import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blog")({ component: BlogAdmin });

function slugify(s: string) {
  return s.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function BlogAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [edit, setEdit] = useState<any | null>(null);

  const load = () => supabase.from("blog_posts").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!edit.title_bn) return toast.error("শিরোনাম আবশ্যক");
    const payload: any = { ...edit };
    if (!payload.slug) payload.slug = slugify(payload.title_bn) + "-" + Math.random().toString(36).slice(2, 5);
    if (payload.is_published && !payload.published_at) payload.published_at = new Date().toISOString();
    const op = edit.id ? supabase.from("blog_posts").update(payload).eq("id", edit.id) : supabase.from("blog_posts").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("সংরক্ষিত");
    setEdit(null); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h1 className="text-2xl font-bold">ব্লগ</h1>
        <Button onClick={() => setEdit({ title_bn: "", slug: "", category: "tips", excerpt_bn: "", content_bn: "", featured_image: "", is_published: false })}>নতুন পোস্ট</Button>
      </div>
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>শিরোনাম</TableHead><TableHead>ক্যাটাগরি</TableHead><TableHead>প্রকাশিত</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="max-w-md truncate">{p.title_bn}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.is_published ? "✅" : "❌"}</TableCell>
                <TableCell><Button size="sm" variant="outline" onClick={() => setEdit(p)}>সম্পাদনা</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{edit?.id ? "সম্পাদনা" : "নতুন"} পোস্ট</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-3">
              <div><Label>শিরোনাম</Label><Input value={edit.title_bn} onChange={(e) => setEdit({ ...edit, title_bn: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} placeholder="auto" /></div>
              <div><Label>ক্যাটাগরি</Label><Input value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} /></div>
              <div><Label>সারসংক্ষেপ</Label><Textarea rows={2} value={edit.excerpt_bn ?? ""} onChange={(e) => setEdit({ ...edit, excerpt_bn: e.target.value })} /></div>
              <div><Label>কনটেন্ট (HTML)</Label><Textarea rows={10} value={edit.content_bn ?? ""} onChange={(e) => setEdit({ ...edit, content_bn: e.target.value })} /></div>
              <div><Label>ফিচার্ড ইমেজ URL</Label><Input value={edit.featured_image ?? ""} onChange={(e) => setEdit({ ...edit, featured_image: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch checked={edit.is_published} onCheckedChange={(v) => setEdit({ ...edit, is_published: v })} /><Label>প্রকাশিত</Label></div>
            </div>
          )}
          <DialogFooter><Button onClick={save}>সংরক্ষণ</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}