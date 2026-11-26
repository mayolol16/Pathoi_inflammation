export const VIGNETTE_EXPLAINERS = {
  case1: {
    title: 'Why abdominal pain migrates — anatomy before diagnosis',
    summary: 'Early hollow-organ pain is midline and vague; once inflammation reaches the outer lining of the abdomen, pain turns sharp and pinpoint.',
    sections: [
      {
        heading: '1. Why it starts in the upper middle (epigastrium / periumbilical)',
        body: 'The appendix develops from the embryologic midgut. Its visceral sensory nerves travel back with autonomic fibers to spinal cord levels T10, so early stretch or distension of the appendix feels like a dull, poorly localized ache around the umbilicus or upper abdomen—often accompanied by nausea and loss of appetite.',
      },
      {
        heading: '2. Why it moves to the right lower quadrant (RLQ)',
        body: 'As pressure rises and bacteria invade the full thickness of the wall, inflammation reaches the serosa and irritates the overlying parietal peritoneum in the RLQ. Unlike visceral nerves, the parietal peritoneum has somatic pain fibers that localize pain sharply to the exact spot.',
      },
      {
        heading: '3. What rebound tenderness & bands mean',
        body: 'When you press on the belly and suddenly let go, the inflamed peritoneal surfaces snap back apart—causing sharp pain (rebound tenderness). Meanwhile, a WBC of 18,500 with ↑ bands ("left shift") means the bone marrow is rushing immature neutrophils into the blood to meet acute demand.',
      },
    ],
  },
  case2: {
    title: 'Chronic injury vs. an acute arterial bleed',
    summary: 'Years of slow mucosal erosion can quietly expose a deep blood vessel, turning a chronic ache into life-threatening hemorrhage in minutes.',
    sections: [
      {
        heading: '1. What "chronic intermittent epigastric pain" tells you',
        body: 'The stomach and proximal duodenum sit in the epigastrium. Years of fluctuating acid/pepsin damage—often accelerated by H. pylori or NSAIDs—cause repeated cycles of mucosal breakdown, granulation tissue, and scarring.',
      },
      {
        heading: '2. Why bright-red hematemesis means active upper GI bleeding',
        body: 'Blood that sits in stomach acid turns dark brown ("coffee-ground" emesis). Vomiting bright red blood means bleeding is brisk and fresh right now—usually from an ulcer eroding straight into a submucosal or extramural artery (such as the gastroduodenal artery posteriorly).',
      },
      {
        heading: '3. Why hypovolemic shock is the immediate emergency',
        body: 'Losing blood rapidly drops intravascular volume, preload, and organ perfusion. Pathologically, this vignette pairs two timelines: years of chronic fibrosis at the ulcer base plus an acute vascular catastrophe right now.',
      },
    ],
  },
  case3: {
    title: 'Six weeks, night sweats, and a lung cavity — why timeline points to adaptive immunity',
    summary: 'Slow constitutional symptoms and cavitary upper-lobe disease point away from neutrophils and toward T-cell-mediated granulomatous containment.',
    sections: [
      {
        heading: '1. Why 6 weeks rules out ordinary acute infection',
        body: 'Neutrophils arrive within hours and cause dramatic, rapid illness over 1–3 days. A 6-week smoldering course with low-grade fever, drenching night sweats, and a 12-lb weight loss signals sustained macrophage/T-cell cytokine release (IL-1, TNF-α, IFN-γ).',
      },
      {
        heading: '2. Why the upper lobe & mediastinal lymph nodes matter',
        body: 'Reactivation tuberculosis favors the well-oxygenated lung apices (upper lobes). As mycobacteria destroy parenchyma and caseous debris drains into bronchi, an air-filled cavity forms—explaining the blood-streaked cough.',
      },
      {
        heading: '3. Why biopsy the lymph node',
        body: 'Enlarged mediastinal nodes drain the lung and trap organisms inside granulomas, letting pathologists inspect the tissue architecture directly to distinguish infection from sarcoidosis or lymphoma.',
      },
    ],
  },
};

