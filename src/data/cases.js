export const CASES = [
  {
    id: 'case1',
    shortLabel: 'Case 1',
    title: '21-year-old, migrating abdominal pain',
    vignette: {
      text: 'A 21-year-old female college student presents with recent epigastric pain. She reports anorexia and nausea, and the pain has migrated to the right lower quadrant.',
      vitals: [
        { label: 'Temp 100.5°F', warn: false },
        { label: 'Pulse 100/min', warn: false },
        { label: 'Rebound tenderness, abdomen', warn: true },
        { label: 'WBC 18,500, ↑ bands', warn: true },
      ],
      glossary: [
        { term: 'Epigastric pain', def: 'Pain in the upper-middle abdomen, just below the breastbone.' },
        { term: 'Right lower quadrant (RLQ)', def: 'The lower-right section of the abdomen — where the appendix sits.' },
        { term: 'Rebound tenderness', def: "Pain that's worse when pressure is suddenly released, not when it's applied — a sign the lining of the abdominal cavity itself is irritated." },
        { term: 'Bands', def: 'Immature neutrophils released early from the bone marrow — a sign the body is urgently making new white cells to fight something.' },
      ],
    },
    hypotheses: [
      { key: 'appy', label: 'Acute appendicitis' },
      { key: 'gastro', label: 'Gastroenteritis' },
      { key: 'ectopic', label: 'Ectopic pregnancy' },
      { key: 'adenitis', label: 'Mesenteric adenitis' },
    ],
    correctHypothesis: 'appy',
    classPollDemo: { appy: 58, gastro: 22, ectopic: 14, adenitis: 6 },
    image: {
      placeholderLabel: 'Slide #514 — appendix, whole mount, H&E',
      zones: [
        { id: 'lumen', label: 'Lumen', x: 50, y: 38, finding: 'Purulent exudate filling the lumen — neutrophils packed into the central space.' },
        { id: 'mucosa', label: 'Mucosa', x: 40, y: 58, finding: 'Mucosal erosion — the epithelial lining is disrupted and partially lost.' },
        { id: 'wall', label: 'Muscularis wall', x: 62, y: 70, finding: 'Neutrophilic infiltration of the muscularis propria — this is the feature required to call it acute appendicitis.' },
        { id: 'serosa', label: 'Serosa', x: 78, y: 50, finding: 'Serositis where inflammation has reached the outer surface — congestion and hemorrhage visible.' },
      ],
    },
    diagnosis: {
      name: 'Acute suppurative appendicitis',
      rationale: 'Hemorrhage, edema, and mural inflammation predominantly composed of neutrophils are present. The diagnostic requirement is neutrophils within the muscularis propria — mucosal/luminal inflammation alone is non-specific and can be seen with inflammation elsewhere in the bowel.',
    },
    mediators: {
      intro: "Every cardinal sign in this vignette has a named mediator behind it. The obstructed appendiceal lumen lets gram-negative gut flora build up — that's the trigger for everything below.",
      chain: [
        { step: 'Recognition', detail: 'Lipopolysaccharide (LPS) on the gram-negative bacterial wall is a PAMP. CD14, a co-receptor for TLR4 on macrophages, recognizes it directly.' },
        { step: 'Transcription', detail: 'TLR4 activation upregulates NF-κB, the nuclear transcription factor that switches on the genes for the rest of this cascade.' },
        { step: 'Vasodilation → redness, warmth', detail: 'Phospholipase A₂ frees arachidonic acid from the membrane; cyclooxygenase converts it to PGI₂, PGD₂, and PGE₂ — these relax arteriolar smooth muscle, increasing blood flow (rubor, calor).' },
        { step: 'Vascular leak → swelling', detail: 'The same prostaglandins, plus histamine from local mast cells (activated by complement C3a/C5a), cause endothelial cell contraction in postcapillary venules — fluid leaks out as exudate (tumor).' },
        { step: 'Pain and fever', detail: "PGE₂ and bradykinin (from the kinin system, downstream of Hageman factor/Factor XII) sensitize sensory nerve endings (dolor) — and PGE₂ also resets the hypothalamic set point, producing this patient's 100.5°F fever via IL-1/TNF from macrophages." },
        { step: 'Neutrophil recruitment', detail: "5-lipoxygenase produces LTB4 from the same arachidonic acid pool — it's the most potent neutrophil chemoattractant here, alongside complement C5a and bacterial products. This is what fills the lumen and infiltrates the wall." },
      ],
    },
    elaborate: [
      { tag: 'counterfactual', q: "If this patient's WBC had been normal but the clinical picture identical, could it still be appendicitis? Walk me through the reasoning." },
      { tag: 'mechanism', q: "What is the single microscopic feature required to diagnose acute appendicitis, and why doesn't mucosal inflammation alone count?" },
      { tag: 'mechanism', q: 'Walk me through every step a neutrophil takes to get from the bloodstream into this appendix wall — margination through phagocytosis — and name the molecule driving each step.' },
      { tag: 'transfer', q: "This patient's neutrophils can roll and adhere normally but can't firmly stick to the endothelium, and she's had delayed umbilical cord separation since infancy. What's the diagnosis, and which step of leukocyte recruitment is broken?" },
      { tag: 'transfer', q: 'Give me a new, unseen case with right lower quadrant pain that turns out NOT to be appendicitis, and let me work through the differential.' },
    ],
  },
  {
    id: 'case2',
    shortLabel: 'Case 2',
    title: '55-year-old, years of epigastric pain, now hematemesis',
    vignette: {
      text: 'A 55-year-old man has had years of intermittent aching epigastric pain — a chronic injury with chronic inflammation. He suddenly vomits bright red blood and arrives in the ED in hypovolemic shock: an acute event superimposed on the underlying chronic disorder.',
      vitals: [
        { label: 'Years of intermittent epigastric pain', warn: false },
        { label: 'Sudden hematemesis', warn: true },
        { label: 'Hypovolemic shock on arrival', warn: true },
      ],
      glossary: [
        { term: 'Hematemesis', def: "Vomiting blood — here, bright red, meaning it's fresh and the bleeding is active right now." },
        { term: 'Hypovolemic shock', def: "The body's organs aren't getting enough blood flow because too much blood volume has been lost." },
        { term: 'Chronic vs. acute', def: 'Chronic means slow, ongoing injury over years. Acute means a sudden new event — here, a chronic ulcer suddenly bleeding.' },
      ],
    },
    hypotheses: [
      { key: 'pud-bleed', label: 'Bleeding peptic ulcer eroding into an artery' },
      { key: 'varices', label: 'Bleeding esophageal varices' },
      { key: 'mallory', label: 'Mallory-Weiss tear' },
      { key: 'malignancy', label: 'Bleeding gastric malignancy' },
    ],
    correctHypothesis: 'pud-bleed',
    classPollDemo: { 'pud-bleed': 47, varices: 26, mallory: 18, malignancy: 9 },
    image: {
      placeholderLabel: 'Slide #1C27 — gastrectomy specimen, peptic ulcer',
      zones: [
        { id: 'mucosa', label: 'Mucosa margin', x: 30, y: 30, finding: 'Mucosa at the ulcer margin, with adjacent regenerating epithelium.' },
        { id: 'submucosa', label: 'Submucosa', x: 55, y: 42, finding: 'Submucosa shows acute inflammatory exudate over granulation tissue — active injury layered on a healing response.' },
        { id: 'muscularis', label: 'Muscularis', x: 38, y: 62, finding: 'Muscularis propria is breached — this ulcer is deep, extending through the muscle wall.' },
        { id: 'fibrosis', label: 'Ulcer base / fibrosis', x: 60, y: 80, finding: 'Dense fibrosis in the ulcer base — a hallmark of a chronic, repeatedly-injured lesion, not an acute erosion.' },
      ],
    },
    diagnosis: {
      name: 'Chronic peptic ulcer with acute hemorrhage',
      rationale: 'Gross pathology shows a sharp, punched-out ulcer with flat margins near the pylorus. The bleed itself came from erosion of the ulcer base into a large artery — the most dangerous complication of peptic ulcer disease, alongside perforation, penetration, and gastric outlet obstruction.',
    },
    mediators: {
      intro: 'This ulcer is doing two things at once: an acute mediator cascade (the active bleed, right now) layered on top of a chronic one (years of low-grade injury). Separating the two is the key to reading the slide.',
      chain: [
        { step: 'Hageman factor activation', detail: "Factor XII, made in the liver, is activated on contact with the exposed subendothelial collagen at the ulcer base — collagen that's only exposed because the mucosal barrier has been breached down to the muscularis." },
        { step: 'Three downstream cascades', detail: 'Activated Factor XII triggers (1) coagulation/fibrinolysis, (2) complement, and (3) the kinin system simultaneously — which is part of why an acute GI bleed produces both local inflammation and systemic clotting effects.' },
        { step: 'Pain via bradykinin', detail: 'The kinin system cleaves high-molecular-weight kininogen (HMWK) to bradykinin, which — like PGE₂ in Case 1 — sensitizes sensory nerve endings and adds to vascular permeability. This is a separate pain pathway from the histamine/prostaglandin one.' },
        { step: "Why the base looks different from Case 1's wall", detail: 'Years of repeated cytotoxic + chemical injury (H. pylori, acid) means this tissue has already cycled through granulation tissue and into fibrosis — type III collagen progressively replaced by type I. An acute flare adds a fresh layer of neutrophilic exudate on top of that pre-existing scar, which is exactly the layered pattern in the submucosa zone.' },
      ],
    },
    elaborate: [
      { tag: 'callback', q: 'Case 1 showed neutrophils as the acute marker in the appendix wall. What would you expect to see microscopically if this ulcer had a fresh acute flare on top of the chronic fibrosis?' },
      { tag: 'mechanism', q: 'Explain the two-hit mechanism behind a peptic ulcer: cytotoxic injury plus chemical injury. Why does H. pylori matter here?' },
      { tag: 'mechanism', q: "This ulcer base went from granulation tissue to a dense fibrous scar. Walk me through what's converting type III collagen to type I collagen, and what cofactor that enzyme needs — then tell me what happens to wound healing if that cofactor is deficient." },
      { tag: 'transfer', q: "This patient later develops a suture granuloma at the surgical site. Is that acute or chronic inflammation, and why doesn't it fit neatly into either an infection or an autoimmune cause?" },
    ],
  },
  {
    id: 'case3',
    shortLabel: 'Case 3',
    title: '34-year-old, 6 weeks of cough, night sweats, weight loss',
    vignette: {
      text: 'A 34-year-old man, recently emigrated, reports 6 weeks of low-grade fevers, drenching night sweats, and a 12-lb weight loss. He has a chronic cough productive of blood-streaked sputum. Chest imaging shows a cavitary upper-lobe lesion. A biopsy of an enlarged mediastinal lymph node is obtained.',
      vitals: [
        { label: 'Temp 100.2°F, intermittent', warn: false },
        { label: '6 weeks duration', warn: true },
        { label: '12-lb weight loss', warn: true },
        { label: 'Cavitary upper-lobe lesion on imaging', warn: true },
      ],
      glossary: [
        { term: 'Cavitary lesion', def: 'A hollowed-out pocket of destroyed lung tissue visible on imaging — tissue has died and been cleared away, leaving an air-filled space.' },
        { term: 'Mediastinal lymph node', def: 'A lymph node in the chest, between the lungs — the kind that drains and reacts to lung infections.' },
        { term: '6 weeks vs. days', def: "This patient's timeline alone argues against a typical acute, neutrophil-driven process — something this slow points toward a delayed, adaptive-immunity-driven response instead." },
      ],
    },
    hypotheses: [
      { key: 'tb', label: 'Tuberculosis (caseating granulomatous inflammation)' },
      { key: 'sarcoid', label: 'Sarcoidosis (noncaseating granulomatous inflammation)' },
      { key: 'lymphoma', label: 'Lymphoma' },
      { key: 'bacterial-pna', label: 'Ordinary bacterial pneumonia, unresolved' },
    ],
    correctHypothesis: 'tb',
    classPollDemo: { tb: 51, sarcoid: 29, lymphoma: 13, 'bacterial-pna': 7 },
    image: {
      placeholderLabel: 'Slide #882 — mediastinal lymph node biopsy, H&E',
      zones: [
        { id: 'center', label: 'Central necrosis', x: 50, y: 42, finding: 'Central caseous necrosis — an amorphous, cheese-like (caseous) debris with no preserved cellular architecture. This central necrosis is what separates a caseating from a noncaseating granuloma.' },
        { id: 'histiocytes', label: 'Epithelioid rim', x: 32, y: 60, finding: 'A rim of epithelioid histiocytes — macrophages with abundant pink (eosinophilic) cytoplasm, packed tightly around the necrotic center.' },
        { id: 'giant-cells', label: 'Giant cells', x: 66, y: 58, finding: 'Multinucleated giant cells, formed by fusion of epithelioid histiocytes — a hallmark of granulomatous inflammation, driven by IFN-γ from TH1 cells.' },
        { id: 'lymphocyte-rim', label: 'Lymphocyte cuff', x: 50, y: 80, finding: 'An outer rim of lymphocytes and a few plasma cells — the adaptive immune infiltrate that distinguishes this as chronic, not acute, inflammation. No sheets of neutrophils anywhere in this field.' },
      ],
    },
    diagnosis: {
      name: 'Caseating granulomatous inflammation, consistent with tuberculosis',
      rationale: 'The combination of central caseous necrosis, a rim of epithelioid histiocytes, multinucleated giant cells, and a peripheral lymphocyte/plasma cell cuff is the defining picture of a caseating granuloma — characteristic of tuberculosis (and fungal infections). Sarcoidosis produces the same epithelioid histiocyte/giant cell architecture but classically lacks central necrosis (noncaseating) — that single feature is the main thing separating the two on this slide.',
    },
    mediators: {
      intro: "This is a fundamentally different cellular program than Cases 1 and 2 — adaptive immunity (T cells), not innate (neutrophils), running the show. Here's how a mycobacterium turns into a granuloma.",
      chain: [
        { step: 'Antigen presentation', detail: 'Macrophages phagocytose the mycobacterium, process it, and present antigen on MHC class II to CD4⁺ helper T cells — this is the same MHC II/CD4 pairing used by all extracellular antigens.' },
        { step: 'TH1 commitment', detail: 'That interaction makes the macrophage secrete IL-12, which pushes the CD4⁺ T cell to differentiate specifically into the TH1 subset (rather than TH2).' },
        { step: 'The defining cytokine', detail: 'TH1 cells secrete IFN-γ. This single cytokine converts ordinary macrophages into epithelioid histiocytes and fuses them into multinucleated giant cells — IFN-γ is the molecular reason this slide looks the way it does.' },
        { step: "Why it's slow", detail: 'This entire T-cell-coordinated loop takes weeks to assemble, unlike the innate TLR/complement response in Case 1 that fires within hours — which is exactly why this vignette runs 6 weeks instead of 6 hours.' },
      ],
    },
    elaborate: [
      { tag: 'contrast', q: 'Lay Case 1 (appendicitis) and this case side by side: which cell type dominates each, which arm of immunity is responsible (innate vs. adaptive), and why does that explain the difference in timeline — hours versus weeks?' },
      { tag: 'mechanism', q: "If this had been sarcoidosis instead of TB, what single histologic feature would be missing from the slide, and why doesn't the underlying T-cell/macrophage mechanism change even though that feature disappears?" },
      { tag: 'mechanism', q: "Walk me through how a CD8+ cytotoxic T cell would be activated against a cell infected with an intracellular pathogen, and explain why this pathway is the one used for virus-infected cells but TH1/macrophage activation is what's pictured here instead." },
      { tag: 'transfer', q: 'A patient with chronic granulomatous disease (CGD) gets recurrent infections with catalase-positive organisms despite having completely normal T cells and B cells. Explain why a defect in NADPH oxidase — nothing to do with adaptive immunity — still leads to granuloma formation.' },
    ],
  },
];
