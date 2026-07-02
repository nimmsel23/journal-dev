// Muscle ID → visualization slug (react-body-highlighter)
export const RBH_SLUGS = {
  chest: 'chest', pecs: 'chest', pectoralis: 'chest', 'pectoralis major': 'chest', 'pectoralis minor': 'chest', serratus: 'serratus-anterior',
  '100_chest': 'chest', '101_pectoralis_major': 'chest', '102_pectoralis_major_clavicular': 'chest', '103_pectoralis_minor': 'chest', '104_serratus_anterior': 'serratus-anterior',
  back: 'upper-back', lats: 'latissimus', latissimus: 'latissimus',
  traps: 'traps', trapezius: 'traps', 'upper-back': 'upper-back', rhomboids: 'rhomboids',
  'lower-back': 'lower-back', 'erector spinae': 'lower-back', lumbar: 'lower-back',
  '200_back': 'upper-back', '201_latissimus_dorsi': 'latissimus', '202_trapezius_upper': 'traps', '203_trapezius_middle': 'traps', '204_trapezius_lower': 'traps', '205_rhomboids': 'rhomboids', '206_erector_spinae': 'lower-back', '207_teres_major': 'latissimus', '208_quadratus_lumborum': 'lower-back',
  shoulders: 'front-deltoids', delts: 'front-deltoids', deltoid: 'front-deltoids', 'front-deltoids': 'front-deltoids', 'rear-deltoids': 'back-deltoids',
  '300_shoulders': 'front-deltoids', '301_anterior_deltoid': 'front-deltoids', '302_lateral_deltoid': 'front-deltoids', '303_posterior_deltoid': 'back-deltoids', '304_rotator_cuff': 'front-deltoids',
  '305_supraspinatus': 'front-deltoids', '306_infraspinatus': 'back-deltoids', '307_teres_minor': 'back-deltoids', '308_subscapularis': 'front-deltoids',
  biceps: 'biceps', triceps: 'triceps', forearms: 'forearm', forearm: 'forearm', brachialis: 'biceps',
  '400_arms': 'biceps', '401_biceps_brachii': 'biceps', '402_brachialis': 'biceps', '403_triceps_brachii': 'triceps', '404_brachioradialis': 'forearm',
  '405_forearm_flexors': 'forearm', '406_anconeus': 'triceps', '407_forearm_extensors': 'forearm',
  abs: 'abs', core: 'abs', obliques: 'obliques', obliquus: 'obliques', 'rectus abdominis': 'abs',
  '500_core': 'abs', '501_rectus_abdominis': 'abs', '502_obliques': 'obliques', '502_obliquus_externus': 'obliques', '503_obliquus_internus': 'obliques', '504_transverse_abdominis': 'abs',
  glutes: 'gluteal', gluteus: 'gluteal', 'gluteus maximus': 'gluteal',
  quads: 'quadriceps', quadriceps: 'quadriceps', 'vastus lateralis': 'quadriceps',
  hamstrings: 'hamstring', hamstring: 'hamstring', 'biceps femoris': 'hamstring',
  calves: 'calves', gastrocnemius: 'calves', soleus: 'calves',
  '600_legs': 'quadriceps', '601_gluteus_maximus': 'gluteal', '602_gluteus_medius': 'gluteal', '603_quadriceps': 'quadriceps', '604_hamstrings': 'hamstring', '700_calves': 'calves',
  '603_rectus_femoris': 'quadriceps', '604_vastus_lateralis': 'quadriceps', '605_vastus_medialis': 'quadriceps', '606_vastus_intermedius': 'quadriceps',
  '607_biceps_femoris': 'hamstring', '608_semitendinosus': 'hamstring', '609_semimembranosus': 'hamstring',
  '610_adductors': 'adductors', '611_iliopsoas': 'hip-flexors', '612_gluteus_minimus': 'gluteal',
  '701_gastrocnemius': 'calves', '702_soleus': 'calves', '703_tibialis_anterior': 'calves',
  // Descriptive names from older sessions
  pectoralis_major: 'chest', pectoralis_major_clavicular_head: 'chest', serratus_anterior: 'chest',
  latissimus_dorsi: 'latissimus', teres_major: 'latissimus', erector_spinae: 'lower-back',
  anterior_deltoid: 'front-deltoids', lateral_deltoid: 'front-deltoids', posterior_deltoid: 'back-deltoids',
  biceps_brachii: 'biceps', brachioradialis: 'forearm', triceps_brachii: 'triceps',
  rectus_abdominis: 'abs', obliquus_externus: 'obliques', transverse_abdominis: 'abs',
  gluteus_maximus: 'gluteal', gluteus_medius: 'gluteal',
  rectus_femoris: 'quadriceps', vastus_lateralis: 'quadriceps', vastus_medialis: 'quadriceps',
  biceps_femoris: 'hamstring', semitendinosus: 'hamstring',
};

