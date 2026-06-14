import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { toBn } from "@/lib/bn";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    let query: any = supabase.from("profiles").select("id,full_name,email,phone,is_premium,role,is_active,total_quizzes_taken,created_at").order("created_at", { ascending: false }).limit(200);
    if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
    const { data } = await query;
    setRows(data ?? []);
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">ব্যবহারকারী</h1>
      <Input placeholder="নাম বা ইমেইল খুঁজুন..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>নাম</TableHead><TableHead>ইমেইল</TableHead><TableHead>ফোন</TableHead>
            <TableHead>কুইজ</TableHead><TableHead>প্রিমিয়াম</TableHead><TableHead>ভূমিকা</TableHead>
            <TableHead>সক্রিয়</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.full_name}</TableCell>
                <TableCell className="text-xs">{u.email}</TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>{toBn(u.total_quizzes_taken)}</TableCell>
                <TableCell>{u.is_premium ? "⭐" : "—"}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.is_active ? "✅" : "🚫"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => toggleAdmin(u)}>{u.role === "admin" ? "Admin সরান" : "Admin করুন"}</Button>
                    <Button size="sm" variant="outline" onClick={() => toggleActive(u)}>{u.is_active ? "নিষ্ক্রিয়" : "সক্রিয়"}</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}