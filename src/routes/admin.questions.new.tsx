import { createFileRoute } from "@tanstack/react-router";
import { QuestionForm } from "@/components/admin-question-form";
export const Route = createFileRoute("/admin/questions/new")({ component: () => <QuestionForm /> });