export const DIFFERENTIAL_EXPLAINERS = {
  appy: {
    term: 'Acute appendicitis',
    site: 'Vermiform appendix (RLQ)',
    summary: 'Acute neutrophilic inflammation of the appendix, classically triggered by luminal obstruction (fecalith or lymphoid hyperplasia) leading to bacterial overgrowth, ischemia, and transmural invasion.',
    clue: 'Supports Case 1: migrating epigastric → RLQ pain, low-grade fever, rebound tenderness, and leukocytosis with left shift (↑ bands).',
  },
  gastro: {
    term: 'Gastroenteritis',
    site: 'Stomach & small intestine',
    summary: 'Viral or bacterial inflammation of the GI mucosal lining, typically causing crampy diffuse abdominal pain, watery or bloody diarrhea, and vomiting.',
    clue: 'Against Case 1: gastroenteritis usually causes prominent diarrhea and diffuse cramping without true peritoneal rebound tenderness localized to the RLQ.',
  },
  ectopic: {
    term: 'Ectopic pregnancy',
    site: 'Fallopian tube (most common) or pelvis',
    summary: 'Implantation of a fertilized embryo outside the uterine cavity. Rupture causes sudden severe lower abdominal/pelvic pain and internal hemorrhage.',
    clue: 'Always on the differential for a reproductive-age female with RLQ pain! A pregnancy test (β-hCG) is mandatory clinically, though high WBC + fever + classic epigastric-to-RLQ migration favors appendicitis.',
  },
  adenitis: {
    term: 'Mesenteric adenitis',
    site: 'Mesenteric lymph nodes (often RLQ)',
    summary: 'Benign self-limited inflammation of lymph nodes in the intestinal mesentery—often following a viral URI or Yersinia infection—that can mimic appendicitis.',
    clue: 'Against Case 1: typically seen in children/teens with a preceding viral prodrome and lacks true surgical peritonitis or a WBC of 18,500 with marked bandemia.',
  },
  'pud-bleed': {
    term: 'Bleeding peptic ulcer eroding into an artery',
    site: 'Gastric antrum or first part of duodenum',
    summary: 'A full-thickness mucosal defect caused by acid/pepsin overcoming mucosal defenses (most commonly H. pylori or NSAIDs) that burrows deep enough to breach an underlying artery.',
    clue: 'Supports Case 2: years of intermittent epigastric pain (chronic ulcer) abruptly complicated by bright-red hematemesis and hypovolemic shock.',
  },
  varices: {
    term: 'Bleeding esophageal varices',
    site: 'Distal esophagus',
    summary: 'Dilated submucosal veins caused by portal hypertension (usually cirrhosis) that rupture under high venous pressure, causing massive painless hematemesis.',
    clue: 'Against Case 2: varices typically present in patients with chronic liver disease and do NOT explain years of intermittent aching epigastric ulcer pain.',
  },
  mallory: {
    term: 'Mallory-Weiss tear',
    site: 'Gastroesophageal junction',
    summary: 'A longitudinal mucosal laceration caused by forceful retching or vomiting, presenting with hematemesis that begins AFTER repeated bouts of non-bloody vomiting.',
    clue: 'Against Case 2: tears follow acute violent retching and usually cause self-limited bleeding rather than years of epigastric pain ending in shock.',
  },
  malignancy: {
    term: 'Bleeding gastric malignancy',
    site: 'Stomach',
    summary: 'Gastric adenocarcinoma or lymphoma ulcerating through the mucosa, typically presenting with weight loss, early satiety, iron-deficiency anemia, and occult or slow bleeding.',
    clue: 'Less likely than PUD here: cancer usually causes insidious chronic blood loss and weight loss rather than years of stable intermittent pain culminating in sudden arterial shock.',
  },
  tb: {
    term: 'Tuberculosis (caseating granulomatous inflammation)',
    site: 'Lungs (upper lobes) & draining mediastinal lymph nodes',
    summary: 'Chronic granulomatous infection caused by Mycobacterium tuberculosis, driven by CD4+ TH1 cell-mediated immunity and IFN-γ-activated macrophages.',
    clue: 'Supports Case 3: 6 weeks of fever, night sweats, weight loss, hemoptysis, upper-lobe cavitary lesion, and travel/emigration history.',
  },
  sarcoid: {
    term: 'Sarcoidosis (noncaseating granulomatous inflammation)',
    site: 'Lungs, hilar/mediastinal lymph nodes, skin, eyes',
    summary: 'Multisystem immune-mediated disorder of unknown trigger forming tight noncaseating granulomas without central necrosis.',
    clue: 'Classic distractor for Case 3: both involve mediastinal nodes and TH1 granulomas, but sarcoidosis rarely causes cavitary upper-lobe lung destruction or true caseous necrosis.',
  },
  lymphoma: {
    term: 'Lymphoma',
    site: 'Lymph nodes (including mediastinum)',
    summary: 'Neoplastic proliferation of lymphocytes causing painless lymphadenopathy and "B symptoms" (fever, drenching night sweats, >10% weight loss).',
    clue: 'Shares B symptoms and mediastinal adenopathy with Case 3, which is why biopsy is essential—but an upper-lobe cavitary lesion with productive blood-streaked cough strongly favors TB.',
  },
  'bacterial-pna': {
    term: 'Ordinary bacterial pneumonia, unresolved',
    site: 'Lung parenchyma (alveoli)',
    summary: 'Acute neutrophilic alveolar exudate (e.g., Streptococcus pneumoniae) presenting abruptly over days with high fever, rigors, purulent sputum, and lobar consolidation.',
    clue: 'Against Case 3: typical bacterial pneumonia develops over hours to a few days, not 6 weeks, and resolves or forms an abscess rather than chronic granulomatous adenopathy.',
  },
};

