import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/page.tsx", import.meta.url);
const cssUrl = new URL("../app/globals.css", import.meta.url);

test("product carousel is manually controlled with bounded arrow navigation", async () => {
  const page = await readFile(pageUrl, "utf8");

  assert.match(page, /AnimatePresence/);
  assert.match(page, /ChevronLeft/);
  assert.match(page, /ChevronRight/);
  assert.match(page, /disabled=\{activeImage === 0\}/);
  assert.match(page, /disabled=\{activeImage === piece\.images\.length - 1\}/);
  assert.doesNotMatch(page, /setInterval|setTimeout|autoDelay/);
});

test("carousel transition and compact indicators do not change card geometry", async () => {
  const css = await readFile(cssUrl, "utf8");

  assert.match(css, /\.project-carousel-button\s*\{/);
  assert.match(css, /\.project-carousel-indicator\.is-active\s*\{[\s\S]*?width:\s*32px;/);
  assert.match(css, /\.project-media\s*\{[\s\S]*?aspect-ratio:\s*17 \/ 20;/);
  assert.doesNotMatch(css, /animation-duration:\s*5s|animation:\s*[^;]*progress/);
});
