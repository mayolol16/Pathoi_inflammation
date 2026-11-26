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
    },
    abnormal: {
      label: 'Acutely inflamed appendix',
      points: [
        { ok: false, text: 'Swollen and distended — visibly thicker' },
        { ok: false, text: 'Surface congested, dusky red to purple-black' },
        { ok: false, text: 'Fibrinous or creamy exudate coating the surface' },
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
    },
    abnormal: {
      label: 'Acutely inflamed wall, low power',
      points: [
        { ok: false, text: 'Mucosa: eroded or ulcerated, epithelium disrupted' },
        { ok: false, text: 'Submucosa: edematous, pulled apart, congested vessels' },
        { ok: false, text: 'Muscularis: small dark dots (neutrophil nuclei) infiltrating between the pink muscle fibers' },
        { ok: false, text: 'Lumen: filled with purulent debris instead of empty' },
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
    },
    abnormal: {
      label: 'Stomach with a chronic peptic ulcer',
      points: [
        { ok: false, text: 'A sharp, punched-out crater interrupts the rugal folds' },
        { ok: false, text: 'Flat, clean margins around the defect — not a ragged tear' },
        { ok: false, text: 'Surrounding wall feels firm — fibrosis, not normal soft tissue' },
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
    },
    abnormal: {
      label: 'Acute inflammation, high power',
      points: [
        { ok: false, text: 'Dense clusters of small cells with multi-lobed, segmented nuclei — neutrophils' },
        { ok: false, text: 'Background looks dirty — debris, fibrin, fluid' },
        { ok: false, text: 'Cells are infiltrating between normal structures, not just sitting in vessels' },
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
    },
    abnormal: {
      label: 'Chronic inflammation, high power (lymphocytes + plasma cells)',
      points: [
        { ok: false, text: 'Round nuclei (lymphocytes) plus cells with eccentric nuclei and abundant cytoplasm (plasma cells)' },
        { ok: false, text: 'Takes weeks to develop — a delayed, adaptive immune response' },
        { ok: false, text: 'Often clustered around macrophages, sometimes forming granulomas' },
      ],
    },
  },
];
