import { readFile } from "node:fs/promises";
import YAML from "yaml";

const document = YAML.parse(await readFile(new URL("../contracts/openapi.yaml", import.meta.url), "utf8"));
const requiredPaths = ["/api/v1/elections", "/api/v1/lookup", "/api/v1/discovery", "/api/v1/openapi.json", "/api/docs"];

if (document.openapi !== "3.1.0") {
  throw new Error(`Expected OpenAPI 3.1.0, received ${document.openapi}`);
}
for (const path of requiredPaths) {
  if (!document.paths?.[path]) throw new Error(`OpenAPI contract is missing ${path}`);
}
if (!document.components?.schemas?.LookupResponse || !document.components?.schemas?.ErrorResponseBody) {
  throw new Error("OpenAPI contract is missing required response schemas");
}
console.log(`OpenAPI contract valid: ${requiredPaths.length} required paths`);
