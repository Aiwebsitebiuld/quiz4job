import { createFileRoute } from "@tanstack/react-router";
import { QuestionForm } from "@/components/admin-question-form";
export const Route = createFileRoute("/admin/questions/$id/edit")({
  component: EditQ,
});
function EditQ() {
  const { id } = Route.useParams();
  return <QuestionForm id={id} />;
}