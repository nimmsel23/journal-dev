/**
 * Translation utility for muscle names and groups.
 * Supports German (de), Latin (lat), and English (en).
 */

const GROUP_TRANSLATIONS = {
  de: {
    chest: 'Brust',
    back: 'Rücken',
    shoulders: 'Schultern',
    arms: 'Arme',
    core: 'Bauch',
    glutes: 'Gesäß',
    quads: 'Beinstrecker',
    hamstrings: 'Beinbeuger',
    calves: 'Waden',
    legs: 'Beine',
    trapezius: 'Nacken',
  },
  en: {
    chest: 'Chest',
    back: 'Back',
    shoulders: 'Shoulders',
    arms: 'Arms',
    core: 'Core',
    glutes: 'Glutes',
    quads: 'Quads',
    hamstrings: 'Hamstrings',
    calves: 'Calves',
    legs: 'Legs',
    trapezius: 'Traps',
  },
  lat: {
    chest: 'Thorax',
    back: 'Dorsum',
    shoulders: 'Deltoideus',
    arms: 'Membrum sup.',
    core: 'Core',
    glutes: 'Gluteus',
    quads: 'Quadriceps',
    hamstrings: 'Ischiocrurale',
    calves: 'Sura',
    legs: 'Membrum inf.',
    trapezius: 'Trapezius',
  }
};

export function translateMuscleGroup(groupId, lang = 'de') {
  const l = lang === 'lat' ? 'lat' : (lang === 'en' ? 'en' : 'de');
  return GROUP_TRANSLATIONS[l]?.[groupId] || groupId;
}

// Maps numeric muscle slug prefix → group ID
function numericSlugToGroup(id) {
  const m = String(id).match(/^(\d+)/);
  if (!m) return null;
  const n = parseInt(m[1]);
  if (n >= 100 && n < 200) return 'chest';
  if (n >= 200 && n < 300) return 'back';
  if (n >= 300 && n < 400) return 'shoulders';
  if (n >= 400 && n < 500) return 'arms';
  if (n >= 500 && n < 600) return 'core';
  if (n >= 600 && n < 700) {
    if (n <= 602) return 'glutes';
    if (n === 603) return 'quads';
    if (n === 604) return 'hamstrings';
    return 'legs';
  }
  if (n >= 700 && n < 800) return 'calves';
  return null;
}

