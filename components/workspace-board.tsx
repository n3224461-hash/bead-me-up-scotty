"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { useProjects } from "@/hooks/use-projects";
import { beadsKey } from "@/hooks/use-beads";
import { api } from "@/lib/api-client";
import { workspaceBoardData } from "@/lib/workspace-board";
import { makeIndex } from "@/lib/beads-view";
import { AppProvider } from "@/components/app-context";
import { Board } from "@/components/board/board";

export function WorkspaceBoard() {
  const router = useRouter();
  const projectsQuery = useProjects();
  const projects = (projectsQuery.data?.projects ?? []).filter((p) => p.id !== "demo");
  const queries = useQueries({
    queries: projects.map((project) => ({
      queryKey: beadsKey(project.id),
      queryFn: () => api.list(project.id),
      refetchInterval: 30_000,
    })),
  });
  const { beads, sources, humanAllowlist } = workspaceBoardData(
    projects.map((project, i) => ({ project, data: queries[i].data })),
  );
  const index = makeIndex(beads);
  const [selectedBeadId, selectBead] = React.useState<string | null>(null);
  const openDetail = (id: string) => {
    const source = sources.get(id);
    if (source) router.push(`/p/${encodeURIComponent(source.projectId)}?view=board&bead=${encodeURIComponent(source.beadId)}`);
  };
  const errors = queries.flatMap((query, i) => query.error ? [`${projects[i].name}: ${query.error.message}`] : []);
  const loading = projectsQuery.isLoading || queries.some((query) => query.isLoading);

  return (
    <AppProvider value={{
      projectId: "", beads, index, humanAllowlist, readOnly: true, loading,
      selectedBeadId, selectBead, openDetail, pushDetail: openDetail,
      openEpic: openDetail, openCreate: () => {}, beadSources: sources,
    }}>
      <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
        <nav className="flex items-center gap-4 border-b border-border px-6 py-3 text-sm">
          <Link href="/" className="text-[var(--brand)]">← Projects</Link>
          <span>All projects · Open a card to view or edit it in its project</span>
        </nav>
        {(projectsQuery.error || errors.length > 0) && (
          <div role="alert" className="max-h-40 overflow-auto border-b border-destructive/40 bg-destructive/5 px-6 py-3 text-sm">
            <p>Some projects could not be loaded. Available tasks are shown below.</p>
            {projectsQuery.error && <p>{projectsQuery.error.message}</p>}
            {errors.map((error) => <p key={error}>{error}</p>)}
            <button className="mt-2 underline" onClick={() => { void projectsQuery.refetch(); queries.forEach((q) => { void q.refetch(); }); }}>Retry</button>
          </div>
        )}
        {!loading && !projectsQuery.error && projects.length === 0 && (
          <p className="px-6 py-3 text-sm">No projects yet. <Link href="/" className="underline">Add a project</Link> to see its tasks here.</p>
        )}
        <div className="min-h-0 flex-1"><Board projects={projects} /></div>
      </div>
    </AppProvider>
  );
}
