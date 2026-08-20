import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/page.tsx", import.meta.url);
const cssUrl = new URL("../app/globals.css", import.meta.url);

test("floating header is white with a subtle shadow and no divider", async () => {
  const css = await readFile(cssUrl, "utf8");
  const block = css.match(/\.site-header\.is-floating\s*\{([\s\S]*?)\}/)?.[1] ?? "";

  assert.match(block, /border-bottom:\s*0;/);
  assert.match(block, /background:\s*#fff;/);
  assert.match(block, /box-shadow:\s*0 4px 18px rgba\(0, 0, 0, 0\.045\);/);
});

test("header and footer navigation use the catalog filter treatment", async () => {
  const page = await readFile(pageUrl, "utf8");
  const css = await readFile(cssUrl, "utf8");

  assert.match(page, /className="telegram-button"/);
  assert.match(page, /className="footer-telegram"/);
  assert.match(page, />\s*Наверх\s*<span aria-hidden="true">↑<\/span>/);
  assert.match(css, /\.header-nav > a,[\s\S]*?\.order-nav-button\s*\{[\s\S]*?font-size:\s*16px;/);
  assert.match(css, /\.footer-telegram,[\s\S]*?\.back-to-top\s*\{[\s\S]*?background:\s*transparent;/);
});

test("footer is compact while the product action geometry stays unchanged", async () => {
  const css = await readFile(cssUrl, "utf8");
  const footer = css.match(/\.site-footer\s*\{([\s\S]*?)\}/)?.[1] ?? "";
  const studio = css.match(/\.studio\s*\{([\s\S]*?)\}/)?.[1] ?? "";
  const add = css.match(/\.project-add\s*\{([\s\S]*?)\}/)?.[1] ?? "";

  assert.match(footer, /min-height:\s*60px;/);
  assert.match(footer, /padding:\s*0;/);
  assert.match(studio, /padding:\s*120px 0 96px;/);
  assert.match(add, /padding:\s*10px 9px 9px;/);
  assert.match(add, /margin-top:\s*8px;/);
});
