import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
const require = createRequire(import.meta.url);
const temp = mkdtempSync(path.join(tmpdir(), "scotty-workspace-"));
const env = { ...process.env, XDG_CONFIG_HOME: temp, BEADS_DIR: "/wrong/inherited/.beads" };
const calls = [];
function load(name) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL(`../lib/${name}.ts`, import.meta.url), "utf8"), { compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, process: { env, cwd: () => temp }, require: (id) => {
    if (id === "server-only") return {};
    if (id.startsWith("./")) return load(id.slice(2));
    if (id === "node:child_process") return { execFile: (bin, args, options, cb) => {
      calls.push({ bin, args, options });
      cb(null, { stdout: args[0] === "show" ? JSON.stringify([{ id: "same", title: "task", status: "open", issue_type: "task" }]) : "" });
    } };
    return require(id);
  } });
  return exports;
}
try {
  const { workspaceBoardData, workspaceBeadId: id } = load("workspace-board");
  const { makeIndex, isBlocked, parentOf, childrenCountMap } = load("beads-view");
  const task = { id: "same", title: "Task", status: "open", issue_type: "task", parent: "parent", dependencies: [{ type: "blocks", depends_on_id: "blocker" }, { type: "parent-child", depends_on_id: "parent" }] };
  const groups = ["alpha", "beta"].map((projectId) => ({ project: { id: projectId, name: projectId }, data: { meta: { humanAllowlist: [] }, beads: [task, { id: "parent", title: projectId, status: "open", issue_type: "epic" }, { id: "blocker", status: projectId === "alpha" ? "closed" : "open" }] } }));
  const result = workspaceBoardData(groups);
  const index = makeIndex(result.beads);
  assert.equal(index.size, 6);
  assert.equal(isBlocked(index.get(id("alpha", "same")), index), false);
  assert.equal(isBlocked(index.get(id("beta", "same")), index), true);
  assert.equal(parentOf(index.get(id("alpha", "same")), index).title, "alpha");
  assert.equal(childrenCountMap(result.beads).get(id("alpha", "parent")), 1);
  assert.equal(task.id, "same");
  assert.equal(task.parent, "parent");
  assert.equal(task.dependencies[0].depends_on_id, "blocker");

  const registryDir = path.join(temp, "воркспейс", "конфигурация");
  mkdirSync(registryDir, { recursive: true });
  env.SCOTTY_PROJECTS_FILE = path.join(registryDir, "projects.json");
  const writeRegistry = (folder) => writeFileSync(env.SCOTTY_PROJECTS_FILE, JSON.stringify({ projects: { alpha: { name: "Alpha", path: folder, beads_prefix: "a" } }, archived_projects: { old: { path: "old" } } }));
  writeRegistry("Проект");
  const config = load("config");
  assert.equal(config.listProjects().length, 1);
  assert.equal(config.getProject("alpha").path, path.join(temp, "Проект"));
  writeRegistry("Moved");
  assert.equal(config.getProject("alpha").path, path.join(temp, "Moved"));
  assert.throws(() => config.removeProject("alpha"), /managed/);
  writeFileSync(env.SCOTTY_PROJECTS_FILE, "invalid");
  assert.throws(() => config.listProjects(), /Cannot read project registry/);

  const { createBdStore } = load("bd");
  await createBdStore(path.join(temp, "alpha")).get("same");
  await createBdStore(path.join(temp, "beta")).get("same");
  assert.equal(calls.length, 2);
  for (const [i, projectId] of ["alpha", "beta"].entries()) {
    assert.equal(calls[i].options.cwd, path.join(temp, projectId));
    assert.equal(calls[i].options.env.BEADS_DIR, path.join(temp, projectId, ".beads"));
    assert.equal(calls[i].args[0], "show", "BD_BIN compatibility wrapper needs the command first");
    assert.equal(calls[i].args[1], "same");
  }
  console.log("PASS: colliding IDs, dependency/parent isolation, live WorkPost registry, CLI database selection");
} finally {
  rmSync(temp, { recursive: true, force: true });
}
