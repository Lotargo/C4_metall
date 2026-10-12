import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const data = JSON.parse(await readFile("src/data/evidence.json", "utf8"));
let checks = 0;
for (const object of [
  ...Object.values(data.nodes),
  ...data.steps,
  ...data.agents,
  ...data.storageGroups,
]) {
  for (const id of object.sources) {
    if (!data.sources[id]) throw Error("Missing reference " + id);
    checks++;
  }
}
for (const object of [
  ...data.presentation.outcomes,
  ...data.presentation.recognitionPhases,
  ...data.presentation.dataDestinations,
  ...data.screenshots,
]) {
  for (const id of object.sources) {
    if (!data.sources[id]) throw Error("Missing presentation reference " + id);
    checks++;
  }
}
for (const screenshot of data.screenshots) {
  const bytes = await readFile("public" + screenshot.file);
  if (createHash("sha256").update(bytes).digest("hex") !== screenshot.sha256)
    throw Error("Screenshot hash mismatch " + screenshot.file);
}
for (const diagram of Object.values(data.diagrams)) {
  const ids = new Set(diagram.nodes.map((n) => n.id));
  for (const n of diagram.nodes) {
    if (!data.nodes[n.id]) throw Error("Unknown node " + n.id);
    checks++;
  }
  for (const e of diagram.edges) {
    if (!ids.has(e.from) || !ids.has(e.to)) throw Error("Broken edge");
    checks++;
  }
}
for (const g of data.storageGroups)
  for (const table of g.tables) {
    if (!data.tables[table]?.fields.length)
      throw Error("Missing fields " + table);
    checks++;
  }
// Local snapshots are retained for audit but excluded from source publication.
let verified = 0;
for (const s of Object.values(data.sources)) {
  try {
    const raw = await readFile(".evidence/source/" + s.path);
    if (createHash("sha256").update(raw).digest("hex") !== s.sha256)
      throw Error("Hash mismatch " + s.path);
    if (
      raw
        .toString()
        .split(/\r?\n/)
        .slice(s.start - 1, s.end)
        .join("\n") !== s.excerpt
    )
      throw Error("Excerpt mismatch " + s.id);
    verified++;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
if (
  JSON.stringify(data) !==
  JSON.stringify(JSON.parse(await readFile("public/architecture.json", "utf8")))
)
  throw Error("Download differs");
console.log(
  JSON.stringify({
    status: "passed",
    referencesAndEdges: checks,
    verifiedExcerpts: verified,
    sourceSnapshot: data.audit.capturedAt,
  }),
);
