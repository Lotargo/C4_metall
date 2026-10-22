# Engineering drawing vision

Use this skill to read a single-page PDF or raster engineering drawing. First check `document_source`
for the actual content, extraction status, coverage gaps and permitted tools. For PDF use available
indexed literals and positions as source evidence; do not visually re-read every reliable extracted
word. Keep the overview and original pixels available for geometry, ambiguous marks and owners.
For standalone raster, scanned/image regions, outlined text or failed extraction, read pixels/crops.
Read `references/pdf-vs-raster.md` when choosing or combining these channels.

1. Inspect the whole page before requesting detail regions. Identify the views, sections and
   enlarged details, and distinguish their source contexts from physical features of the part.
2. Build a complete inventory of visible textual and symbolic engineering annotations.
3. Record only source-backed drawing facts. Do not infer obscured geometry or calculate manufacturing
   quantities.
4. Select a small number of source regions that retain the annotation, its extension or leader
   lines, the associated feature, and enough neighboring context to verify the relationship.
5. Verify each selected crop against the whole-page preview. Request one wider crop only when the
   relevant source content is clipped.
6. Preserve raw readings and source-backed evidence. Keep significant observations that do not fit
   the current schema as unsupported/unmapped observations.
   Keep annotation IDs in evidence.annotation_refs; conflict affected_refs and alternative fact_refs
   address existing facts only. Preserve an unresolved link as a candidate without guessing another
   target or treating an unknown owner as whole_part.
7. Check annotation-to-fact coverage before finalizing canonical observations. Do not build a
   DrawingPassport or optimize observations for the operator table; Passport Builder owns that.

Read only the reference needed for the current decision:

- `references/bbox-selection.md` for coordinate and context rules.
- `references/crop-verification.md` for crop sufficiency and retry decisions.
- `references/dimension-reading.md` for literal dimension transcription.
- `references/geometry-relations.md` for source-backed relationships.
- `references/evidence-policy.md` for evidence, coverage, and unsupported observations.
- `references/pdf-vs-raster.md` for source classification, PDF libraries/queries and raster fallback.

This skill describes procedure. It does not grant tools, filesystem access, network access, or
permission to bypass runtime schemas, validators, retry limits, or operator controls.
