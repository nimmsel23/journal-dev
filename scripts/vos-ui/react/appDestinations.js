// Navigation metadata stays independent of app bundles so Journal can build alone.
const fitnessNav = [
  { id: 'session', label: 'Training', sub: [['today', 'Heute'], ['timer', 'Timer'], ['skills', 'Skills'], ['plan', 'Plan'], ['history', 'History']] },
  { id: 'review', label: 'Review', sub: [['muscles', 'Muskeln'], ['readiness', 'Readiness'], ['verlauf', 'Verlauf']] },
  { id: 'learn', label: 'Lernen', sub: [['exercises', 'Übungen'], ['anatomy', 'Anatomie'], ['quiz', 'Quiz'], ['strength', 'Stärke']] },
]

// Shell IDs and standalone hashes differ for nested Fitness views.
export function getAppDestinations(app) {
  if (app === 'fitness') {
    return fitnessNav.filter(({ id }) => ['session', 'review', 'learn'].includes(id)).flatMap(({ id, label, sub = [] }) => [
      { label, subTab: id, href: `https://fitness-vos.web.app/#${id}` },
      ...sub.map(([key, name]) => ({ label: `${label} · ${name}`, subTab: key, href: `https://fitness-vos.web.app/#${id}/${key}` })),
    ])
  }
  if (app === 'fuel') {
    // Link metadata only: importing Fuel's lazy view registry into Journal
    // would also bundle Fuel views and their app-specific API aliases.
    return [['log', 'Log'], ['food', 'Food'], ['recipes', 'Rezepte'], ['catalog', 'Katalog'], ['history', 'Historie'], ['report', 'Protokoll'], ['supplements', 'Supplements'], ['micros', 'Mikros']].map(([key, label]) => ({
      label, subTab: key, href: `https://fuel-vos.web.app/#${key}`,
    }))
  }
  if (app === 'relax') {
    return [['dash', 'Heute'], ['session', 'Session'], ['stats', 'Statistik'], ['physio', 'Physio'], ['catalog', 'Katalog']].map(([subTab, label]) => ({
      label, subTab, href: `https://relax-vos.web.app/#${subTab}`,
    }))
  }
  if (app === 'journal') {
    return [
      { label: 'Journal', subTab: null },
      ...[['tag', 'Tag'], ['woche', 'Woche'], ['monat', 'Monat'], ['habits', 'Habits']].map(([mode, label]) => ({ label: `Journal v2 · ${label}`, href: `https://vos-journal.web.app/#v2/${mode}` })),
      ...['potential', 'plan', 'production', 'profit'].map((mode) => ({ label: `Door · ${mode[0].toUpperCase()}${mode.slice(1)}`, href: `https://vos-door.web.app/#door2/${mode}` })),
      ...['frame', 'freedom', 'focus', 'fire'].map((mode) => ({ label: `Game · ${mode[0].toUpperCase()}${mode.slice(1)}`, href: `https://vos-game.web.app/#${mode}` })),
      { label: 'Voice', href: 'https://vos-voice.web.app/#voice' },
      { label: "General’s Tent", href: 'https://vos-tent.web.app/#tent2' },
    ]
  }
  return []
}
