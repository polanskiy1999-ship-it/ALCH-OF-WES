import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("product add action keeps the original editorial card geometry", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const block = css.match(/\.project-add\s*\{([\s\S]*?)\}/)?.[1] ?? "";

  assert.match(block, /padding:\s*10px 0 8px;/);
  assert.match(block, /border:\s*0;/);
  assert.match(block, /border-top:\s*1px solid #d8d8d8;/);
  assert.doesNotMatch(block, /border:\s*1px solid #d8d8d8;/);
});
