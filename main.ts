// Leonida Ledger — the program that hands this guide in (Node 22, standard library only).
// The guide itself is plain static files under app/: index.html, its script and
// stylesheet, and app/data/trophies.json with the 55 trophies and their guides.
// This program copies app/ and screenshots/ beside this file into the output
// directory and writes dossier.json there with the vendored make.fun library,
// which is the summary the judge reads. vendor/makefun-frontend.ts is the kit's
// copy and must stay byte for byte as handed out.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Caps from the competition's gate: at most 4 screenshots of 256 KiB each,
// at most 993 files and directories in app/ and 48 MiB of app files in all,
// and the dossier text at most 160 KiB. buildDossier refuses anything past them.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
