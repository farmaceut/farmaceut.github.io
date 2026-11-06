# Tunneling correction calculator (client-side JavaScript)

Browser implementation of the equations of the manuscript (not a line-by-line port of the Python package; agreement with it is quantified in `tests/python_agreement.js`). Subpage for a GitHub Pages site. Everything runs in the browser; nothing is uploaded.

## Deployment
1. Copy this folder to `farmaceut.github.io/tools/tunneling/` (the URL becomes `.../tools/tunneling/`).
2. Link to it from the main page, e.g. `<a href="tools/tunneling/">Tunneling calculator</a>`.
3. Edit `window.TNL_CONFIG` at the top of `index.html` (paper DOI, repository/Zenodo link, `homeUrl`).
4. Test locally over HTTP, not `file://` (the Web Worker needs http/https; without it the page falls back to the main thread and is slower):
   `python3 -m http.server` in the site root, then open `http://localhost:8000/tools/tunneling/`.

## Files
`index.html` (page and config) · `tunneling.css` · `core.js` (physics) · `irc.js` (ORCA/Gaussian parsers) · `plots.js` (SVG plots, no dependencies) · `tasks.js`, `worker.js` (heavy computations in a worker) · `app.js` (interface) · `examples/` (synthetic inputs) · `tests/` (Node checks).

## Inputs
* If you have absolute energies instead of V1 and ΔE (e.g. AH + B → A + BH): open “I have energies of reactants, transition state and products” on the first tab; enter E(reactants) as a sum (`a + b`), E(TS), E(products) (hartree, kcal/mol, kJ/mol or eV, optional ZPE) – the page computes V1 = E(TS) − E(R) and ΔE = E(P) − E(R). Free energies (ΔG‡, ΔG_rxn) are not the right input: κ needs electronic energy + ZPE.
* Three numbers: V1, ΔE, |ν‡| and T ("Simple" mode: Wigner, truncated parabola, Eckart and κ(T)); "Advanced" mode adds exact 1D references on model profiles, path-based models and isotope effects.
* ORCA: `*_IRC_Full_trj.xyz` (or `_B_trj.xyz` + `_F_trj.xyz`); energy from the comment line, mass-weighted arc length from the geometries (masses: most abundant isotopes by default; standard atomic weights as in the Python package are selectable).
* Gaussian: IRC output (`.log`/`.out`), table "Summary of reaction path following" (RxCoord in bohr·amu^½).
* Any two-column table (s, V) with units; imaginary frequency can be read from a Gaussian/ORCA frequency output.

## Tests (Node ≥ 14)
`node tests/run_all.js` runs all of them (about 5 min). Each file states in its first line what it checks: the Eckart path and exact solver against the analytic barrier (`eckart_path`, `exact_solver_eckart`), the model profiles of the manuscript (`manuscript_profiles`, `double_hump`), the IRC parsers (`irc_parsers`), the semiclassical theories against the tables of the original papers (`svpt4_tables`, `usit_table`, `mvpt_tables`), JS against the Python package on matched profiles (`python_agreement`, `python_agreement_orca`, `python_agreement_semiclassical`, `python_agreement_lawrence`; reference values in `tests/pyref/`, regenerate with `gen_ref.py`), the sensitivity to implementation choices (`implementation_sensitivity`, `numerical_options`) and the comparison of the literature theories with ZCT-EC and EQ-FREQ (`semiclassical_pipeline`, `semiclassical_vs_calibrations`). `node tests/genexamples.js` regenerates `examples/`.

## Scope and limits
One-dimensional models only: Wigner, truncated parabola, Eckart, ZCT-MEP, ZCT-EC, EQ-FREQ and the exact 1D Schrödinger reference. In Advanced mode, for the model profiles, also: standard and uniform instanton (USIT), mVPT2/mYF (ħ²), SVPT2/SVPT4/mSVPT4 (ħ⁴) and the one-dimensional exact-WKB ħ²/ħ⁴ transmission of Lawrence (complex-plane loop integrals) from `semiclassical.js` (tests `svpt4_tables`–`python_agreement_lawrence`; JS agrees with the independent Python implementation of the manuscript to 5·10⁻³ % on six model profiles, `python_agreement_semiclassical`, `python_agreement_lawrence`). These theories need derivatives at the barrier top or the potential at complex coordinates, so they run only on the closed-form model profiles, not on a tabulated IRC. Not implemented: the multidimensional parts of Lawrence's framework, SCT/LCT/μOMT (reduce to ZCT in 1D; need reaction-path curvature), RPMD and ring-polymer instanton (dynamical, multidimensional). The Gaussian parser has been tested on synthetic files only; check it on one of your real logs before publishing. The exact 1D reference on an IRC path is not validated for paths with deep intermediate wells.