export const ELABORATE_GUIDES = {
  case1: [
    {
      tag: 'counterfactual',
      question: "If this patient's WBC had been normal but the clinical picture identical, could it still be appendicitis? Walk me through the reasoning.",
      thinkFirst: 'Before revealing: distinguish a supportive lab finding from the gold-standard tissue requirement.',
      modelAnswer: 'Yes—it can still be acute appendicitis. Peripheral WBC count is neither 100% sensitive nor specific; early appendicitis, immunocompromised patients, or elderly patients can present with a normal WBC despite active transmural inflammation. Conversely, many non-appendiceal conditions elevate WBC. The clinical exam (migrating pain + RLQ peritoneal signs) and, definitively, neutrophils invading the muscularis propria on histology make the diagnosis.',
      clinicalPearl: 'Never rule out appendicitis solely because the WBC is normal when clinical suspicion is high.',
      facilitation: 'Ask students to raise hands if they would send the patient home with a normal WBC, then push them on sensitivity vs. diagnostic criteria.',
    },
    {
      tag: 'mechanism',
      question: "What is the single microscopic feature required to diagnose acute appendicitis, and why doesn't mucosal inflammation alone count?",
      thinkFirst: 'Think about the layers of the GI wall from Orientation 2—which layer must neutrophils actually invade?',
      modelAnswer: 'Neutrophilic infiltration of the muscularis propria is the diagnostic requirement. Mucosal or luminal neutrophils alone are non-specific: luminal pus can be swept down from an inflamed cecum/colon or reflect mild superficial mucosal irritation without true appendicitis.',
      clinicalPearl: 'Pathology boards and surgical pathology sign-out both hinge on "neutrophils in the muscularis propria."',
      facilitation: 'Point back to Zone 3 on the slide and contrast it with Zone 1 (luminal exudate).',
    },
    {
      tag: 'mechanism',
      question: 'Walk me through every step a neutrophil takes to get from the bloodstream into this appendix wall — margination through phagocytosis — and name the molecule driving each step.',
      thinkFirst: 'Try naming the 5 sequential steps and the matching endothelial/leukocyte receptors before checking.',
      modelAnswer: '1) Margination & Rolling: vasodilation slows flow; endothelial E-selectin and P-selectin bind sialyl-Lewis X on neutrophils (low-affinity tethering).\n2) Tight Adhesion (Arrest): chemokines (IL-8/CXCL8) activate neutrophil integrins (LFA-1/CD11a:CD18, Mac-1) to bind endothelial ICAM-1.\n3) Transmigration (Diapedesis): PECAM-1 (CD31) on both neutrophil and endothelial junctions guides passage across the basement membrane.\n4) Chemotaxis: migration up a gradient of LTB4, C5a, IL-8, and bacterial N-formyl peptides.\n5) Phagocytosis & Killing: opsonization via C3b and IgG Fc receptors triggers engulfment and oxidative burst (NADPH oxidase → superoxide → MPO/HOCl).',
      clinicalPearl: 'Selectins = roll; Integrins + ICAM-1 = stick; PECAM-1 = squeeze through; C5a/LTB4 = steer.',
      facilitation: 'Have four students each take one step around the room in sequence.',
    },
    {
      tag: 'transfer',
      question: "This patient's neutrophils can roll and adhere normally but can't firmly stick to the endothelium, and she's had delayed umbilical cord separation since infancy. What's the diagnosis, and which step of leukocyte recruitment is broken?",
      thinkFirst: 'Connect "delayed umbilical cord separation + inability to firmly stick + lack of pus" to a specific adhesion molecule.',
      modelAnswer: 'Leukocyte Adhesion Deficiency type 1 (LAD-1), an autosomal recessive defect in the β2-integrin subunit CD18 (affecting LFA-1 and Mac-1). The broken step is firm adhesion/tight binding to endothelial ICAM-1. Because neutrophils cannot exit blood vessels into tissues, patients get severe recurrent bacterial infections without pus formation, marked peripheral neutrophilia, and classic delayed umbilical cord sloughing (>3 weeks).',
      clinicalPearl: 'LAD-1 = CD18 integrin defect (no pus, delayed cord separation). LAD-2 = sialyl-Lewis X defect (impaired rolling).',
      facilitation: 'Ask: "What would this patient\'s appendix biopsy show—massive pus or empty tissue despite sky-high blood WBC?"',
    },
    {
      tag: 'transfer',
      question: 'Give me a new, unseen case with right lower quadrant pain that turns out NOT to be appendicitis, and let me work through the differential.',
      thinkFirst: 'Try diagnosing this mini-vignette before reading the answer: "19-year-old woman, missed last period, sudden severe RLQ pain 2 hours ago, BP 88/54, HR 122, temp 98.4°F, WBC 10,800."',
      modelAnswer: 'Mini-case diagnosis: Ruptured ectopic pregnancy. Unlike Case 1 (gradual epigastric-to-RLQ migration, 100.5°F fever, WBC 18,500 with bands), this patient has abrupt onset, hemodynamic instability (hypotension + tachycardia from hemoperitoneum), afebrile status, and amenorrhea. Always order a urine/serum β-hCG in any reproductive-age female with lower abdominal pain. Other classic non-appendicitis RLQ mimics include ovarian torsion, cecal diverticulitis, Crohn ileitis, and Meckel diverticulitis.',
      clinicalPearl: 'RLQ pain in a reproductive-age female = always check β-hCG before going to the OR.',
      facilitation: 'Use this mini-vignette for a quick 60-second verbal cold-call at the end of Case 1.',
    },
  ],
  case2: [
    {
      tag: 'callback',
      question: 'Case 1 showed neutrophils as the acute marker in the appendix wall. What would you expect to see microscopically if this ulcer had a fresh acute flare on top of the chronic fibrosis?',
      thinkFirst: 'Picture the four classic histologic zones of an active peptic ulcer from top (lumen) to bottom (base).',
      modelAnswer: 'You would see a superficial layer of necrotic fibrinopurulent debris packed with neutrophils (acute flare) directly overlying a zone of acute/chronic inflammation, followed deeper by vascular granulation tissue, and sitting on top of dense collagenous scar (chronic fibrosis). That layered "acute-on-chronic" architecture is visible in Zone 2 and Zone 4 of Slide #1C27.',
      clinicalPearl: 'Acute-on-chronic pathology leaves a stratigraphic record: fresh neutrophils on the surface, scar underneath.',
      facilitation: 'Link Zone 2 (exudate over granulation tissue) directly back to Case 1\'s neutrophil morphology.',
    },
    {
      tag: 'mechanism',
      question: 'Explain the two-hit mechanism behind a peptic ulcer: cytotoxic injury plus chemical injury. Why does H. pylori matter here?',
      thinkFirst: 'How do bacteria/NSAIDs weaken the shield so stomach acid and pepsin can digest the wall?',
      modelAnswer: 'Peptic ulcers form when aggressive luminal factors (HCl + pepsin = chemical injury) overwhelm mucosal protective defenses (mucus-bicarbonate barrier, prostaglandins, blood flow, epithelial regeneration). H. pylori delivers the cytotoxic hit: its urease creates ammonia, while CagA/VacA cytotoxins and chronic inflammation damage epithelial tight junctions and suppress protective somatostatin (in antral gastritis), driving hypergastrinemia and excess acid—a combined cytotoxic + chemical hit.',
      clinicalPearl: 'Acid alone rarely ulcerates a healthy stomach; you need weakened mucosal defense plus acid/pepsin.',
      facilitation: 'Ask students how NSAIDs produce a parallel two-hit effect (COX inhibition ↓ PGE₂ mucus/blood flow + topical acid injury).',
    },
    {
      tag: 'mechanism',
      question: "This ulcer base went from granulation tissue to a dense fibrous scar. Walk me through what's converting type III collagen to type I collagen, and what cofactor that enzyme needs — then tell me what happens to wound healing if that cofactor is deficient.",
      thinkFirst: 'Identify both the remodeling enzyme family (and its cofactor) AND the collagen hydroxylation cofactor.',
      modelAnswer: 'Two critical enzymes and cofactors work across granulation-to-scar remodeling:\n1) Replacement/remodeling: Matrix metalloproteinases (MMPs) secreted by macrophages and fibroblasts degrade early provisional type III collagen so fibroblasts can deposit stronger type I collagen; MMPs require zinc (Zn²⁺) as a catalytic cofactor. Tissue inhibitors of metalloproteinases (TIMPs) keep MMPs in check.\n2) Collagen cross-linking & maturation: Prolyl and lysyl hydroxylases hydroxylate proline/lysine residues to stabilize the triple helix—requiring Vitamin C (ascorbic acid) as an essential cofactor—and lysyl oxidase cross-links fibrils using copper (Cu²⁺).\nIf Vitamin C is deficient (scurvy) or zinc is depleted, collagen fails to cross-link or remodel, leading to weak scars, fragile capillaries, and wound dehiscence.',
      clinicalPearl: 'MMPs = Zinc (remodel III → I); Prolyl/Lysyl hydroxylase = Vitamin C (stabilize helix); Lysyl oxidase = Copper (cross-link).',
      facilitation: 'Briefly ask why old healed scars can reopen in severe Vitamin C deficiency.',
    },
    {
      tag: 'transfer',
      question: "This patient later develops a suture granuloma at the surgical site. Is that acute or chronic inflammation, and why doesn't it fit neatly into either an infection or an autoimmune cause?",
      thinkFirst: 'What triggers granuloma formation when there is neither a microbe nor self-antigen?',
      modelAnswer: 'A suture granuloma is chronic granulomatous inflammation—specifically a foreign-body granuloma rather than an immune (hypersensitivity) granuloma. Non-absorbable suture material cannot be digested by macrophages, so macrophages fuse around the indigestible foreign body into foreign-body multinucleated giant cells (nuclei scattered haphazardly, unlike the horseshoe perimeter of Langhans cells in TB) without requiring antigen-specific TH1 sensitization.',
      clinicalPearl: 'Granulomas = "macrophage frustration" over something indigestible—either an intracellular microbe (immune/TH1) or inert material like suture/talc (foreign-body).',
      facilitation: 'Use this as the bridge into Case 3: contrast foreign-body giant cells with Langhans giant cells.',
    },
  ],
  case3: [
    {
      tag: 'contrast',
      question: 'Lay Case 1 (appendicitis) and this case side by side: which cell type dominates each, which arm of immunity is responsible (innate vs. adaptive), and why does that explain the difference in timeline — hours versus weeks?',
      thinkFirst: 'Build a 3-row mental table: Dominant cell | Immune arm | Speed & why.',
      modelAnswer: '• Case 1 (Acute appendicitis): Dominated by neutrophils, driven by innate immunity (TLR4/CD14, complement C3a/C5a, mast cell histamine, LTB4). These sensors and circulating neutrophils are pre-formed and ready to fire within minutes to hours.\n• Case 3 (Tuberculosis): Dominated by epithelioid macrophages (histiocytes), Langhans giant cells, and CD4+ TH1 lymphocytes, driven by adaptive immunity. Processing antigen on MHC II, expanding antigen-specific T-cell clones, polarizing TH1 via IL-12, and remodeling macrophages via IFN-γ takes weeks—explaining the 6-week clinical course.',
      clinicalPearl: 'Innate = pre-armed rapid response (hours, neutrophils). Adaptive = clonal expansion & cytokine instruction (weeks, lymphocytes + activated macrophages).',
      facilitation: 'Draw a quick 2-column comparison table on the whiteboard with student volunteers filling in each row.',
    },
    {
      tag: 'mechanism',
      question: "If this had been sarcoidosis instead of TB, what single histologic feature would be missing from the slide, and why doesn't the underlying T-cell/macrophage mechanism change even though that feature disappears?",
      thinkFirst: 'Look at Zone 1 (center of the granuloma) and ask what distinguishes caseating from noncaseating granulomas.',
      modelAnswer: 'Central caseous necrosis (Zone 1) would be missing—sarcoidosis produces tight, well-formed noncaseating granulomas. Yet the core cellular machinery (APC → MHC II → CD4+ TH1 → IL-12/IFN-γ → epithelioid histiocytes + giant cells) is identical; in sarcoidosis an unknown antigen drives exaggerated TH1 macrophage activation without the severe mycobacterial cord-factor/hypersensitivity tissue necrosis seen in TB.',
      clinicalPearl: 'Before calling sarcoidosis, pathologists ALWAYS run AFB (acid-fast) and GMS (fungal) stains—because noncaseating granulomas can still be infectious.',
      facilitation: 'Ask: "If you see a noncaseating granuloma, can you diagnose sarcoidosis on H&E alone?" (No—exclude TB/fungi first.)',
    },
    {
      tag: 'mechanism',
      question: "Walk me through how a CD8+ cytotoxic T cell would be activated against a cell infected with an intracellular pathogen, and explain why this pathway is the one used for virus-infected cells but TH1/macrophage activation is what's pictured here instead.",
      thinkFirst: 'Compare cytosolic antigen loading (MHC I) vs. phagolysosomal antigen loading (MHC II).',
      modelAnswer: 'For viruses replicating in the cytosol, viral proteins are degraded by the proteasome, transported via TAP into the ER, loaded onto MHC Class I (present on all nucleated cells), and recognized by CD8+ cytotoxic T cells—which kill the host cell directly via perforin/granzyme and Fas-FasL.\nBy contrast, Mycobacterium tuberculosis resides inside macrophage phagosomes (preventing phagolysosome fusion). Phagosomal antigens are processed into the endocytic/MHC Class II pathway and presented to CD4+ T cells, which polarize to TH1 and secrete IFN-γ to super-activate the macrophage (inducing NO, ROS, and phagolysosomal fusion) rather than simply lysing it.',
      clinicalPearl: 'Cytosolic pathogen → Proteasome → MHC I → CD8 kill cell. Phagosomal pathogen → Endosome → MHC II → CD4 TH1 super-charge macrophage.',
      facilitation: 'Highlight why killing the macrophage alone wouldn\'t kill TB if the bacteria just spill out into extracellular space.',
    },
    {
      tag: 'transfer',
      question: 'A patient with chronic granulomatous disease (CGD) gets recurrent infections with catalase-positive organisms despite having completely normal T cells and B cells. Explain why a defect in NADPH oxidase — nothing to do with adaptive immunity — still leads to granuloma formation.',
      thinkFirst: 'What happens when macrophages swallow bacteria normally, have intact T-cell help, yet can never finish killing what they engulfed?',
      modelAnswer: 'In CGD, a mutation in NADPH oxidase prevents phagocytes from generating superoxide (O₂⁻) and the respiratory burst. Catalase-negative bacteria make their own H₂O₂ which host MPO can borrow, but catalase-positive organisms (e.g., S. aureus, Aspergillus, Burkholderia, Serratia) destroy their own H₂O₂—so macrophages cannot kill them. Because the bacteria persist inside phagocytes, macrophages keep presenting antigen to normal CD4+ T cells, driving continuous IL-12/IFN-γ release and walling off the unkillable debris inside granulomas.',
      clinicalPearl: 'Granulomas are not exclusive to TB: whenever macrophages ingest something they cannot eradicate (like catalase+ bugs in CGD), persistent TH1 signaling builds a granuloma.',
      facilitation: 'Tie all 3 cases together: Case 1 (neutrophils kill rapidly), Case 2 (chronic injury + scar), Case 3 & CGD (when killing stalls, wall it off in a granuloma).',
    },
  ],
};

