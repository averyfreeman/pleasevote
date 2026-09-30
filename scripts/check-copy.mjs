import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const publicRoots = ["README.md", "ENV_CHANGES.md", "docs/spec.md", "docs-site/src", "app"];
const forbiddenPatterns = [
  new RegExp(["get", "keys.sh"].join("-"), "i"),
  new RegExp(["secret", "runner"].join("\\s+"), "i"),
  new RegExp(["key", "runner"].join("\\s+"), "i"),
  new RegExp(["GOOGLE", "CIVIC", "API", "KEY"].join("_"), "i"),
  new RegExp(["GMAPS", "API", "KEY"].join("_"), "i"),
  new RegExp(["GOOGLE", "MAPS", "API", "KEY"].join("_"), "i"),
  new RegExp(["CIVIC", "API", "KEY"].join("_"), "i"),
  new RegExp(["VITE", "GOOGLE", "CIVIC", "API", "KEY"].join("_"), "i"),
];
const requiredLinks = [
  "https://developers.google.com/maps/documentation/geocoding",
  "https://developers.google.com/civic-information",
];

function filesUnder(pathname) {
  const absolutePath = join(root, pathname);
  if (statSync(absolutePath).isFile()) return [absolutePath];
  return readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const child = join(absolutePath, entry.name);
    return entry.isDirectory() ? filesUnder(relative(root, child)) : [child];
  });
}

const files = publicRoots.flatMap(filesUnder);
const failures = [];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const relativePath = relative(root, file);
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) failures.push(`${relativePath}: forbidden copy ${pattern}`);
  }
}

const readme = readFileSync(join(root, "README.md"), "utf8");
for (const link of requiredLinks) {
  if (!readme.includes(link)) failures.push(`README.md: missing provider link ${link}`);
}

if (failures.length) {
  console.error("Copy policy failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Copy policy valid: ${files.length} public files checked`);
}
