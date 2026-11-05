# Sports Academy: interactive schematic figures on endurance-sport physiology

**Author:** Piotr Spychalski, MD, PhD — surgeon, clinical researcher and cyclist · House of EBM
**Live:** https://piotrspychalski.github.io/sports-academy/

Sports Academy explains the physiology of endurance sport with one large interactive, schematic animation of the athlete's body (the "energy map"), in the evidence-based-medicine style of House of EBM. Pick a topic (fuel and energy; gut, liver and glycogen; thresholds and limits; altitude; heat and hydration; training, recovery and more) and an organ, then move the sliders: intensity, time, carbohydrate intake, glycogen, altitude, the athlete. Each topic has a short text and its sources.

**The rule:** every number shown on screen comes from a cited source; shapes of curves are illustrative and labelled as such ("Sources, and what is illustrative" in the footer).

## Important disclaimer

Sports Academy is a **schematic educational tool**, not medical, nutritional or training advice, and not a medical device.

## Build and test

    node build.js     → dist/index.html (the animation, reference/energy-map.html; one self-contained file; no dependencies)
    npm test          (or: bash tests/uruchom_wszystkie.sh)

Technical documentation: [docs/TECHNICAL.md](docs/TECHNICAL.md).

## License

Code: MIT ([LICENSE](LICENSE)). Figure content: CC BY 4.0 ([LICENSE-CONTENT](LICENSE-CONTENT)). The House of EBM name and logo are excluded from both licenses: all rights reserved ([LICENSE-LOGO](LICENSE-LOGO)). Fonts: Montserrat, IBM Plex Sans and IBM Plex Mono via Google Fonts (SIL Open Font License).