// SOT: catalog/kb/muscles/muscle_index.yml -- string_aliases. Hier gespiegelt
// damit der Browser ohne Server-Roundtrip kanonische IDs auflösen kann.
// Lookup-Form siehe muscleKey(): lower-case, Whitespace statt Underscores,
// ohne Nummer-Präfix.
const STRING_ALIASES = {
  // Aus muscle_index.yml -- 1:1
  'abdominals':  '500_core',
  'abductors':   '602_gluteus_medius',
  'adductors':   '610_adductors',
  'biceps':      '401_biceps_brachii',
  'calves':      '700_calves',
  'chest':       '100_chest',
  'forearms':    '405_forearm_flexors',
  'glutes':      '601_gluteus_maximus',
  'hamstrings':  '604_hamstrings',
  'lats':        '201_latissimus_dorsi',
  'lower back':  '206_erector_spinae',
  'middle back': '200_back',
  'neck':        '202_trapezius_upper',
  'quadriceps':  '603_quadriceps',
  'shoulders':   '300_shoulders',
  'traps':       '202_trapezius_upper',
  'triceps':     '403_triceps_brachii',
  // Ergänzungen für bare snake_case / Volltext aus wger/yuhonas (KB hat sie nicht)
  'biceps brachii':       '401_biceps_brachii',
  'biceps femoris':       '607_biceps_femoris',
  'brachialis':           '402_brachialis',
  'brachioradialis':      '404_brachioradialis',
  'erector spinae':       '206_erector_spinae',
  'forearm flexors':      '405_forearm_flexors',
  'gastrocnemius':        '701_gastrocnemius',
  'gluteus maximus':      '601_gluteus_maximus',
  'gluteus medius':       '602_gluteus_medius',
  'iliopsoas':            '611_iliopsoas',
  'latissimus dorsi':     '201_latissimus_dorsi',
  'obliques':             '502_obliquus_externus',
  'obliquus externus':    '502_obliquus_externus',
  'pectoralis major':     '101_pectoralis_major',
  'quadriceps femoris':   '603_rectus_femoris',
  'quadratus lumborum':   '208_quadratus_lumborum',
  'rectus abdominis':     '501_rectus_abdominis',
  'rectus femoris':       '603_rectus_femoris',
  'rhomboids':            '205_rhomboids',
  'rotator cuff':         '304_rotator_cuff',
  'semitendinosus':       '608_semitendinosus',
  'semimembranosus':      '609_semimembranosus',
  'serratus anterior':    '104_serratus_anterior',
  'soleus':               '702_soleus',
  'teres major':          '207_teres_major',
  'transverse abdominis': '504_transverse_abdominis',
  'triceps brachii':      '403_triceps_brachii',
  'vastus lateralis':     '604_vastus_lateralis',
  'vastus medialis':      '605_vastus_medialis',
  'vastus intermedius':   '606_vastus_intermedius',
  'anterior deltoid':     '301_anterior_deltoid',
  'lateral deltoid':      '302_lateral_deltoid',
  'posterior deltoid':    '303_posterior_deltoid',
  'trapezius':            '202_trapezius_upper',
  'upper traps':          '202_trapezius_upper',
  // Sammelbegriffe → erstes Mitglied der Gruppe (für Region/Normal okay)
  'deltoid':       '300_shoulders',
  'deltoids':      '300_shoulders',
  'pectoralis':    '101_pectoralis_major',
  'pectoralis minor': '101_pectoralis_major',
  'core':          '500_core',
  'abs':           '500_core',
  'shoulder':      '300_shoulders',
  'forearm':       '405_forearm_flexors',
  'quads':         '603_rectus_femoris',
  'arms':          '400_arms',
  'back':          '200_back',
  'legs':          '600_legs',
  'trapezius upper':  '202_trapezius_upper',
  'trapezius middle': '203_trapezius_middle',
  'trapezius lower':  '204_trapezius_lower',
};

// Volltext-Muskelnamen → group/region. Wird sowohl für region-Modus genutzt
// als auch als Fallback in normal-Modus.
const NAME_TO_GROUP = {
  // chest
  'chest': 'chest', 'pectoralis': 'chest', 'pectoralis major': 'chest', 'pectoralis minor': 'chest',
  'pectoralis major clavicular': 'chest', 'pectoralis major sternal': 'chest',
  'serratus anterior': 'chest',
  // back
  'back': 'back', 'latissimus': 'back', 'latissimus dorsi': 'back', 'lats': 'back',
  'rhomboids': 'back', 'rhomboideus': 'back', 'erector spinae': 'back', 'erectors': 'back',
  'lower back': 'back', 'middle back': 'back', 'upper back': 'back',
  'teres major': 'back', 'teres minor': 'back', 'quadratus lumborum': 'back',
  // shoulders
  'shoulders': 'shoulders', 'shoulder': 'shoulders', 'deltoid': 'shoulders', 'deltoids': 'shoulders',
  'anterior deltoid': 'shoulders', 'posterior deltoid': 'shoulders', 'lateral deltoid': 'shoulders',
  'anterior deltoids': 'shoulders', 'posterior deltoids': 'shoulders', 'lateral deltoids': 'shoulders',
  'rotator cuff': 'shoulders', 'supraspinatus': 'shoulders', 'infraspinatus': 'shoulders',
  // trapezius
  'trapezius': 'trapezius', 'traps': 'trapezius', 'upper traps': 'trapezius',
  'trapezius upper': 'trapezius', 'trapezius middle': 'trapezius', 'trapezius lower': 'trapezius',
  'neck': 'trapezius', 'neck stabilizers': 'trapezius',
  // arms
  'arms': 'arms', 'biceps': 'arms', 'biceps brachii': 'arms',
  'triceps': 'arms', 'triceps brachii': 'arms', 'brachialis': 'arms',
  'forearms': 'arms', 'forearm': 'arms', 'brachioradialis': 'arms',
  'forearm flexors': 'arms', 'anconeus': 'arms',
  // core
  'core': 'core', 'abs': 'core', 'abdominals': 'core', 'rectus abdominis': 'core',
  'obliques': 'core', 'obliquus externus': 'core', 'obliquus internus': 'core',
  'transverse abdominis': 'core',
  // glutes / hips
  'glutes': 'glutes', 'gluteus maximus': 'glutes', 'gluteus medius': 'glutes', 'gluteus minimus': 'glutes',
  'abductors': 'glutes', 'adductors': 'glutes', 'iliopsoas': 'glutes',
  // quads / hams / calves
  'quads': 'quads', 'quadriceps': 'quads', 'quadriceps femoris': 'quads',
  'rectus femoris': 'quads', 'vastus lateralis': 'quads', 'vastus medialis': 'quads', 'vastus intermedius': 'quads',
  'hamstrings': 'hamstrings', 'biceps femoris': 'hamstrings',
  'semitendinosus': 'hamstrings', 'semimembranosus': 'hamstrings',
  'calves': 'calves', 'gastrocnemius': 'calves', 'soleus': 'calves',
  'legs': 'legs',
};

