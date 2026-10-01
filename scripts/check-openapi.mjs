import { readFile } from "node:fs/promises";
import YAML from "yaml";

const document = YAML.parse(await readFile(new URL("../contracts/openapi.yaml", import.meta.url), "utf8"));
const companionDocument = YAML.parse(await readFile(new URL("../companion/openapi.yaml", import.meta.url), "utf8"));
const requiredPaths = ["/api/v1/elections", "/api/v1/lookup", "/api/v1/discovery", "/api/v1/divisions", "/api/v1/divisionsByAddress", "/api/v1/openapi.json", "/api/docs"];
const companionPaths = ["/healthz", "/v1/consents"];

if (document.openapi !== "3.1.0") {
  throw new Error(`Expected OpenAPI 3.1.0, received ${document.openapi}`);
}
for (const path of requiredPaths) {
  if (!document.paths?.[path]) throw new Error(`OpenAPI contract is missing ${path}`);
}
if (!document.components?.schemas?.LookupResponse || !document.components?.schemas?.ErrorResponseBody) {
  throw new Error("OpenAPI contract is missing required response schemas");
}
if (companionDocument.openapi !== "3.1.0") {
  throw new Error(`Expected companion OpenAPI 3.1.0, received ${companionDocument.openapi}`);
}
for (const path of companionPaths) {
  if (!companionDocument.paths?.[path]) throw new Error(`Companion OpenAPI contract is missing ${path}`);
}
if (!companionDocument.components?.schemas?.ConsentRequest || !companionDocument.components?.schemas?.ConsentReceipt) {
  throw new Error("Companion OpenAPI contract is missing required consent schemas");
}
console.log(`OpenAPI contracts valid: ${requiredPaths.length} provider paths, ${companionPaths.length} companion paths`);
