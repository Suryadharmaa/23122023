# Memory Desktop

A browser desktop memory archive. This repository is prepared for GitHub Pages at `/23122023/`.

## Development

```sh
pnpm install --frozen-lockfile
pnpm run build:pages
```

The GitHub Actions workflow deploys `dist-pages` from the `main` branch. In repository Settings → Pages, select **GitHub Actions** as the build source.

Music files can be selected inside the Music app. Imported audio is stored in the browser and is not part of this repository or its public Pages site.

The Pet app in the Dock shares a Persian cat with the animated desktop companion. Feed, bathe, play, and let it sleep; earn coins in two minigames, buy food and accessories, and grow from kitten to adult. Needs fall ten times more slowly while away. Pet progress stays in this browser and is included in archive backups.

The original cat rig, animated SVG asset, care balancing, and research sources are documented in `docs/pet-mechanics.md`.
