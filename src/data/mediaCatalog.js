import { loadMediaOverrides } from '../services/storage.js';

/**
 * Verified Wikimedia Commons open-licensed pathology media catalog.
 * Every entry starts as verified: false so the course instructor can inspect,
 * switch candidates, adjust zone pins, or swap in institutional UB slides.
 */
export const MEDIA_CATALOG = {
  // ===== ORIENTATION VISUALS (10 items: 5 normal + 5 abnormal) =====
  'ori-gross-appendix:normal': {
    id: 'ori-gross-appendix:normal',
    title: 'Orientation 1 — Normal appendix (Gross)',
    kind: 'orientation',
    photoUrl: null,
    defaultMode: 'model',
    caption: 'No uninflamed gross appendix specimen verified yet — showing representative model. Paste a UB specimen URL in the Verifier if desired.',
    attribution: 'Representative SVG model (paste or upload your institutional normal appendix photo in Verify Images)',
    license: 'Built-in Model',
    sourcePage: null,
    alternatives: [],
    verified: false,
  },
  'ori-gross-appendix:abnormal': {
    id: 'ori-gross-appendix:abnormal',
    title: 'Orientation 1 — Acutely inflamed appendix (Gross)',
    kind: 'orientation',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Acute_Appendicitis.jpg/1280px-Acute_Appendicitis.jpg',
    defaultMode: 'photo',
    caption: 'Gross specimen: swollen, congested appendix with fibrinous/purulent exudate.',
    attribution: 'Ed Uthman, MD (Houston, TX)',
    license: 'CC BY 2.0',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Acute_Appendicitis.jpg',
    alternatives: [
      {
        label: 'Calicut Medical College gross specimen',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Acute_appendicitis_Gross_pathology.jpg',
        attribution: 'Dept. of Pathology, Calicut Medical College',
        license: 'CC BY-SA 4.0',
        sourcePage: 'https://commons.wikimedia.org/wiki/File:Acute_appendicitis_Gross_pathology.jpg',
      },
    ],
    verified: false,
  },

  'ori-micro-gi-wall:normal': {
    id: 'ori-micro-gi-wall:normal',
    title: 'Orientation 2 — Normal GI wall, low power (H&E)',
    kind: 'orientation',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Histology_of_human_appendix.jpg/1280px-Histology_of_human_appendix.jpg',
    defaultMode: 'photo',
    caption: 'Normal appendix wall cross-section (H&E) showing intact mucosa, submucosa, muscularis, and clear lumen.',
    attribution: 'Jatheesh mohan',
    license: 'CC BY-SA 3.0',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Histology_of_human_appendix.jpg',
    alternatives: [
      {
        label: 'Normal gastric mucosa (Nephron)',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Normal_gastric_mucosa_low_mag.jpg/1280px-Normal_gastric_mucosa_low_mag.jpg',
        attribution: 'Nephron',
        license: 'CC BY-SA 3.0',
        sourcePage: 'https://commons.wikimedia.org/wiki/File:Normal_gastric_mucosa_low_mag.jpg',
      },
    ],
    verified: false,
  },
  'ori-micro-gi-wall:abnormal': {
    id: 'ori-micro-gi-wall:abnormal',
    title: 'Orientation 2 — Acutely inflamed GI wall, low power (H&E)',
    kind: 'orientation',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Acute_appendicitis%2C_low_mag.2.jpg/1280px-Acute_appendicitis%2C_low_mag.2.jpg',
    defaultMode: 'photo',
    caption: 'Acute appendicitis (H&E, low mag): mucosal ulceration and transmural neutrophilic inflammation.',
    attribution: 'CoRus13',
    license: 'CC BY-SA 4.0',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Acute_appendicitis,_low_mag.2.jpg',
    alternatives: [
      {
        label: 'Nephron low-mag appendicitis',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Appendicitis_-_low_mag.jpg/1280px-Appendicitis_-_low_mag.jpg',
        attribution: 'Nephron',
        license: 'CC BY-SA 3.0',
        sourcePage: 'https://commons.wikimedia.org/wiki/File:Appendicitis_-_low_mag.jpg',
      },
    ],
    verified: false,
  },

  'ori-gross-stomach:normal': {
    id: 'ori-gross-stomach:normal',
    title: 'Orientation 3 — Normal stomach mucosa (Gross)',
    kind: 'orientation',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/17/An_open_stomach.jpg',
    defaultMode: 'photo',
    caption: 'Opened stomach gross specimen showing intact mucosal rugal folds.',
    attribution: 'Israel Collado',
    license: 'CC BY-SA 3.0',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:An_open_stomach.jpg',
    alternatives: [],
    verified: false,
  },
  'ori-gross-stomach:abnormal': {
    id: 'ori-gross-stomach:abnormal',
    title: 'Orientation 3 — Chronic peptic ulcer (Gross)',
    kind: 'orientation',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Peptic_ulcer.jpg/1280px-Peptic_ulcer.jpg',
    defaultMode: 'photo',
    caption: 'Gross pathology of a peptic ulcer in the gastric antrum showing a sharp, punched-out crater.',
    attribution: 'Dr. G. Narasimhamurthy',
    license: 'CC0 (Public Domain)',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Peptic_ulcer.jpg',
    alternatives: [
      {
        label: 'Benign gastric ulcer (Ed Uthman)',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Benign_gastric_ulcer_1.jpg',
        attribution: 'Ed Uthman, MD',
        license: 'Public Domain',
        sourcePage: 'https://commons.wikimedia.org/wiki/File:Benign_gastric_ulcer_1.jpg',
      },
    ],
    verified: false,
  },

  'ori-micro-neutrophil:normal': {
    id: 'ori-micro-neutrophil:normal',
    title: 'Orientation 4 — Normal tissue, high power (H&E)',
    kind: 'orientation',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Normal_colorectal_mucosa_-_high_mag.jpg/1280px-Normal_colorectal_mucosa_-_high_mag.jpg',
    defaultMode: 'photo',
    caption: 'Normal colorectal mucosa at high magnification — evenly spaced crypts and quiet lamina propria.',
    attribution: 'Librepath',
    license: 'CC BY-SA 3.0',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Normal_colorectal_mucosa_-_high_mag.jpg',
    alternatives: [],
    verified: false,
  },
  'ori-micro-neutrophil:abnormal': {
    id: 'ori-micro-neutrophil:abnormal',
    title: 'Orientation 4 — Acute inflammation / neutrophils, high power (H&E)',
    kind: 'orientation',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Appendicitis_-_very_high_mag.jpg/1280px-Appendicitis_-_very_high_mag.jpg',
    defaultMode: 'photo',
    caption: 'High-power micrograph showing dense neutrophilic infiltrate with multi-lobed segmented nuclei.',
    attribution: 'Nephron',
    license: 'CC BY-SA 3.0',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Appendicitis_-_very_high_mag.jpg',
    alternatives: [],
    verified: false,
  },

  'ori-micro-chronic:normal': {
    id: 'ori-micro-chronic:normal',
    title: 'Orientation 5 — Acute inflammation (Neutrophils, H&E)',
    kind: 'orientation',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Appendicitis_-_very_high_mag.jpg/1280px-Appendicitis_-_very_high_mag.jpg',
    defaultMode: 'photo',
    caption: 'Acute inflammation: sheets of neutrophils with multilobed nuclei.',
    attribution: 'Nephron',
    license: 'CC BY-SA 3.0',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Appendicitis_-_very_high_mag.jpg',
    alternatives: [],
    verified: false,
  },
  'ori-micro-chronic:abnormal': {
    id: 'ori-micro-chronic:abnormal',
    title: 'Orientation 5 — Chronic inflammation (Lymphocytes & plasma cells, H&E)',
    kind: 'orientation',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Histopathology_of_mucosal_plasma_cell_infiltrate_in_chronic_gastritis.jpg/1280px-Histopathology_of_mucosal_plasma_cell_infiltrate_in_chronic_gastritis.jpg',
    defaultMode: 'photo',
    caption: 'Chronic inflammation: plasma cells (eccentric clock-face nuclei, pale perinuclear hof) and lymphocytes.',
    attribution: 'Mikael Häggström, MD',
    license: 'CC0 (Public Domain)',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Histopathology_of_mucosal_plasma_cell_infiltrate_in_chronic_gastritis.jpg',
    alternatives: [
      {
        label: 'Chronic gastritis very high mag (Nephron)',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Chronic_gastritis_--_very_high_mag.jpg/1280px-Chronic_gastritis_--_very_high_mag.jpg',
        attribution: 'Nephron',
        license: 'CC BY-SA 3.0',
        sourcePage: 'https://commons.wikimedia.org/wiki/File:Chronic_gastritis_--_very_high_mag.jpg',
      },
    ],
    verified: false,
  },

  // ===== CASE SLIDES (3 items) =====
  case1: {
    id: 'case1',
    title: 'Case 1 — Slide #514 (Acute Appendicitis, H&E)',
    kind: 'case',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Appendicitis_-_low_mag.jpg/1280px-Appendicitis_-_low_mag.jpg',
    defaultMode: 'photo',
    caption: 'Low-magnification H&E micrograph of acute appendicitis and periappendicitis.',
    attribution: 'Nephron',
    license: 'CC BY-SA 3.0',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Appendicitis_-_low_mag.jpg',
    alternatives: [
      {
        label: 'CoRus13 low mag appendicitis (ulcerated lumen)',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Acute_appendicitis%2C_low_mag.2.jpg/1280px-Acute_appendicitis%2C_low_mag.2.jpg',
        attribution: 'CoRus13',
        license: 'CC BY-SA 4.0',
        sourcePage: 'https://commons.wikimedia.org/wiki/File:Acute_appendicitis,_low_mag.2.jpg',
      },
    ],
    verified: false,
  },
  case2: {
    id: 'case2',
    title: 'Case 2 — Slide #1C27 (Peptic Ulcer, H&E)',
    kind: 'case',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Stomach_ulcer_--_low_mag.jpg/1280px-Stomach_ulcer_--_low_mag.jpg',
    defaultMode: 'photo',
    caption: 'Low-magnification H&E micrograph of a gastric ulcer showing mucosal edge, ulcer bed, and deep fibrosis.',
    attribution: 'Librepath',
    license: 'CC BY-SA 3.0',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Stomach_ulcer_--_low_mag.jpg',
    alternatives: [
      {
        label: 'Stomach ulcer intermediate mag (Librepath)',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Stomach_ulcer_--_intermed_mag.jpg/1280px-Stomach_ulcer_--_intermed_mag.jpg',
        attribution: 'Librepath',
        license: 'CC BY-SA 3.0',
        sourcePage: 'https://commons.wikimedia.org/wiki/File:Stomach_ulcer_--_intermed_mag.jpg',
      },
    ],
    verified: false,
  },
  case3: {
    id: 'case3',
    title: 'Case 3 — Slide #882 (TB Caseating Granuloma, H&E)',
    kind: 'case',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tuberculous_lymph_node_with_caseating_granuloma_40X.jpg',
    defaultMode: 'photo',
    caption: 'H&E micrograph of tuberculous lymph node showing central caseous necrosis, epithelioid histiocytes, Langhans giant cells, and lymphocyte rim.',
    attribution: 'Dept. of Pathology, Calicut Medical College',
    license: 'CC BY-SA 4.0',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Tuberculous_lymph_node_with_caseating_granuloma_40X.jpg',
    alternatives: [
      {
        label: 'Caseating granuloma (Sameem Arif)',
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Caseating_granuloma_-_Tuberculous_lymph_node.jpg/1280px-Caseating_granuloma_-_Tuberculous_lymph_node.jpg',
        attribution: 'Sameem Arif',
        license: 'CC BY-SA 4.0',
        sourcePage: 'https://commons.wikimedia.org/wiki/File:Caseating_granuloma_-_Tuberculous_lymph_node.jpg',
      },
    ],
    verified: false,
  },
};

/**
 * Resolve a media entry merged with any local or room-synced instructor overrides.
 */
export function resolveMediaEntry(mediaId, roomOverrides = null) {
  const base = MEDIA_CATALOG[mediaId];
  if (!base) return null;
  const localOv = loadMediaOverrides()[mediaId] || {};
  const roomOv = roomOverrides?.[mediaId] || {};
  const merged = { ...base, ...localOv, ...roomOv };
  if (!merged.photoUrl && merged.defaultMode === 'photo') {
    merged.defaultMode = 'model';
  }
  return merged;
}

/**
 * Resolve case zone coordinates merged with any custom pin overrides.
 */
export function resolveCaseZones(caseObj, roomOverrides = null) {
  const localPins = loadMediaOverrides()[`${caseObj.id}:pins`] || {};
  const roomPins = roomOverrides?.[`${caseObj.id}:pins`] || {};
  const pinOv = { ...localPins, ...roomPins };
  return caseObj.image.zones.map((z) => {
    const custom = pinOv[z.id];
    return custom ? { ...z, x: custom.x, y: custom.y } : z;
  });
}
