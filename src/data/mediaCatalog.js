import { loadMediaOverrides } from '../services/storage.js';

/**
 * Curated medical-school pathology & histology atlas image catalog
 * (UAB PEIR IPLab Lab 3, University of Utah WebPath, and Wikimedia Commons).
 * All assets are bundled locally under public/images/ for instant zero-lag rendering.
 */
export const MEDIA_CATALOG = {
  // ===== ORIENTATION VISUALS (10 items: 5 normal + 5 abnormal) =====
  'ori-gross-appendix:normal': {
    id: 'ori-gross-appendix:normal',
    title: 'Orientation 1 — Normal appendix (Gross)',
    kind: 'orientation',
    photoUrl: './images/ori_gross_appendix_normal.jpg',
    defaultMode: 'photo',
    caption: 'Normal gross vermiform appendix resting against the cecum: pale pink-tan, slim, soft, smooth serosa.',
    attribution: 'University of Utah WebPath (GI192)',
    license: 'Educational Atlas',
    sourcePage: 'https://webpath.med.utah.edu/GIHTML/GI192.html',
    alternatives: [],
    verified: true,
  },
  'ori-gross-appendix:abnormal': {
    id: 'ori-gross-appendix:abnormal',
    title: 'Orientation 1 — Acutely inflamed appendix (Gross)',
    kind: 'orientation',
    photoUrl: './images/ori_gross_appendix_abnormal.jpg',
    defaultMode: 'photo',
    caption: 'Gross specimen: swollen, congested appendix with dull fibrinous/purulent serosal exudate.',
    attribution: 'University of Utah WebPath (GI102)',
    license: 'Educational Atlas',
    sourcePage: 'https://webpath.med.utah.edu/GIHTML/GI102.html',
    alternatives: [
      {
        label: 'UAB PEIR IPLab Lab 3 (shaggy fibrinous serosa)',
        photoUrl: './images/peir_app_gross.jpg',
        attribution: 'UAB PEIR IPLab Lab 3',
        license: 'CC BY-NC-SA',
        sourcePage: 'https://peir.path.uab.edu/wiki/IPLab:Lab_3:Acute_Appendicitis',
      },
      {
        label: 'WebPath GI055 (hemorrhagic tip)',
        photoUrl: './images/wp_app_abn_gross2.jpg',
        attribution: 'University of Utah WebPath (GI055)',
        license: 'Educational Atlas',
        sourcePage: 'https://webpath.med.utah.edu/GIHTML/GI055.html',
      },
    ],
    verified: true,
  },

  'ori-micro-gi-wall:normal': {
    id: 'ori-micro-gi-wall:normal',
    title: 'Orientation 2 — Normal GI wall, low power (H&E)',
    kind: 'orientation',
    photoUrl: './images/ori_micro_wall_normal.jpg',
    defaultMode: 'photo',
    caption: 'Normal appendix cross-section (H&E, matched scan): intact crypt mucosa, pale submucosa, clean pink muscularis, open lumen.',
    attribution: 'UAB PEIR IPLab Lab 3 (matched normal appendix)',
    license: 'CC BY-NC-SA',
    sourcePage: 'https://peir.path.uab.edu/wiki/IPLab:Lab_3:Acute_Appendicitis',
    alternatives: [],
    verified: true,
  },
  'ori-micro-gi-wall:abnormal': {
    id: 'ori-micro-gi-wall:abnormal',
    title: 'Orientation 2 — Acutely inflamed GI wall, low power (H&E)',
    kind: 'orientation',
    photoUrl: './images/ori_micro_wall_abnormal.jpg',
    defaultMode: 'photo',
    caption: 'Acute appendicitis (H&E, same-magnification scan): eroded mucosa, edematous submucosa, and transmural neutrophil infiltrate.',
    attribution: 'UAB PEIR IPLab Lab 3 (IPLab3AcuteAppendicitis2x)',
    license: 'CC BY-NC-SA',
    sourcePage: 'https://peir.path.uab.edu/wiki/IPLab:Lab_3:Acute_Appendicitis',
    alternatives: [
      {
        label: 'Side-by-side inflamed vs. normal appendix scan',
        photoUrl: './images/peir_app_both_low.jpg',
        attribution: 'UAB PEIR IPLab Lab 3',
        license: 'CC BY-NC-SA',
        sourcePage: 'https://peir.path.uab.edu/wiki/IPLab:Lab_3:Acute_Appendicitis',
      },
      {
        label: 'WebPath GI056 (mucosal ulceration & exudate)',
        photoUrl: './images/wp_app_low.jpg',
        attribution: 'University of Utah WebPath (GI056)',
        license: 'Educational Atlas',
        sourcePage: 'https://webpath.med.utah.edu/GIHTML/GI056.html',
      },
    ],
    verified: true,
  },

  'ori-gross-stomach:normal': {
    id: 'ori-gross-stomach:normal',
    title: 'Orientation 3 — Normal stomach mucosa (Gross)',
    kind: 'orientation',
    photoUrl: './images/ori_gross_stomach_normal.jpg',
    defaultMode: 'photo',
    caption: 'Normal gastric mucosa showing uniform pink-tan velvety rugal folds without breaks.',
    attribution: 'University of Utah WebPath (GI195)',
    license: 'Educational Atlas',
    sourcePage: 'https://webpath.med.utah.edu/GIHTML/GI195.html',
    alternatives: [
      {
        label: 'WebPath GI194 (full opened stomach)',
        photoUrl: './images/wp_stom_norm_gross1.jpg',
        attribution: 'University of Utah WebPath (GI194)',
        license: 'Educational Atlas',
        sourcePage: 'https://webpath.med.utah.edu/GIHTML/GI194.html',
      },
    ],
    verified: true,
  },
  'ori-gross-stomach:abnormal': {
    id: 'ori-gross-stomach:abnormal',
    title: 'Orientation 3 — Chronic peptic ulcer (Gross)',
    kind: 'orientation',
    photoUrl: './images/ori_gross_stomach_abnormal.jpg',
    defaultMode: 'photo',
    caption: 'Benign chronic gastric ulcer: sharp, punched-out crater interrupting radiating mucosal rugal folds.',
    attribution: 'Ed Uthman, MD',
    license: 'Public Domain',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Benign_gastric_ulcer_1.jpg',
    alternatives: [
      {
        label: 'WebPath GI018 (antral ulcer)',
        photoUrl: './images/wp_stom_ulcer_gross.jpg',
        attribution: 'University of Utah WebPath (GI018)',
        license: 'Educational Atlas',
        sourcePage: 'https://webpath.med.utah.edu/GIHTML/GI018.html',
      },
      {
        label: 'UAB PEIR IPLab Lab 3 (dual peptic ulcers)',
        photoUrl: './images/peir_ulcer1_clean.jpg',
        attribution: 'UAB PEIR IPLab Lab 3',
        license: 'CC BY-NC-SA',
        sourcePage: 'https://peir.path.uab.edu/wiki/IPLab:Lab_3:Chronic_Peptic_Ulcer',
      },
    ],
    verified: true,
  },

  'ori-micro-neutrophil:normal': {
    id: 'ori-micro-neutrophil:normal',
    title: 'Orientation 4 — Normal smooth muscle wall, high power (H&E)',
    kind: 'orientation',
    photoUrl: './images/ori_micro_high_normal.jpg',
    defaultMode: 'photo',
    caption: 'Normal smooth muscle wall at high power: clean pink fibers, evenly spaced cigar-shaped nuclei, no neutrophil clusters.',
    attribution: 'Wikimedia Commons (Smooth muscle histology, cropped)',
    license: 'CC BY-SA 3.0',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Smooth_muscle_-_histology.jpg',
    alternatives: [],
    verified: true,
  },
  'ori-micro-neutrophil:abnormal': {
    id: 'ori-micro-neutrophil:abnormal',
    title: 'Orientation 4 — Acute inflammation in muscle wall, high power (H&E)',
    kind: 'orientation',
    photoUrl: './images/ori_micro_high_abnormal.jpg',
    defaultMode: 'photo',
    caption: 'High-power H&E of appendix muscularis propria: dense clusters of neutrophils with multi-lobed nuclei between muscle fibers.',
    attribution: 'University of Utah WebPath (GI058)',
    license: 'Educational Atlas',
    sourcePage: 'https://webpath.med.utah.edu/GIHTML/GI058.html',
    alternatives: [
      {
        label: 'Nephron very high mag (PMNs & vessel)',
        photoUrl: './images/wm_app_pmn_crop.jpg',
        attribution: 'Nephron',
        license: 'CC BY-SA 3.0',
        sourcePage: 'https://commons.wikimedia.org/wiki/File:Appendicitis_-_very_high_mag.jpg',
      },
      {
        label: 'WebPath INFL008 (neutrophils in fibrin exudate)',
        photoUrl: './images/wp_infl008.jpg',
        attribution: 'University of Utah WebPath (INFL008)',
        license: 'Educational Atlas',
        sourcePage: 'https://webpath.med.utah.edu/INFLHTML/INFL008.html',
      },
    ],
    verified: true,
  },

  'ori-micro-chronic:normal': {
    id: 'ori-micro-chronic:normal',
    title: 'Orientation 5 — Acute inflammation (Neutrophils, high power H&E)',
    kind: 'orientation',
    photoUrl: './images/ori_micro_acute_cells.jpg',
    defaultMode: 'photo',
    caption: 'Acute inflammation at high power: neutrophils with multi-lobed segmented nuclei amidst strands of fibrin.',
    attribution: 'University of Utah WebPath (INFL008)',
    license: 'Educational Atlas',
    sourcePage: 'https://webpath.med.utah.edu/INFLHTML/INFL008.html',
    alternatives: [
      {
        label: 'WebPath INFL005 (margination & exudate)',
        photoUrl: './images/wp_infl005.jpg',
        attribution: 'University of Utah WebPath (INFL005)',
        license: 'Educational Atlas',
        sourcePage: 'https://webpath.med.utah.edu/INFLHTML/INFL005.html',
      },
      {
        label: 'Nephron very high mag PMNs',
        photoUrl: './images/wm_app_pmn_crop.jpg',
        attribution: 'Nephron',
        license: 'CC BY-SA 3.0',
        sourcePage: 'https://commons.wikimedia.org/wiki/File:Appendicitis_-_very_high_mag.jpg',
      },
    ],
    verified: true,
  },
  'ori-micro-chronic:abnormal': {
    id: 'ori-micro-chronic:abnormal',
    title: 'Orientation 5 — Chronic inflammation (Lymphocytes & plasma cells, high power H&E)',
    kind: 'orientation',
    photoUrl: './images/ori_micro_chronic_cells.jpg',
    defaultMode: 'photo',
    caption: 'Chronic inflammation at matched high power: round lymphocytes and plasma cells with eccentric clock-face nuclei & perinuclear halo.',
    attribution: 'Mikael Häggström, MD',
    license: 'CC0 (Public Domain)',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Histopathology_of_mucosal_plasma_cell_infiltrate_in_chronic_gastritis.jpg',
    alternatives: [
      {
        label: 'WebPath INFL034 (chronic endometritis plasma cells)',
        photoUrl: './images/wp_chronic_endomet.jpg',
        attribution: 'University of Utah WebPath (INFL034)',
        license: 'Educational Atlas',
        sourcePage: 'https://webpath.med.utah.edu/INFLHTML/INFL034.html',
      },
      {
        label: 'Nephron chronic gastritis very high mag',
        photoUrl: './images/wm_chronic_gastritis_vhigh.jpg',
        attribution: 'Nephron',
        license: 'CC BY-SA 3.0',
        sourcePage: 'https://commons.wikimedia.org/wiki/File:Chronic_gastritis_--_very_high_mag.jpg',
      },
    ],
    verified: true,
  },

  // ===== CASE SLIDES (3 items) =====
  case1: {
    id: 'case1',
    title: 'Case 1 — Slide #514 (Acute Appendicitis, whole mount H&E)',
    kind: 'case',
    photoUrl: './images/case1_appendicitis.jpg',
    defaultMode: 'photo',
    caption: 'Whole-mount H&E cross-section of acute suppurative appendicitis (un-annotated).',
    attribution: 'UAB PEIR IPLab Lab 3 (IPLab3AcuteAppendicitis2x)',
    license: 'CC BY-NC-SA',
    sourcePage: 'https://peir.path.uab.edu/wiki/IPLab:Lab_3:Acute_Appendicitis',
    alternatives: [
      {
        label: 'PEIR IPLab3AcuteAppendicitis3 (cleaner wall)',
        photoUrl: './images/peir_app3_clean.jpg',
        attribution: 'UAB PEIR IPLab Lab 3',
        license: 'CC BY-NC-SA',
        sourcePage: 'https://peir.path.uab.edu/wiki/IPLab:Lab_3:Acute_Appendicitis',
      },
      {
        label: 'WebPath GI056 (low power ulceration)',
        photoUrl: './images/wp_app_low.jpg',
        attribution: 'University of Utah WebPath (GI056)',
        license: 'Educational Atlas',
        sourcePage: 'https://webpath.med.utah.edu/GIHTML/GI056.html',
      },
    ],
    verified: true,
  },
  case2: {
    id: 'case2',
    title: 'Case 2 — Slide #1C27 (Peptic Ulcer, low power H&E)',
    kind: 'case',
    photoUrl: './images/case2_peptic_ulcer.jpg',
    defaultMode: 'photo',
    caption: 'Low-power H&E section of gastric ulcer margin, necroinflammatory bed, breached muscularis, and deep fibrotic base.',
    attribution: 'University of Utah WebPath (GI020)',
    license: 'Educational Atlas',
    sourcePage: 'https://webpath.med.utah.edu/GIHTML/GI020.html',
    alternatives: [
      {
        label: 'WebPath GI022 (ulcer eroding into artery)',
        photoUrl: './images/wp_ulcer_artery_low.jpg',
        attribution: 'University of Utah WebPath (GI022)',
        license: 'Educational Atlas',
        sourcePage: 'https://webpath.med.utah.edu/GIHTML/GI022.html',
      },
      {
        label: 'UAB PEIR IPLab Lab 3 (labeled ulcer cross-section)',
        photoUrl: './images/peir_ulcer_low1.jpg',
        attribution: 'UAB PEIR IPLab Lab 3',
        license: 'CC BY-NC-SA',
        sourcePage: 'https://peir.path.uab.edu/wiki/IPLab:Lab_3:Chronic_Peptic_Ulcer',
      },
    ],
    verified: true,
  },
  case3: {
    id: 'case3',
    title: 'Case 3 — Slide #882 (Caseating Granuloma, H&E)',
    kind: 'case',
    photoUrl: './images/case3_tb_granuloma.jpg',
    defaultMode: 'photo',
    caption: 'H&E micrograph of a caseating granuloma: central amorphous pink necrosis, epithelioid histiocyte rim, giant cells, and lymphocyte cuff.',
    attribution: 'University of Utah WebPath (INFL029 / INFL060)',
    license: 'Educational Atlas',
    sourcePage: 'https://webpath.med.utah.edu/INFLHTML/INFL060.html',
    alternatives: [
      {
        label: 'WebPath LUNG035 (granuloma medium power)',
        photoUrl: './images/wp_tb_gran_med.jpg',
        attribution: 'University of Utah WebPath (INFL048)',
        license: 'Educational Atlas',
        sourcePage: 'https://webpath.med.utah.edu/INFLHTML/INFL048.html',
      },
      {
        label: 'Calicut Medical College (TB lymph node 40X)',
        photoUrl: './images/wm_tb_40x.jpg',
        attribution: 'Dept. of Pathology, Calicut Medical College',
        license: 'CC BY-SA 4.0',
        sourcePage: 'https://commons.wikimedia.org/wiki/File:Tuberculous_lymph_node_with_caseating_granuloma_40X.jpg',
      },
      {
        label: 'WebPath INFL015 (Langhans giant cells high power)',
        photoUrl: './images/wp_tb_langhans.jpg',
        attribution: 'University of Utah WebPath (INFL050)',
        license: 'Educational Atlas',
        sourcePage: 'https://webpath.med.utah.edu/INFLHTML/INFL050.html',
      },
    ],
    verified: true,
  },
};

let preloaded = false;
export function preloadCatalogImages() {
  if (preloaded || typeof Image === 'undefined') return;
  preloaded = true;
  Object.values(MEDIA_CATALOG).forEach((entry) => {
    if (entry.photoUrl) {
      const img = new Image();
      img.src = entry.photoUrl;
    }
  });
}

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
