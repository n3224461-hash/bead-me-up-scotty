// Isolated browser regression: no real Beads databases are accessed.
import assert from "node:assert/strict";
import { chromium } from "playwright";
const base = process.env.SCOTTY_TEST_URL;
assert.ok(base, "Set SCOTTY_TEST_URL to an isolated Scotty server");
const bead = (title, extra = {}) => ({ id: "same-id", title, status: "open", issue_type: "task", priority: 2, labels: [], dependencies: [], ...extra });
const projects = ["alpha", "beta", "broken"].map((id) => ({ id, name: id.toUpperCase(), path: `/test/${id}`, hasBeads: true }));
const fixtures = {
  alpha: [bead("Alpha task", { labels: ["team"] }), bead("Alpha epic", { id: "epic", issue_type: "epic" }), bead("Pinned item", { id: "pinned", status: "pinned" })],
  beta: [bead("Beta task", { priority: 0 }), bead("Archived", { id: "archived", labels: ["archived"] })],
};
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === "/api/telemetry") return route.fulfill({ json: {} });
    assert.equal(route.request().method(), "GET", `The showcase must not write project data: ${pathname}`);
    if (pathname === "/api/projects") return route.fulfill({ json: { projects } });
    if (pathname === "/api/viewer-mode") return route.fulfill({ json: { readOnly: true } });
    const match = pathname.match(/^\/api\/p\/([^/]+)\/beads$/);
    if (match?.[1] === "broken") return route.fulfill({ status: 500, json: { error: "Test database unavailable" } });
    if (match && fixtures[match[1]]) return route.fulfill({ json: { beads: fixtures[match[1]], meta: { kind: "bd", humanAllowlist: [], pollIntervalMs: 30000 } } });
    if (pathname.includes("/order")) throw new Error("Global board requested project ordering");
    return route.fulfill({ json: {} });
  });
  await page.goto(base);
  await page.getByRole("link", { name: /All projects · Board/ }).click();
  await page.getByText("Alpha task", { exact: true }).waitFor();
  await page.getByText("Beta task", { exact: true }).waitFor();
  await page.getByText("Alpha epic", { exact: true }).waitFor();
  await page.getByText("Pinned item", { exact: true }).waitFor();
  await page.getByText(/BROKEN: Test database unavailable/).waitFor({ timeout: 15000 });
  assert.equal(await page.locator("article").count(), 4);
  await page.getByRole("button", { name: "Project", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "ALPHA", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.waitForURL(/project=alpha/);
  assert.equal(await page.locator("article").count(), 3);
  await page.locator("[data-search]").fill("Alpha task");
  await page.waitForFunction(() => document.querySelectorAll("article").length === 1);
  await page.reload();
  await page.getByText("Alpha task", { exact: true }).waitFor();
  assert.equal(await page.locator("article").count(), 1);
  // Direct URL facet composition, including epic and pinned item visibility.
  await page.goto(`${base}/board?project=beta&priority=0`);
  await page.getByText("Beta task", { exact: true }).waitFor();
  assert.equal(await page.locator("article").count(), 1);
  await page.locator("article").click();
  await page.waitForURL(/\/p\/beta\?view=board&bead=same-id/);
  assert.deepEqual(errors, []);
  console.log("PASS: launcher, project filter, search, URL restore, facets, epic/pinned visibility, partial errors, correct project navigation");
} finally {
  await browser.close();
}
