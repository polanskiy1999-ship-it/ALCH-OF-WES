import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Pages workflow can enable a repository that has not used Pages before", async () => {
  const workflow = await readFile(".github/workflows/pages.yml", "utf8");
  assert.match(workflow, /configure-pages@v5[\s\S]*?enablement:\s*true/);
});
