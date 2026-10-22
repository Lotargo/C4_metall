# Knowledge Microservice Integration (.splav-parser)

## Purpose & Strict Engineering Rules
1. **Never guess material parameters or machine feasibility from model memory.**
   All steel grades, chemical compositions, mechanical properties, densities, hardness values, and machine park limits must come directly from the authoritative `.splav-parser` microservice.
2. **Access Methods:**
   - **MCP Protocol (stdio/SSE):** Server binary `F:\projects\metall-sandbox\.splav-parser\splav-parser.exe mcp`
   - **HTTP REST API (local):** `http://127.0.0.1:8765/v1/`

---

## 1. Material Resolution Workflow

When an engineering drawing discloses a material specification (in the title block / основная надпись, technical requirements / техтребования, or notes):
1. **Identify the raw material text**, e.g.:
   - `35 ГОСТ 1051-73` $\to$ grade: `35`
   - `40Х ГОСТ 4543-71` $\to$ grade: `40Х`
   - `09Г2С ГОСТ 19281-2014` $\to$ grade: `09Г2С`
   - `110Г13Л` $\to$ grade: `110Г13Л`
   - `Hardox 500` $\to$ search analog or direct grade `Hardox 500`
2. **Invoke `splav_search(query=grade)`**:
   Returns matching material candidates with their internal integer `id` and material class.
3. **Invoke `splav_material(id=material_id, sections=["mechanical", "hardness", "composition"])`**:
   Extract authoritative facts:
   - Density $\rho$ (typically $7.85$ g/cm³ for carbon/low-alloy steels)
   - Hardness (HB, HRC)
   - Yield strength $\sigma_{0.2}$ and tensile strength $\sigma_B$
   - Chemical composition bounds (% C, Mn, Si, Cr, Ni, Mo)
   - Permissible substitutes and delivery forms (круги, листы, поковки).

---

## 2. Machine Matching Workflow

When drawing dimensions and required operations are determined:
1. **Determine the primary and secondary operations**:
   - `turning` — for rotational outer/inner surfaces, threads, chamfers, grooves;
   - `boring` — for internal cylindrical boring, deep holes;
   - `milling` — for wrench flats (лыски), slots, keyways, planar surfaces;
   - `drilling` — for holes, bolt patterns;
   - `saw_cut` — for cutting initial bar stock into billets on band saws;
   - `laser_cut` / `plasma_cut` / `waterjet_cut` — for planar contour cutting from sheet/plate;
   - `shearing` — for guillotine shear cuts.
2. **Extract workpiece bounding envelope**:
   - Rotational parts: `diameter_mm` ($\varnothing$), `length_mm` ($L$), `mass_kg` ($m$);
   - Prismatic/Sheet parts: `thickness_mm` ($S$), `width_mm` ($B$), `length_mm` ($L$), `mass_kg` ($m$).
3. **Invoke `machines_match(...)`**:
   Arguments:
   ```json
   {
     "operation": "turning",
     "diameter_mm": 24.0,
     "length_mm": 250.0,
     "mass_kg": 0.9,
     "confirmed_only": false
   }
   ```
4. **Evaluate Machine Match Results**:
   - `PASS`: Full compatibility with confirmed passport parameters.
   - `PASS_WITH_WARNING`: Feasible, but unconfirmed or has missing non-critical passport parameters (e.g. mass limit not stated in passport).
   - `REJECT`: Unfeasible (dimensional limit exceeded or operation unsupported). Note the exact rejection reason.
   - For accepted machines, extract the `manuals` array to reference the factory operating manual or passport PDF.

---

## 3. Summary of Available MCP Tools

| MCP Tool Name | Description | Key Arguments |
| :--- | :--- | :--- |
| `splav_search` | Fuzzy search for steel grades, aliases, and foreign analogs | `query: string` |
| `splav_resolve` | Strict exact resolution of grade name to ID | `query: string` |
| `splav_material` | Detailed material passport (chemical, mechanical, hardness) | `id: int`, `sections: string[]` |
| `splav_advanced_search` | Multi-criteria search by composition, standard, hardness | `standard`, `hardness_min`, etc. |
| `machines_stats` | Overview of factory machine park | None |
| `machines_search` | Search machine by name, model, shop, or operation | `query`, `shop`, `class`, `op` |
| `machine_card` | Full passport of machine by position (1-44) | `pos: string` |
| `machines_match` | Match machines against workpiece dimensions and operation | `operation`, `diameter_mm`, `length_mm`, `width_mm`, `height_mm`, `thickness_mm`, `mass_kg` |