// Lat-Label-Map für `normal`-Modus ohne Taxonomy: snake_case → Title-Case
// mit korrekter anatomischer Schreibweise (z.B. "201_latissimus_dorsi" → "Latissimus Dorsi").
// Wird via prettify abgedeckt — diese Map definiert Sonderfälle, wenn
// prettify schiefginge.
const ANATOMICAL_LABEL = {
  'biceps_femoris': 'Biceps Femoris',
  'quadriceps_femoris': 'Quadriceps Femoris',
  'erector_spinae': 'Erector Spinae',
  'rectus_abdominis': 'Rectus Abdominis',
  'obliquus_externus': 'Obliquus Externus',
  'gluteus_maximus': 'Gluteus Maximus',
  'gluteus_medius': 'Gluteus Medius',
  'rotator_cuff': 'Rotator Cuff',
  'rectus_femoris': 'Rectus Femoris',
  'vastus_lateralis': 'Vastus Lateralis',
  'vastus_medialis': 'Vastus Medialis',
  'vastus_intermedius': 'Vastus Intermedius',
  'transverse_abdominis': 'Transverse Abdominis',
  'serratus_anterior': 'Serratus Anterior',
  'teres_major': 'Teres Major',
  'teres_minor': 'Teres Minor',
  'quadratus_lumborum': 'Quadratus Lumborum',
};

// Liefert die Lookup-Key-Form: Underscores → Spaces, Klein, ohne Präfix,
// Wort-Reihenfolge-Varianten zusammenführen.
function muscleKey(raw) {
  let s = String(raw || '').toLowerCase().trim();
  s = s.replace(/^\d+[_\s-]*/, '');     // Nummer-Präfix weg
  s = s.replace(/[_-]+/g, ' ');         // Trennzeichen → Space
  s = s.replace(/\s+/g, ' ').trim();
  // Wort-Umkehrungen: "deltoid posterior" → "posterior deltoid"
  const SWAPS = [
    [/^deltoid (anterior|posterior|lateral)s?$/, '$1 deltoid'],
    [/^trapezius (upper|middle|lower)$/, '$1 traps'],
  ];
  for (const [re, repl] of SWAPS) s = s.replace(re, repl);
  return s;
}

function nameToGroup(raw) {
  return NAME_TO_GROUP[muscleKey(raw)] || null;
}

// Konvertiert beliebige Roh-Form (snake_case bare, Title-Case mit Space, plain)
// in eine kanonische ID mit Nummer-Präfix (z.B. "601_gluteus_maximus").
// Gibt den Roh-Wert zurück wenn kein Alias bekannt — bricht also nichts.
export function canonicalMuscleId(raw) {
  if (!raw) return '';
  const s = String(raw);
  // Schon kanonisch?
  if (/^\d+_[a-z_]+$/.test(s)) return s;
  return STRING_ALIASES[muscleKey(s)] || s;
}

