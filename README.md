# Leonida Ledger — GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/intan151/gta6-trophy-guide-leonida-v6/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/intan151/gta6-trophy-guide-leonida-v6/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/c/gta6-trophy-guide-01).

## What it does

- **Tracker** — every trophy with its official name, description and grade. Tick one off and it stays ticked (saved in your browser with localStorage). Export your progress to a file and import it back.
- **Filters** — by kind (story, missable, collectibles, activities, exploration, combat, money, online), by grade, by search, and hide-earned.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them (on by default).
- **Roadmap to the platinum** — five stages in order: story, side missions, collectibles, activities, then cleanup. Each stage shows how many of its trophies you have earned.
- **Missables flagged** — 19 trophies tied to a specific story mission or one-time moment, with advice to grab them on your first pass.
- **A guide for every trophy** — written in our own words for this entry, with steps and cited sources beside each one: the official list (Exophase, PSNProfiles) for the facts, and our own advice built from the official description — not yet checked in the game — for the steps. Where the official description names no place, the guide says so instead of guessing one.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

No build step, no network: open `app/index.html` in desktop Chrome with the network off and it works. Hand it in with:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html`, `app/app.js`, `app/style.css` — the guide
- `app/data/trophies.json` — the official 55 trophies with guides, steps and sources
- `screenshots/` — 4 real renders of the app
- `main.ts` — copies `app/` and `screenshots/` to the output and writes `dossier.json`
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE).
