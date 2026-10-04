# Design source for the cinematic home page

- `prototypes/` — the approved prototypes (desktop: Prototype B; mobile). They are the source for `components/cinematic/*Home.tsx` (run `bash scripts/cinematic/gen.sh`).
- `assets-manifest.json` — every design asset, mapped to its file in `public/cinematic/`.
- `design-tokens.json`, `content.json` — colours, type, motion and copy.
- `docs/` — the full spec: scroll engine, every section timeline, shared transitions, mobile and touch rules, product section, SEO and launch QA. (Paths like `reference/` and `assets/` in these docs refer to the standalone design kit; in this repo the assets live in `public/cinematic/`.)

See `../CINEMATIC_HOME.md` for how the page is built.