function prettify(raw) {
  const stripped = String(raw || '').replace(/^\d+_/, '');
  if (ANATOMICAL_LABEL[stripped.toLowerCase()]) return ANATOMICAL_LABEL[stripped.toLowerCase()];
  return stripped
    .split(/[_\s]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// Komma-gejointe Strings (KB-Bug in einigen YAMLs: "603_rectus_femoris, 604_vastus_…")
// werden hier am Konsum-Punkt aufgesplittet. Akzeptiert auch Slash + Semikolon.
export function splitMuscleEntries(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const raw of list) {
    if (!raw) continue;
    String(raw).split(/[,;/]+/).map(s => s.trim()).filter(Boolean).forEach(s => out.push(s));
  }
  return out;
}

// Detail-Stufen:
//   region  → Gruppe ("Rücken", "Beinbeuger")
//   normal  → lesbarer Name ohne Präfix ("Latissimus Dorsi", "Biceps Femoris")
//   catalog → kanonische ID ("201_latissimus_dorsi")
//
// Egal welche Roh-Form (snake_case, Title-Case, mit/ohne Nummer-Präfix),
// es wird zuerst über STRING_ALIASES kanonisiert. Damit ist die Darstellung
// einheitlich, auch wenn die KB selbst inkonsistent ist.
export function formatMuscleDetail(muscleId, taxonomy = null, lang = 'de', detail = 'normal') {
  if (!muscleId) return '';

  const canonical = canonicalMuscleId(muscleId);

  if (detail === 'catalog') return canonical;

  if (detail === 'region') {
    // Group-ID direkt? (z.B. "200_back" oder "back")
    if (GROUP_TRANSLATIONS.de[canonical]) return translateMuscleGroup(canonical, lang);
    const numGroup = numericSlugToGroup(canonical);
    if (numGroup) return translateMuscleGroup(numGroup, lang);
    const nameGroup = nameToGroup(canonical);
    if (nameGroup) return translateMuscleGroup(nameGroup, lang);
    if (taxonomy && taxonomy[canonical]?.region) return translateMuscleGroup(taxonomy[canonical].region, lang);
    return prettify(canonical);
  }

  // normal
  if (taxonomy && taxonomy[canonical]) {
    const m = taxonomy[canonical];
    if (lang === 'de' && m.label_de) return m.label_de;
    if (lang === 'en' && m.label_en) return m.label_en;
    if (lang === 'lat' && m.label_lat) return m.label_lat;
    return m.display_name || prettify(canonical);
  }
  if (GROUP_TRANSLATIONS.de[canonical]) return translateMuscleGroup(canonical, lang);
  return prettify(canonical);
}

export const MUSCLE_DETAIL_KEY = 'fitness-muscleDetail';
export const MUSCLE_DETAIL_DEFAULT = 'normal';
export const MUSCLE_DETAIL_OPTIONS = [
  { key: 'region',  label: 'Region',  hint: 'Rücken · Beinbeuger' },
  { key: 'normal',  label: 'Normal',  hint: 'Biceps Femoris' },
  { key: 'catalog', label: 'Katalog', hint: '201_latissimus_dorsi' },
];

export function loadMuscleDetail() {
  try {
    const v = localStorage.getItem(MUSCLE_DETAIL_KEY);
    return MUSCLE_DETAIL_OPTIONS.some(o => o.key === v) ? v : MUSCLE_DETAIL_DEFAULT;
  } catch { return MUSCLE_DETAIL_DEFAULT; }
}

export function saveMuscleDetail(value) {
  localStorage.setItem(MUSCLE_DETAIL_KEY, value);
}

export function translateMuscle(muscleId, taxonomy = null, lang = 'de') {
  if (!muscleId) return '';

  // 1. Taxonomy lookup (granular label)
  if (taxonomy && taxonomy[muscleId]) {
    const m = taxonomy[muscleId];
    if (lang === 'de' && m.label_de) return m.label_de;
    if (lang === 'en' && m.label_en) return m.label_en;
    if (lang === 'lat' && m.label_lat) return m.label_lat;
    return m.display_name || muscleId;
  }

  // 2. Direct group ID (chest, back, …)
  if (GROUP_TRANSLATIONS.de[muscleId]) {
    return translateMuscleGroup(muscleId, lang);
  }

  // 3. Numeric slug (201_latissimus_dorsi → back → "Rücken")
  const group = numericSlugToGroup(muscleId);
  if (group) return translateMuscleGroup(group, lang);

  // 4. Last resort: prettify the slug
  return muscleId
    .replace(/^\d+_/, '')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