// RBH slug → coverage group
const SLUG_TO_GROUP = {
  chest: 'chest', 'serratus-anterior': 'chest',
  latissimus: 'back', 'upper-back': 'back', rhomboids: 'back', traps: 'back', 'lower-back': 'back',
  'front-deltoids': 'shoulders', 'back-deltoids': 'shoulders',
  biceps: 'arms', triceps: 'arms', forearm: 'arms',
  abs: 'core', obliques: 'core',
  gluteal: 'glutes',
  quadriceps: 'quads',
  hamstring: 'hamstrings',
  calves: 'calves',
  adductors: 'legs', 'hip-flexors': 'legs',
};

// Muscle ID → coverage group (single lookup)
export function muscleIdToGroup(muscleId) {
  const id = String(muscleId || '').toLowerCase().trim().replace(/ /g, '_');
  const slug = RBH_SLUGS[id] || RBH_SLUGS[id.replace(/_/g, ' ')];
  return slug ? (SLUG_TO_GROUP[slug] || null) : null;
}

// Muscle ID → all matching coverage groups (falls back to substring matching)
export function muscleToGroups(muscleId, exerciseName = '') {
  const direct = muscleIdToGroup(muscleId);
  if (direct) return [direct];

  // Substring fallback for unknown IDs
  const m = String(muscleId || '').toLowerCase();
  const name = String(exerciseName || '').toLowerCase();
  const matches = new Set();
  for (const [id, slug] of Object.entries(RBH_SLUGS)) {
    if (id.length > 3 && (m.includes(id) || name.includes(id))) {
      const g = SLUG_TO_GROUP[slug];
      if (g) matches.add(g);
    }
  }
  return [...matches];
}

// Group → array of RBH slugs (for react-body-highlighter, group-level highlighting)
export const GROUP_TO_RBH = {
  chest:      ['chest'],
  back:       ['upper-back', 'lower-back'],
  trapezius:  ['trapezius'],
  shoulders:  ['front-deltoids', 'back-deltoids'],
  arms:       ['biceps', 'triceps', 'forearm'],
  core:       ['abs', 'obliques'],
  glutes:     ['gluteal'],
  quads:      ['quadriceps'],
  hamstrings: ['hamstring'],
  calves:     ['calves'],
  legs:       ['quadriceps', 'hamstring'],
};

// wger integer muscle ID → RBH slug
export const WGER_TO_RBH = {
  1: 'biceps', 2: 'front-deltoids', 3: 'chest', 4: 'chest', 5: 'triceps',
  6: 'abs', 7: 'calves', 8: 'gluteal', 9: 'upper-back', 10: 'quadriceps',
  11: 'hamstring', 12: 'upper-back', 13: 'forearm', 14: 'obliques', 15: 'calves', 16: 'lower-back',
};

// Supported RBH muscle slugs (react-body-highlighter whitelist)
export const SUPPORTED_RBH_MUSCLES = new Set([
  'trapezius', 'upper-back', 'lower-back', 'chest', 'biceps', 'triceps', 'forearm',
  'back-deltoids', 'front-deltoids', 'abs', 'obliques', 'adductor', 'hamstring',
  'quadriceps', 'abductors', 'calves', 'gluteal', 'head', 'neck', 'knees',
  'left-soleus', 'right-soleus',
]);

