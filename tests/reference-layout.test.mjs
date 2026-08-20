import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/page.tsx", import.meta.url);
const cssUrl = new URL("../app/globals.css", import.meta.url);

test("catalog follows the Katherine Pihl first-viewport structure", async () => {
  const page = await readFile(pageUrl, "utf8");
  const css = await readFile(cssUrl, "utf8");

  assert.doesNotMatch(page, /<section className="hero"/);
  assert.match(css, /\.site-header-slot\s*\{[\s\S]*?min-height:\s*52px;/);
  assert.match(css, /\.collection\s*\{[\s\S]*?padding-top:\s*118px;/);
  assert.match(css, /\.project-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);[\s\S]*?gap:\s*64px 12px;/);
  assert.match(css, /\.project-media\s*\{[\s\S]*?aspect-ratio:\s*17 \/ 20;/);
});

test("catalog filters and product labels use the reference's quiet text treatment", async () => {
  const page = await readFile(pageUrl, "utf8");
  const css = await readFile(cssUrl, "utf8");

  assert.match(page, /<h2>\{piece\.title\}<\/h2>\s*<p>\{piece\.detail\}<\/p>/);
  assert.match(css, /\.filters button\s*\{[\s\S]*?padding:\s*0;[\s\S]*?border:\s*0;[\s\S]*?font-size:\s*16px;/);
  assert.match(css, /\.project-label\s*\{[\s\S]*?display:\s*flex;[\s\S]*?gap:\s*4px;/);
  assert.match(css, /\.project-label h2\s*\{[\s\S]*?font-weight:\s*500;/);
  assert.match(css, /\.project-label p\s*\{[\s\S]*?margin-top:\s*0;/);
});
