import type { Bead } from "./schema";
import type { ProjectInfo, BeadsResponse } from "./api-client";

export interface BeadSource {
  projectId: string;
  projectName: string;
  beadId: string;
}

// UI-only identities: never pass these to bd or persist them in project data.
export const workspaceBeadId = (projectId: string, beadId: string) =>
  JSON.stringify([projectId, beadId]);

export function workspaceBoardData(groups: { project: ProjectInfo; data?: BeadsResponse }[]) {
  const sources = new Map<string, BeadSource>();
  const humanAllowlist = new Set<string>();
  const beads: Bead[] = [];
  for (const { project, data } of groups) {
    for (const actor of data?.meta.humanAllowlist ?? []) humanAllowlist.add(actor);
    for (const bead of data?.beads ?? []) {
      const scope = (id: string) => workspaceBeadId(project.id, id);
      const id = scope(bead.id);
      sources.set(id, { projectId: project.id, projectName: project.name, beadId: bead.id });
      beads.push({
        ...bead,
        id,
        parent: bead.parent ? scope(bead.parent) : bead.parent,
        dependencies: bead.dependencies?.map((dep) => ({
          ...dep,
          issue_id: dep.issue_id ? scope(dep.issue_id) : undefined,
          depends_on_id: scope(dep.depends_on_id),
        })),
      });
    }
  }
  return { beads, sources, humanAllowlist: [...humanAllowlist] };
}
