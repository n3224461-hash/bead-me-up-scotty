import { Suspense } from "react";
import { WorkspaceBoard } from "@/components/workspace-board";

export const metadata = { title: "All projects · Board" };

export default function Page() {
  return <Suspense fallback={<div className="p-6">Loading board…</div>}><WorkspaceBoard /></Suspense>;
}
