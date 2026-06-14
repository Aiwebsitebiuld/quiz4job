import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/subscriptions/verified")({
  beforeLoad: () => { throw redirect({ to: "/admin/subscriptions" }); },
});