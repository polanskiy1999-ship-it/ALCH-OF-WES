import { existsSync } from "node:fs";
import { resolve } from "node:path";

const requiredArtifacts = [
  "index.html",
  "CNAME",
  "og-alchemy-wordmark.png",
  "images/tulip-grand-wide.jpg",
];

const missingArtifacts = requiredArtifacts.filter(
  (artifact) => !existsSync(resolve("dist-pages", artifact)),
);

if (missingArtifacts.length > 0) {
  console.error(`Pages build is missing: ${missingArtifacts.join(", ")}`);
  process.exit(1);
}

console.log("GitHub Pages build contains all required artifacts.");