/**
 * Generates tailored instructor talking points from live poll vote counts.
 */
export function generateTalkingPoints(caseObj, counts = {}) {
  const hyps = caseObj.hypotheses;
  const total = hyps.reduce((sum, h) => sum + (counts[h.key] || 0), 0);
  const correctHyp = hyps.find((h) => h.key === caseObj.correctHypothesis);

  if (total === 0) {
    return {
      summary: 'No votes have been submitted yet. Open the poll or run a simulated vote to tailor talking points to your room.',
      points: [
        'Anchor the timeline first: ask students whether the symptom onset suggests hours (innate/neutrophilic) or weeks (adaptive/chronic).',
        'Before revealing the slide, ask what single tissue finding would confirm their leading hypothesis.',
      ],
      socraticQuestion: `Looking strictly at the vignette for ${caseObj.shortLabel}, which single clue separates "${correctHyp?.label}" from the closest alternative?`,
    };
  }

  const correctCount = counts[caseObj.correctHypothesis] || 0;
  const correctPct = Math.round((correctCount / total) * 100);
  const distractors = hyps
    .filter((h) => h.key !== caseObj.correctHypothesis)
    .map((h) => ({
      ...h,
      count: counts[h.key] || 0,
      pct: Math.round(((counts[h.key] || 0) / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const topDist = distractors[0];
  const secondDist = distractors[1];
  const points = [];

  if (correctPct >= 80) {
    points.push(`Strong room consensus: ${correctPct}% (${correctCount}/${total}) chose "${correctHyp.label}". Push them not to stop at pattern-matching—ask which specific microscopic feature on the upcoming slide proves it.`);
  } else if (correctPct >= 45) {
    points.push(`Split room: ${correctPct}% chose "${correctHyp.label}", while ${100 - correctPct}% picked alternatives. Frame the upcoming slide reveal as the tie-breaker.`);
  } else {
    points.push(`Productive struggle: only ${correctPct}% selected "${correctHyp.label}". Do not give away the answer yet—let the room debate the top distractor first so the slide reveal resolves the disagreement.`);
  }

  if (topDist && topDist.count > 0) {
    const exp = DIFFERENTIAL_EXPLAINERS[topDist.key];
    points.push(`Address the #1 distractor — "${topDist.label}" (${topDist.pct}%): ${exp ? exp.clue : 'Ask students what single finding in the vignette argues against this option.'}`);
  }

  if (secondDist && secondDist.count > 0) {
    const exp = DIFFERENTIAL_EXPLAINERS[secondDist.key];
    points.push(`Address "${secondDist.label}" (${secondDist.pct}%): ${exp ? exp.clue : 'Clarify how the timeline or anatomy distinguishes this.'}`);
  }

  const socraticByCase = {
    case1: topDist?.key === 'ectopic'
      ? 'If this patient actually had a ruptured ectopic pregnancy, what vital signs and pregnancy test would you expect—and why did her pain start epigastric before moving to the RLQ?'
      : 'Before I show Slide #514: which layer of the appendix wall must have neutrophils for a pathologist to call this acute appendicitis, and why?',
    case2: topDist?.key === 'varices'
      ? 'Both ulcers and varices can cause bright-red hematemesis—which clue in this 55-year-old\'s multi-year history points toward acid/peptic injury rather than portal hypertension?'
      : 'This patient has both a multi-year history and a sudden ER emergency. What two distinct inflammatory timelines do you expect to see layered together on the gastrectomy slide?',
    case3: topDist?.key === 'sarcoid'
      ? 'Nearly a third of the room leaned toward sarcoidosis or another alternative. Looking at the 6-week course plus the cavitary upper-lobe lesion, what single feature inside the granuloma will separate TB from sarcoidosis on biopsy?'
      : 'Looking at the 6-week duration of symptoms, which arm of immunity (innate vs. adaptive) and which dominant cell type do you predict will fill this lymph node biopsy?',
  };

  return {
    summary: `${total} student response${total === 1 ? '' : 's'} recorded · ${correctPct}% selected the target diagnosis.`,
    points,
    socraticQuestion: socraticByCase[caseObj.id] || `What single histological finding would confirm "${correctHyp?.label}" when we reveal the slide?`,
  };
}
