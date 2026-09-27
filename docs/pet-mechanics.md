# Mochi, the Persian companion

This feature lives in the GitHub Pages project at `23122023-github-pages-ready (1)/23122023`.

## Research and design

The developer's [official Pou listing](https://play.google.com/store/apps/details?hl=en_US&id=me.pou.app) describes feeding, cleaning, games that earn coins, growing through levels, and unlocking outfits and other customizations. [Pou's official website](https://www.pou.me/) identifies the original game. The care loop inspired this feature; the cat artwork, games, interfaces, progression thresholds, and numerical balancing here are original implementations. The official description does not publish exact depletion rates, so the rates below are our design choices, not claimed Pou values.

## Shared pet

The Pet app and desktop companion use one state controller. Closing the Pet window does not discard progress. The companion wanders along the desktop, follows the cursor with its eyes, reacts to petting, and can be dragged horizontally. Double-click it or choose its Home button to open Pet. Its desktop presence can be toggled inside Pet.

The original vector rig is `components/pet/PersianCat.tsx`. It animates independent eyes, head, paws, and tail, with eating, playing, bubbles, hearts, and sleeping reactions. A self-contained animated preview asset is included at `public/assets/pet/persian-cat.svg`. No Pou artwork or third-party cat asset is used. Reduced-motion preferences are respected.

## Needs and elapsed time

All four needs use 0–100. Hunger is displayed as fullness: 100 means fully fed. No death or permanent loss occurs when needs reach zero.

| Need | Per minute while visible | Per minute offline/hidden |
| --- | ---: | ---: |
| Fullness | -0.7 | -0.07 |
| Happiness | -0.55 | -0.055 |
| Energy, awake | -0.5 | -0.05 |
| Cleanliness | -0.45 | -0.045 |
| Energy, sleeping | +4 | +0.4 |

Sleeping reduces fullness loss to -0.3/-0.03 and happiness loss to -0.2/-0.02 per minute. Elapsed time is evaluated on a five-second tick, visibility transitions, reopening, and page exit. Offline catch-up is capped at twelve hours per absence, and negative clock differences never increase needs. A closed web page does not run a background process; its elapsed time is calculated when reopened.

## Care, economy, and growth

- The starting wallet holds 100 coins and a small food supply.
- Kibble costs 5 coins and restores 18 fullness; fish costs 12 and restores 32; chicken costs 18 and restores 42. Feeding consumes one item and slightly reduces cleanliness. A free +12 snack is always available.
- Bathing restores 35 cleanliness and 4 happiness. Petting restores 6 happiness. Ball/feather play restores 14 happiness and consumes some energy, fullness, and cleanliness.
- Care actions have short cooldowns; feeding a full cat and washing an already clean cat do not award XP. Petting a fully happy cat still animates but does not award XP.
- Sleeping pets must wake before feeding, washing, or playing. Games require at least 10 energy.
- Catch Stars lasts 25 seconds and gives 2 coins per catch, capped at 45. Memory Pairs has four pairs and a 45-second timer, with completion and speed bonuses. Each game settles its reward once. Leaving an unfinished game does not award coins.
- Level is `floor(sqrt(XP / 60)) + 1`. Stage changes to adolescent at level 4 (540 XP) and adult at level 8 (2940 XP); the cat grows visually with its stage.
- Bow, bell collar, and crown unlock at levels 2, 4, and 6. Purchased accessories can be equipped again without another charge.

## Storage and GitHub Pages

State is versioned and saved in browser localStorage under `memory-desktop-persian-pet-v1`. It includes needs, timestamps, sleep, inventory, coins, XP, accessories, name, and the companion toggle. The archive backup also includes pet state. Each browser maintains its own pet; there is no cross-device synchronization or server requirement.

Use `npm run dev` for a local preview and `npm run build:pages` for the static Pages output. Artwork and existing MP3 assets are copied from `public` during the build.
