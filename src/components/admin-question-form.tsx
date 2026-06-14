import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

export function QuestionForm({ id }: { id?: string }) {
  const navigate = useNavigate();
  const [cats, setCats] = useState<{ id: string; name_bn: string }[]>([]);
  const [f, setF] = useState<any>({
    category_id: "", question_text_bn: "", question_text_en: "",
    option_a_bn: "", option_a_en: "", option_b_bn: "", option_b_en: "",
    option_c_bn: "", option_c_en: "", option_d_bn: "", option_d_en: "",
    correct_option: "a", explanation_bn: "", explanation_en: "",
    difficulty: "medium", exam_type: "general", year_appeared: "",
  });

  useEffect(() => {
    supabase.from("quiz_categories").select("id,name_bn").then(({ data }) => setCats(data ?? []));
    if (id) supabase.from("questions").select("*").eq("id", id).single().then(({ data }) => data && setF(data));
  }, [id]);

  const submit = async () => {
    if (!f.category_id || !f.question_text_bn || !f.option_a_bn || !f.option_b_bn || !f.option_c_bn || !f.option_d_bn) {
      return toast.error("সকল আবশ্যক ক্ষেত্র পূরণ করুন");
    }
    const payload: any = { ...f };
    delete payload.quiz_categories;
    const op = id
      ? supabase.from("questions").update(payload).eq("id", id)
      : supabase.from("questions").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("সংরক্ষিত!");
    navigate({ to: "/admin/questions" });
  };

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">{id ? "প্রশ্ন সম্পাদনা" : "নতুন প্রশ্ন যোগ করুন"}</h1>
      <Card className="p-5 space-y-4">
        <div>
          <Label>ক্যাটাগরি *</Label>
          <Select value={f.category_id} onValueChange={(v) => setF({ ...f, category_id: v })}>
            <SelectTrigger><SelectValue placeholder="বেছে নিন" /></SelectTrigger>
            <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name_bn}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>প্রশ্ন (বাংলা) *</Label>
          <Textarea value={f.question_text_bn} onChange={(e) => setF({ ...f, question_text_bn: e.target.value })} />
        </div>
        <div>
          <Label>প্রশ্ন (English)</Label>
          <Textarea value={f.question_text_en} onChange={(e) => setF({ ...f, question_text_en: e.target.value })} />
        </div>
        {(["a", "b", "c", "d"] as const).map((k) => (
          <div key={k} className="grid grid-cols-2 gap-2">
            <div>
              <Label>বিকল্প {k.toUpperCase()} (বাংলা) *</Label>
              <Input value={f[`option_${k}_bn`]} onChange={(e) => setF({ ...f, [`option_${k}_bn`]: e.target.value })} />
            </div>
            <div>
              <Label>বিকল্প {k.toUpperCase()} (ইংরেজি)</Label>
              <Input value={f[`option_${k}_en`]} onChange={(e) => setF({ ...f, [`option_${k}_en`]: e.target.value })} />
            </div>
          </div>
        ))}
        <div>
          <Label>সঠিক উত্তর *</Label>
          <RadioGroup value={f.correct_option} onValueChange={(v) => setF({ ...f, correct_option: v })} className="flex gap-4 mt-1">
            {["a","b","c","d"].map((k) => (
              <div key={k} className="flex items-center gap-2"><RadioGroupItem value={k} id={`c-${k}`} /><Label htmlFor={`c-${k}`}>{k.toUpperCase()}</Label></div>
            ))}
          </RadioGroup>
        </div>
        <div>
          <Label>ব্যাখ্যা (বাংলা)</Label>
          <Textarea value={f.explanation_bn} onChange={(e) => setF({ ...f, explanation_bn: e.target.value })} />
        </div>
        <div>
          <Label>ব্যাখ্যা (English)</Label>
          <Textarea value={f.explanation_en} onChange={(e) => setF({ ...f, explanation_en: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label>কঠিনতা</Label>
            <Select value={f.difficulty} onValueChange={(v) => setF({ ...f, difficulty: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">সহজ</SelectItem><SelectItem value="medium">মাঝারি</SelectItem><SelectItem value="hard">কঠিন</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>পরীক্ষার ধরন</Label>
            <Input value={f.exam_type} onChange={(e) => setF({ ...f, exam_type: e.target.value })} placeholder="BCS-43rd" />
          </div>
          <div>
            <Label>সাল</Label>
            <Input value={f.year_appeared} onChange={(e) => setF({ ...f, year_appeared: e.target.value })} placeholder="2023" />
          </div>
        </div>
        <Button onClick={submit} size="lg">সংরক্ষণ করুন</Button>
      </Card>
    </div>
  );
}