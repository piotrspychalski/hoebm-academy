// Wszystkie teksty interfejsu (EN). Miejsce na PL: S_PL o tych samych kluczach (test i18n sprawdzi kompletność).
const S = {
  all: 'All', favs: 'Favourites', noFigures: 'No figures published yet.', noMatch: 'No figures match your search.',
  draft: 'DRAFT — local preview only',
  aim: 'What this figure shows', takeaways: 'Key points', unknowns: 'What we do not know', refs: 'References',
  disclaimer: 'Schematic, not to scale. Education, not medical advice.',
  startTitle: 'Before you start',
  startBody: [
    'HoEBM Academy is a set of interactive, schematic figures on the physiology of endurance sport, made by House of EBM.',
    'The figures are simplified on purpose. Shapes of curves are illustrative; only the numbers shown on screen come from the cited studies, and each one is listed with its source.',
    'This is education, not medical or training advice. It does not replace a doctor, a coach or a dietitian.',
  ],
  startOk: 'Got it',
  srcTitle: 'Sources', citeTitle: 'How to cite',
  cite: v => `Spychalski P. HoEBM Academy: interactive schematic figures on endurance-sport physiology [software]. House of EBM; 2026. Version ${v}. https://piotrspychalski.github.io/hoebm-academy/`,
  copy: 'Copy', copied: 'Copied', close: 'Close',
  emptyTitle: ['Science,', 'made clear.'], emptyLabel: 'HoEBM · ACADEMY',
  footer: v => `HoEBM Academy v${v} · Piotr Spychalski, MD, PhD · Code MIT · Figures CC BY 4.0 · House of EBM name and logo: all rights reserved.`,
};
const SERIES_LABEL = { gut: 'Gut', heat: 'Heat & cold', altitude: 'Altitude', training: 'Training', nutrition: 'Nutrition', masters: 'Masters', 'own-data': 'Own data' };
const SERIES_ORDER = ['gut', 'heat', 'altitude', 'training', 'nutrition', 'masters', 'own-data'];