// Flat slug map for body-muscles library (BodyMusclesMap)
export const BODY_MUSCLES_SLUGS = {
  chest: 'chest-upper-left', pecs: 'chest-upper-left', pectoralis: 'chest-upper-left',
  '100_chest': 'chest-upper-left', '101_pectoralis_major': 'chest-upper-left',
  lats: 'lats-upper-left', latissimus: 'lats-upper-left', back: 'lats-upper-left',
  '200_back': 'lats-upper-left', '201_latissimus_dorsi': 'lats-upper-left',
  traps: 'traps-upper-left', trapezius: 'traps-upper-left',
  '202_trapezius_upper': 'traps-upper-left', '203_trapezius_middle': 'traps-upper-left', '204_trapezius_lower': 'traps-upper-left',
  shoulders: 'shoulder-front-left', deltoid: 'shoulder-front-left',
  '300_shoulders': 'shoulder-front-left', '301_anterior_deltoid': 'shoulder-front-left',
  biceps: 'biceps-left', triceps: 'triceps-long-left',
  '400_arms': 'biceps-left', '401_biceps_brachii': 'biceps-left', '403_triceps_brachii': 'triceps-long-left',
  forearm: 'forearm-left', forearms: 'forearm-left',
  abs: 'abs-upper-left', core: 'abs-upper-left', obliques: 'obliques-left',
  '500_core': 'abs-upper-left', '501_rectus_abdominis': 'abs-upper-left',
  glutes: 'gluteus-maximus-left', gluteus: 'gluteus-maximus-left',
  '601_gluteus_maximus': 'gluteus-maximus-left', '602_gluteus_medius': 'gluteus-medius-left',
  quads: 'quads-left', quadriceps: 'quads-left',
  '603_quadriceps': 'quads-left',
  hamstrings: 'hamstrings-medial-left', hamstring: 'hamstrings-medial-left',
  '604_hamstrings': 'hamstrings-medial-left',
  calves: 'calves-gastroc-medial-left', gastrocnemius: 'calves-gastroc-medial-left',
  '700_calves': 'calves-gastroc-medial-left',
};

// Mapping for body-muscles library
export const BODY_MUSCLES_MAP = {
  chest:           { view: 'FRONT', ids: ['chest-upper-left','chest-upper-right','chest-lower-left','chest-lower-right'] },
  back:            { view: 'BACK',  ids: ['lats-upper-left','lats-mid-left','lats-lower-left','lats-upper-right','lats-mid-right','lats-lower-right'] },
  lats:            { view: 'BACK',  ids: ['lats-upper-left','lats-mid-left','lats-lower-left','lats-upper-right','lats-mid-right','lats-lower-right'] },
  traps:           { view: 'BACK',  ids: ['traps-upper-left','traps-mid-left','traps-lower-left','traps-upper-right','traps-mid-right','traps-lower-right'] },
  trapezius:       { view: 'BACK',  ids: ['traps-upper-left','traps-mid-left','traps-lower-left','traps-upper-right','traps-mid-right','traps-lower-right'] },
  shoulders:       { view: 'FRONT', ids: ['shoulder-front-left','shoulder-front-right','shoulder-side-left','shoulder-side-right'] },
  'front-deltoids':{ view: 'FRONT', ids: ['shoulder-front-left','shoulder-front-right'] },
  'back-deltoids': { view: 'BACK',  ids: ['deltoid-rear-left','deltoid-rear-right'] },
  biceps:          { view: 'FRONT', ids: ['biceps-left','biceps-right'] },
  triceps:         { view: 'BACK',  ids: ['triceps-long-left','triceps-lateral-left','triceps-long-right','triceps-lateral-right'] },
  forearm:         { view: 'FRONT', ids: ['forearm-left','forearm-right'] },
  abs:             { view: 'FRONT', ids: ['abs-upper-left','abs-upper-right','abs-lower-left','abs-lower-right'] },
  obliques:        { view: 'FRONT', ids: ['obliques-left','obliques-right'] },
  'lower-back':    { view: 'BACK',  ids: ['lower-back-erectors-left','lower-back-erectors-right','lower-back-ql-left','lower-back-ql-right'] },
  gluteal:         { view: 'BACK',  ids: ['gluteus-maximus-left','gluteus-maximus-right','gluteus-medius-left','gluteus-medius-right'] },
  quadriceps:      { view: 'FRONT', ids: ['quads-left','quads-right'] },
  hamstring:       { view: 'BACK',  ids: ['hamstrings-medial-left','hamstrings-lateral-left','hamstrings-medial-right','hamstrings-lateral-right'] },
  calves:          { view: 'BACK',  ids: ['calves-gastroc-medial-left','calves-gastroc-lateral-left','calves-gastroc-medial-right','calves-gastroc-lateral-right','calves-soleus-left','calves-soleus-right'] },
  adductors:       { view: 'FRONT', ids: ['adductors-left','adductors-right'] },
  'hip-flexors':   { view: 'FRONT', ids: ['hip-flexor-left','hip-flexor-right'] },
};
