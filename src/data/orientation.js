export const ORIENTATION = [
  {
    id: 'ori-gross-appendix',
    resolution: 'Gross',
    organ: 'Appendix',
    why: 'Before we ever talk about a patient, you need to know what this organ looks like when nothing is wrong — and where it even sits.',
    normal: {
      label: 'Normal appendix',
      points: [
        { ok: true, text: 'Pale, uniform pink-tan color throughout' },
        { ok: true, text: 'Slim, finger-like, soft to the touch' },
        { ok: true, text: 'Smooth, glistening outer surface' },
      ],
      features: [
        { id: 'norm-app-body', label: 'Slim appendix body', x: 52, y: 48, finding: 'Uniform slim caliber (~0.5 cm) with pale pink-tan color and no wall thickening.' },
        { id: 'norm-app-serosa', label: 'Glistening serosa', x: 72, y: 46, finding: 'Smooth, shiny outer serosal surface with zero fibrinous exudate or vascular engorgement.' },
        { id: 'norm-app-cecum', label: 'Adjacent cecum / mesentery', x: 32, y: 74, finding: 'Healthy pale cecal wall and uninflamed yellow mesoappendiceal fat.' },
      ],
    },
    abnormal: {
      label: 'Acutely inflamed appendix',
      points: [
        { ok: false, text: 'Swollen and distended — visibly thicker' },
        { ok: false, text: 'Surface congested, dusky red to purple-black' },
        { ok: false, text: 'Fibrinous or creamy exudate coating the surface' },
      ],
      features: [
        { id: 'abn-app-distended', label: 'Distended tip', x: 84, y: 38, finding: 'Swollen, tense, dilated distal tip from luminal obstruction and mural edema.' },
        { id: 'abn-app-serosa', label: 'Congested serosa & exudate', x: 52, y: 58, finding: 'Dusky hyperemic serosa coated by dull tan fibrinous/purulent exudate (periappendicitis).' },
      ],
    },
  },
  {
    id: 'ori-micro-gi-wall',
    resolution: 'Microscopic',
    organ: 'GI tract wall (generic — applies to appendix, stomach, intestine)',
    why: 'Every hollow GI organ shares the same basic wall architecture. Learn this once, and you can read the appendix, stomach, or colon the same way.',
    normal: {
      label: 'Normal wall, low power',
      points: [
        { ok: true, text: 'Mucosa: intact epithelium, organized glands, no gaps' },
        { ok: true, text: 'Submucosa: pale, loose, vessels visible but unremarkable' },
        { ok: true, text: 'Muscularis: thick pink bands of smooth muscle, no cells between fibers' },
        { ok: true, text: 'Lumen: open, empty or containing only normal contents' },
      ],
      features: [
        { id: 'norm-wall-lumen', label: 'Clear lumen', x: 52, y: 34, finding: 'Open, clean lumen with no purulent exudate.' },
        { id: 'norm-wall-mucosa', label: 'Intact mucosa & lymphoid tissue', x: 43, y: 44, finding: 'Organized crypt epithelium with normal baseline lymphoid follicles.' },
        { id: 'norm-wall-musc', label: 'Clean muscularis propria', x: 76, y: 52, finding: 'Uniform pink smooth muscle wall free of infiltrating neutrophils.' },
      ],
    },
    abnormal: {
      label: 'Acutely inflamed wall, low power',
      points: [
        { ok: false, text: 'Mucosa: eroded or ulcerated, epithelium disrupted' },
        { ok: false, text: 'Submucosa: edematous, pulled apart, congested vessels' },
        { ok: false, text: 'Muscularis: small dark dots (neutrophil nuclei) infiltrating between the pink muscle fibers' },
        { ok: false, text: 'Lumen: filled with purulent debris instead of empty' },
      ],
      features: [
        { id: 'abn-wall-lumen', label: 'Ulcerated lumen', x: 50, y: 46, finding: 'Lumen surrounded by necrotic debris and purulent exudate.' },
        { id: 'abn-wall-mucosa', label: 'Lost mucosa', x: 35, y: 52, finding: 'Dark purple cellular infiltrate replacing normal crypt architecture.' },
        { id: 'abn-wall-musc', label: 'Transmural wall infiltrate', x: 75, y: 58, finding: 'Neutrophils dissecting all the way through the pink muscularis propria to the serosa.' },
      ],
    },
  },
  {
    id: 'ori-gross-stomach',
    resolution: 'Gross',
    organ: 'Stomach',
    why: "Same idea, second organ. You're not learning a new system — you're confirming the normal-vs-abnormal habit transfers.",
    normal: {
      label: 'Normal stomach mucosa',
      points: [
        { ok: true, text: 'Folded, velvety rugae — an even, regular pattern' },
        { ok: true, text: 'Uniform pink-tan lining, no breaks' },
        { ok: true, text: 'Wall is thin and pliable when cut' },
      ],
      features: [
        { id: 'norm-stom-rugae', label: 'Intact rugal folds', x: 26, y: 45, finding: 'Regular, velvety, glistening mucosal folds (rugae) with uniform pink-tan color.' },
        { id: 'norm-stom-antrum', label: 'Smooth antral mucosa', x: 64, y: 55, finding: 'Uninterrupted mucosal surface transitioning smoothly toward the pylorus with no craters.' },
      ],
    },
    abnormal: {
      label: 'Stomach with a chronic peptic ulcer',
      points: [
        { ok: false, text: 'A sharp, punched-out crater interrupts the rugal folds' },
        { ok: false, text: 'Flat, clean margins around the defect — not a ragged tear' },
        { ok: false, text: 'Surrounding wall feels firm — fibrosis, not normal soft tissue' },
      ],
      features: [
        { id: 'abn-stom-crater', label: 'Punched-out ulcer crater', x: 48, y: 54, finding: 'Sharp, round, punched-out mucosal defect with a clean base — classic benign peptic ulcer.' },
        { id: 'abn-stom-folds', label: 'Radiating rugal folds', x: 65, y: 36, finding: 'Rugal folds radiate smoothly up to the flat ulcer margin (unlike heaped-up irregular borders in carcinoma).' },
      ],
    },
  },
  {
    id: 'ori-micro-neutrophil',
    resolution: 'Microscopic',
    organ: 'Cell-level — the neutrophil itself',
    why: "Before you can spot acute inflammation, you need to recognize the single cell type that defines it on sight, the way you'd recognize a friend's face in a crowd.",
    normal: {
      label: 'Normal tissue, high power',
      points: [
        { ok: true, text: 'Few scattered nuclei, evenly spaced' },
        { ok: true, text: 'Clean pink background, no debris' },
        { ok: true, text: 'No clustering of small dark cells' },
      ],
      features: [
        { id: 'norm-hp-fibers', label: 'Clean eosinophilic muscle fibers', x: 45, y: 55, finding: 'Smooth, uninterrupted pink cytoplasm with zero interstitial edema or fibrin.' },
        { id: 'norm-hp-nuclei', label: 'Cigar-shaped smooth muscle nuclei', x: 60, y: 35, finding: 'Elongated, evenly spaced, bland spindle nuclei — no multilobed inflammatory cells.' },
      ],
    },
    abnormal: {
      label: 'Acute inflammation, high power',
      points: [
        { ok: false, text: 'Dense clusters of small cells with multi-lobed, segmented nuclei — neutrophils' },
        { ok: false, text: 'Background looks dirty — debris, fibrin, fluid' },
        { ok: false, text: 'Cells are infiltrating between normal structures, not just sitting in vessels' },
      ],
      features: [
        { id: 'abn-hp-pmns', label: 'Segmented neutrophils', x: 52, y: 48, finding: 'Small leukocytes with 3–5 dark nuclear lobes connected by thin strands, dissecting between muscle fibers.' },
        { id: 'abn-hp-muscle', label: 'Separated smooth muscle', x: 84, y: 45, finding: 'Residual pink smooth muscle bundles pushed apart by edema and acute inflammatory cells.' },
      ],
    },
  },
  {
    id: 'ori-micro-chronic',
    resolution: 'Microscopic',
    organ: 'Cell-level — acute vs. chronic inflammation, side by side',
    why: "You just learned to recognize the neutrophil. Now learn its chronic counterpart — lymphocytes and plasma cells — so you can tell at a glance which timeline you're looking at before you ever read the vignette.",
    toggleLabels: ['Acute', 'Chronic'],
    normal: {
      label: 'Acute inflammation, high power (neutrophils)',
      points: [
        { ok: true, text: 'Small cells with multi-lobed, segmented nuclei, packed densely' },
        { ok: true, text: 'Appears within hours; gone within ~24h of resolution' },
        { ok: true, text: 'Driven by innate immunity — no antigen specificity' },
      ],
      features: [
        { id: 'acute-pmn-lobes', label: 'Multilobed neutrophil', x: 48, y: 52, finding: 'Classic horseshoe/segmented multi-lobed nucleus (~12 µm) diagnostic of acute inflammation.' },
        { id: 'acute-fibrin', label: 'Fibrin meshwork', x: 74, y: 36, finding: 'Pink wispy fibrin threads deposited from leaked plasma fibrinogen in acute exudate.' },
      ],
    },
    abnormal: {
      label: 'Chronic inflammation, high power (lymphocytes + plasma cells)',
      points: [
        { ok: false, text: 'Round nuclei (lymphocytes) plus cells with eccentric nuclei and abundant cytoplasm (plasma cells)' },
        { ok: false, text: 'Takes weeks to develop — a delayed, adaptive immune response' },
        { ok: false, text: 'Often clustered around macrophages, sometimes forming granulomas' },
      ],
      features: [
        { id: 'chronic-plasma', label: 'Plasma cell (clock-face nucleus)', x: 54, y: 74, finding: 'Abundant purple-pink cytoplasm, eccentric round nucleus with cartwheel chromatin, and pale perinuclear Golgi halo.' },
        { id: 'chronic-lymph', label: 'Small lymphocyte', x: 35, y: 42, finding: 'Dense dark round nucleus filling nearly the whole cell with minimal visible cytoplasm.' },
      ],
    },
  },
];
