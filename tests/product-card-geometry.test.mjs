import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("product add action matches the pre-experiment card geometry", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const block = css.match(/\.project-add\s*\{([\s\S]*?)\}/)?.[1] ?? "";
  const hover = css.match(/\.project-add:hover\s*\{([\s\S]*?)\}/)?.[1] ?? "";

  assert.match(block, /padding:\s*10px 9px 9px;/);
  assert.match(block, /border:\s*1px solid #d8d8d8;/);
  assert.match(hover, /background:\s*var\(--color-ink\);/);
  assert.match(hover, /color:\s*var\(--surface-canvas\);/);
});
