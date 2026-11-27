import { openTutorDrawer } from '../components/tutorDrawer.js';
import { escapeHtml } from '../utils/html.js';

const RAPID_FIRE = [
  {
    id: 'rf-1',
    tag: 'Case 1 · Histology',
    q: 'What is the single microscopic requirement to diagnose acute appendicitis — and why is luminal pus alone insufficient?',
    a: 'Neutrophils infiltrating the muscularis propria. Mucosal or luminal neutrophils alone are non-specific and can reflect inflammation elsewhere in the bowel (e.g., enteritis).',
  },
  {
    id: 'rf-2',
    tag: 'Step 1 · LAD-1',
    q: 'A newborn has delayed umbilical cord separation, recurrent bacterial skin infections with NO pus, and a WBC of 48,000. Which adhesion molecule and extravasation step are defective?',
    a: 'CD18 (β₂-integrin subunit of LFA-1) — defective tight/firm adhesion to endothelial ICAM-1. Neutrophils stay trapped in the bloodstream (high WBC) and cannot enter tissue to form pus.',
  },
  {
    id: 'rf-3',
    tag: 'Case 2 · Gross & Micro',
    q: 'How do you distinguish a benign chronic peptic ulcer from a malignant gastric ulcer grossly, and what are the 4 microscopic layers from surface to base?',
    a: 'Benign: sharp, punched-out crater with flat margins and smooth radiating rugal folds (vs. heaped-up, irregular margins in adenocarcinoma). 4 layers: (1) necrotic debris, (2) acute neutrophilic exudate, (3) granulation tissue, (4) dense fibrous scar.',
  },
  {
    id: 'rf-4',
    tag: 'Step 1 · Wound Healing',
    q: 'Which enzyme converts Type III collagen (granulation tissue) into Type I collagen (scar), what mineral cofactor does it require, and what vitamin deficiency causes defective collagen hydroxylation?',
    a: 'Matrix metalloproteinases / collagenase (cofactor: Zinc) remodel Type III → Type I collagen. Vitamin C is required for hydroxylation of proline and lysine (deficiency → scurvy, fragile vessels, poor wound healing); Copper is required for lysyl oxidase cross-linking.',
  },
  {
    id: 'rf-5',
    tag: 'Case 3 · Cytokines',
    q: 'In tuberculosis, which cytokine drives CD4⁺ T cells toward Th1, which cytokine converts macrophages into epithelioid histiocytes/giant cells, and which cytokine maintains granuloma integrity?',
    a: 'IL-12 (from macrophages) → Th1 differentiation; IFN-γ (from Th1 cells) → epithelioid histiocyte transformation & Langhans giant cell fusion; TNF-α → maintains granuloma walling-off (blocking it with anti-TNF biologics reactivates latent TB).',
  },
  {
    id: 'rf-6',
    tag: 'Step 1 · CGD',
    q: 'A 6-year-old boy has recurrent liver abscesses with S. aureus and Serratia plus granulomas on biopsy despite normal T/B cells. What enzyme is defective and what test confirms it?',
    a: 'NADPH oxidase (Chronic Granulomatous Disease, usually X-linked). Phagocytes cannot generate superoxide/respiratory burst to kill catalase-positive organisms (which destroy their own H₂O₂). Confirm with dihydrorhodamine (DHR) flow cytometry (absent fluorescence).',
  },
  {
    id: 'rf-7',
    tag: 'Step 1 · Mediators',
    q: 'Which two mediators directly sensitize sensory nerve endings to produce inflammatory pain (dolor), and which upstream factor triggers the kinin, complement, and coagulation cascades together?',
    a: 'PGE₂ (from COX) and Bradykinin (from HMWK via kallikrein) cause pain. Factor XII (Hageman factor), activated by exposed subendothelial collagen, simultaneously triggers coagulation/fibrinolysis, complement, and the kinin system.',
  },
  {
    id: 'rf-8',
    tag: 'Case 3 · Differential',
    q: 'A biopsy shows noncaseating granulomas in bilateral hilar lymph nodes with hypercalcemia and elevated ACE. What is the diagnosis, and why is calcium elevated?',
    a: 'Sarcoidosis. Activated epithelioid macrophages inside the granulomas express 1α-hydroxylase, converting 25-(OH)-vitamin D into active 1,25-(OH)₂-vitamin D (calcitriol) → increased intestinal Ca²⁺ absorption.',
  },
];

export function createTakeHomeController(onRerender) {
  const revealed = new Set();

  function render() {
    const allOpen = revealed.size === RAPID_FIRE.length;

    return `
      <div class="takehome-wrap">
        <div class="session-bar takehome-bar no-print">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="room-pill">TAKE-HOME &amp; STEP 1</span>
            <span style="font-size:13.5px; color:var(--ink-soft);">High-yield pathology summary for IMC 530 &amp; USMLE Step 1</span>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn sm primary" id="th-print-btn">Print / Save PDF</button>
            <button type="button" class="btn sm" id="th-quiz-ai-btn">✦ Quiz Me (AI Tutor)</button>
            <a href="#/" class="btn sm">← Back to Cases</a>
          </div>
        </div>

        <div class="th-jump-bar no-print">
          <a href="#th-big-picture" class="th-jump-pill">1. Acute vs. Chronic</a>
          <a href="#th-cases" class="th-jump-pill">2. The 3 Cases</a>
          <a href="#th-mediators" class="th-jump-pill">3. Mediators &amp; Extravasation</a>
          <a href="#th-step1-traps" class="th-jump-pill">4. USMLE Step 1 Traps</a>
          <a href="#th-rapid-fire" class="th-jump-pill">5. Rapid-Fire Drill</a>
        </div>

        <!-- SECTION 1: BIG PICTURE -->
        <section class="th-section" id="th-big-picture">
          <p class="stage-kicker">Section 1 · Look First, Name Second</p>
          <h2 class="stage-title">Acute vs. Chronic vs. Granulomatous Inflammation</h2>
          <p class="hint" style="margin-top:0;">Before reading a single line of a Step 1 vignette, the cell type on the slide tells you the timeline and immune arm.</p>

          <div class="th-table-wrap">
            <table class="th-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Acute Inflammation</th>
                  <th>Chronic Inflammation</th>
                  <th>Granulomatous (Special Chronic)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Timeline</b></td>
                  <td>Minutes to hours; resolves in days</td>
                  <td>Weeks to years (persistent injury)</td>
                  <td>Weeks to months (indigestible antigen)</td>
                </tr>
                <tr>
                  <td><b>Dominant Cells</b></td>
                  <td><b>Neutrophils (PMNs)</b> — 3–5 dark nuclear lobes</td>
                  <td><b>Lymphocytes</b> (dense round nucleus), <b>Plasma cells</b> (eccentric clock-face nucleus + Golgi halo), <b>Macrophages</b></td>
                  <td><b>Epithelioid histiocytes</b> (pink macrophages), <b>Multinucleated giant cells</b>, outer lymphocyte cuff</td>
                </tr>
                <tr>
                  <td><b>Immune Arm</b></td>
                  <td>Innate (TLRs, complement, mast cells)</td>
                  <td>Adaptive + Innate (simultaneous injury &amp; repair)</td>
                  <td>Type IV (Delayed) Hypersensitivity — <b>CD4⁺ Th1</b></td>
                </tr>
                <tr>
                  <td><b>Key Mediators</b></td>
                  <td>Histamine, PGE₂/PGI₂, <b>LTB4</b>, C3a/C5a, IL-1, TNF-α, Bradykinin</td>
                  <td>Macrophage cytokines, growth factors (TGF-β, PDGF, FGF, VEGF)</td>
                  <td><b>IL-12</b> (→ Th1), <b>IFN-γ</b> (→ epithelioid &amp; giant cells), <b>TNF-α</b> (→ maintains wall)</td>
                </tr>
                <tr>
                  <td><b>Tissue Outcome</b></td>
                  <td>Resolution, suppuration (pus/abscess), or progression to chronic</td>
                  <td><b>Granulation tissue → Fibrosis/scar</b> (Type III → Type I collagen)</td>
                  <td>Walled-off nodule; ± <b>central caseous necrosis</b> (TB/fungi)</td>
                </tr>
                <tr>
                  <td><b>IMC 530 Anchor</b></td>
                  <td>Case 1: Acute Suppurative Appendicitis</td>
                  <td>Case 2: Bleeding Chronic Peptic Ulcer (acute-on-chronic)</td>
                  <td>Case 3: Tuberculous Caseating Granuloma</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- SECTION 2: THE 3 CASES -->
        <section class="th-section" id="th-cases">
          <p class="stage-kicker">Section 2 · Core Case Anchors</p>
          <h2 class="stage-title">Critical Take-Home Points by Case</h2>

          <div class="th-card-grid">
            <article class="th-case-card">
              <div class="th-card-head">
                <span class="th-badge accent">Case 1 · Acute</span>
                <h3>Acute Suppurative Appendicitis</h3>
              </div>
              <ul class="th-list">
                <li><b>Classic Vignette:</b> Periumbilical/epigastric visceral pain (T10) → migrates to <b>RLQ (McBurney point)</b> somatic pain once serosa irritates parietal peritoneum (<b>rebound tenderness</b>), anorexia, low-grade fever, <b>WBC &gt;15,000 with left shift (↑ bands)</b>.</li>
                <li><b>Pathogenesis:</b> Luminal obstruction (fecalith in adults; lymphoid hyperplasia in children) → venous outflow obstruction → ischemia → gram-negative bacterial overgrowth (LPS → CD14/TLR4 → NF-κB).</li>
                <li><b>Diagnostic Gold Standard:</b> <b>Neutrophils infiltrating the muscularis propria</b>. Mucosal or luminal neutrophils alone are <i>not</i> diagnostic.</li>
                <li><b>Gross vs. Normal:</b> Swollen, tense, dusky-red congested serosa coated by tan fibrinous/purulent exudate (vs. slim, pale, glistening normal appendix).</li>
                <li><b>Step 1 Must-Rule-Out:</b> Always order a <b>urine/serum β-hCG</b> in reproductive-age females with RLQ pain to rule out ruptured <b>ectopic pregnancy</b>; also distinguish from <i>Yersinia</i> mesenteric adenitis ("pseudoappendicitis").</li>
              </ul>
            </article>

            <article class="th-case-card">
              <div class="th-card-head">
                <span class="th-badge warn">Case 2 · Acute-on-Chronic</span>
                <h3>Bleeding Chronic Peptic Ulcer</h3>
              </div>
              <ul class="th-list">
                <li><b>Classic Vignette:</b> Years of intermittent epigastric pain (chronic) suddenly complicated by <b>bright-red hematemesis &amp; hypovolemic shock</b> (acute arterial erosion).</li>
                <li><b>Two-Hit Mechanism:</b> Cytotoxic injury (<i>H. pylori</i> urease/cytotoxins, NSAID COX-1 inhibition removing protective PGE₂) + chemical injury (gastric acid/pepsin) breaching the mucosal barrier.</li>
                <li><b>Gross Hallmark (Benign vs. Malignant):</b> Sharp, <b>punched-out crater</b> with clean base, flat margins, and <b>smooth radiating rugal folds</b> (vs. heaped-up, irregular, necrotic margins of gastric adenocarcinoma).</li>
                <li><b>4 Microscopic Zones (Top → Bottom):</b> (1) Necrotic fibrinoid debris → (2) Acute neutrophilic exudate → (3) Granulation tissue (vessels + fibroblasts) → (4) <b>Dense fibrous scar</b> breaching muscularis propria.</li>
                <li><b>4 Major Complications (Step 1):</b>
                  <b>Hemorrhage</b> (most lethal — posterior duodenal ulcer → <i>gastroduodenal artery</i>; lesser curvature gastric ulcer → <i>left gastric artery</i>),
                  <b>Perforation</b> (free air under diaphragm),
                  <b>Penetration</b> (into pancreas → back pain, ↑ amylase),
                  <b>Gastric outlet obstruction</b> (scarring/fibrosis).</li>
              </ul>
            </article>

            <article class="th-case-card">
              <div class="th-card-head">
                <span class="th-badge vital">Case 3 · Granulomatous</span>
                <h3>Tuberculous Caseating Granuloma</h3>
              </div>
              <ul class="th-list">
                <li><b>Classic Vignette:</b> 6+ weeks of cough (often blood-streaked), low-grade fevers, drenching night sweats, weight loss, and a <b>cavitary upper-lobe lung lesion</b> (reactivation TB favors high-O₂ apices).</li>
                <li><b>4 Microscopic Zones (Center → Rim):</b> (1) Central amorphous pink <b>caseous necrosis</b> (no cellular architecture) → (2) Rim of <b>epithelioid histiocytes</b> (activated macrophages) → (3) <b>Langhans multinucleated giant cells</b> (horseshoe-arranged nuclei) → (4) Peripheral <b>lymphocyte &amp; plasma cell cuff</b>.</li>
                <li><b>Molecular Axis:</b> Macrophage presents antigen on <b>MHC II</b> to CD4⁺ T cell → secretes <b>IL-12</b> → Th1 differentiation → secretes <b>IFN-γ</b> (converts macrophages to epithelioid histiocytes &amp; fuses them into giant cells) + <b>TNF-α</b> (maintains granuloma wall).</li>
                <li><b>Caseating vs. Noncaseating:</b> Central necrosis = <b>TB &amp; endemic fungi</b> (<i>Histoplasma</i>, <i>Coccidioides</i>, <i>Blastomyces</i> — always stain with <b>AFB/Ziehl-Neelsen &amp; GMS</b>). No necrosis = <b>Sarcoidosis</b>, Crohn disease, Berylliosis, Foreign body (suture).</li>
                <li><b>Step 1 Clinical Pearl:</b> Always check <b>PPD or IGRA</b> before starting <b>anti-TNF-α biologics</b> (infliximab, adalimumab, etanercept) to prevent reactivation of latent TB!</li>
              </ul>
            </article>
          </div>
        </section>

        <!-- SECTION 3: MEDIATORS & LEUKOCYTE EXTRAVASATION -->
        <section class="th-section" id="th-mediators">
          <p class="stage-kicker">Section 3 · High-Yield Pathways</p>
          <h2 class="stage-title">Leukocyte Extravasation, Mediators &amp; Wound Remodeling</h2>

          <div class="th-two-col">
            <div class="th-panel">
              <h4>Leukocyte Recruitment (Step-by-Step)</h4>
              <ol class="th-steps">
                <li><b>Margination:</b> Vasodilation slows blood flow → leukocytes move to vessel periphery.</li>
                <li><b>Rolling:</b> <b>E-selectin / P-selectin</b> (endothelium, upregulated by TNF/IL-1 &amp; histamine/Weibel-Palade bodies) bind <b>Sialyl-Lewis X</b> (leukocyte).</li>
                <li><b>Tight Adhesion:</b> <b>ICAM-1 / VCAM-1</b> (endothelium) bind activated <b>β₂-integrins (LFA-1 / CD18)</b> on leukocyte. <i>(Broken in LAD-1!)</i></li>
                <li><b>Diapedesis (Transmigration):</b> <b>PECAM-1 (CD31)</b> lets leukocytes squeeze between endothelial cells.</li>
                <li><b>Chemotaxis:</b> Driven by <b>C5a, LTB4, IL-8</b>, and bacterial <b>fMLP</b>.</li>
                <li><b>Phagocytosis &amp; Killing:</b> Opsonization (<b>IgG Fc, C3b</b>) → phagolysosome fusion <i>(broken in Chédiak-Higashi)</i> → <b>NADPH oxidase</b> respiratory burst <i>(broken in CGD)</i> → <b>MPO</b> generates HOCl (bleach).</li>
              </ol>
            </div>

            <div class="th-panel">
              <h4>Cardinal Signs → Named Mediators</h4>
              <ul class="th-list" style="margin-top:6px;">
                <li><b>Rubor &amp; Calor (Vasodilation):</b> Histamine, <b>PGI₂, PGD₂, PGE₂</b>, Nitric Oxide (NO).</li>
                <li><b>Tumor (Vascular Leak, postcapillary venules):</b> Histamine, <b>Bradykinin</b>, Leukotrienes <b>C4/D4/E4</b>, C3a/C5a.</li>
                <li><b>Dolor (Pain):</b> <b>PGE₂</b> + <b>Bradykinin</b> (from Factor XII → Kallikrein → HMWK).</li>
                <li><b>Fever:</b> Macrophage <b>IL-1 &amp; TNF-α</b> → hypothalamic COX → <b>PGE₂</b> resets thermostat.</li>
                <li><b>Arachidonic Acid Pharmacology:</b>
                  <b>Corticosteroids</b> inhibit <b>PLA₂</b> (blocks <i>both</i> COX &amp; 5-LOX/LTB4).
                  <b>NSAIDs</b> inhibit <b>COX-1/2</b> (relieve pain/fever, but loss of gastric PGE₂ → <b>peptic ulcer</b>).</li>
                <li><b>Collagen Remodeling (Case 2):</b> Granulation tissue (<b>Type III</b>) → Scar (<b>Type I</b>) via <b>MMPs/collagenase (Zinc)</b>. Proline/lysine hydroxylation needs <b>Vitamin C</b>; cross-linking (lysyl oxidase) needs <b>Copper</b>.</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- SECTION 4: USMLE STEP 1 TRAPS -->
        <section class="th-section" id="th-step1-traps">
          <p class="stage-kicker">Section 4 · Board Favorites</p>
          <h2 class="stage-title">High-Yield USMLE Step 1 Immunodeficiencies &amp; Exam Traps</h2>

          <div class="th-traps-grid">
            <div class="th-trap-card">
              <div class="th-trap-title">LAD-1 (CD18 / β₂-Integrin)</div>
              <p><b>Buzzwords:</b> Delayed umbilical cord separation (&gt;30d), recurrent bacterial infections <b>without pus</b>, extreme neutrophilia.</p>
              <p class="th-trap-mech"><b>Defect:</b> Impaired <i>tight adhesion</i> (integrin–ICAM-1). Neutrophils cannot exit vessels.</p>
            </div>

            <div class="th-trap-card">
              <div class="th-trap-title">Chronic Granulomatous Disease</div>
              <p><b>Buzzwords:</b> Recurrent <b>catalase-positive</b> infections (<i>S. aureus</i>, <i>Pseudomonas</i>, <i>Serratia</i>, <i>Nocardia</i>, <i>Aspergillus</i>) + persistent granulomas.</p>
              <p class="th-trap-mech"><b>Defect:</b> <b>NADPH oxidase</b> (no O₂⁻ burst). Confirm with <b>DHR flow cytometry</b> (absent green fluorescence).</p>
            </div>

            <div class="th-trap-card">
              <div class="th-trap-title">Chédiak-Higashi Syndrome</div>
              <p><b>Buzzwords:</b> Partial oculocutaneous albinism, peripheral neuropathy, recurrent pyogenic infections, <b>giant granules</b> in neutrophils.</p>
              <p class="th-trap-mech"><b>Defect:</b> <b>LYST</b> microtubule trafficking → failed phagolysosome fusion.</p>
            </div>

            <div class="th-trap-card">
              <div class="th-trap-title">MPO Deficiency</div>
              <p><b>Buzzwords:</b> Usually asymptomatic, occasionally recurrent <i>Candida</i> infections.</p>
              <p class="th-trap-mech"><b>Defect:</b> No HOCl (bleach) production, but <b>DHR test is NORMAL</b> (NADPH oxidase still makes O₂⁻/H₂O₂).</p>
            </div>

            <div class="th-trap-card">
              <div class="th-trap-title">Sarcoidosis vs. TB</div>
              <p><b>Buzzwords:</b> Young African American female, bilateral hilar lymphadenopathy, erythema nodosum, uveitis, ↑ ACE, <b>↑ Ca²⁺</b>.</p>
              <p class="th-trap-mech"><b>Key Distinction:</b> <b>Noncaseating</b> granulomas; macrophage <b>1α-hydroxylase</b> activates Vitamin D → hypercalcemia.</p>
            </div>

            <div class="th-trap-card">
              <div class="th-trap-title">Foreign-Body (Suture) Granuloma</div>
              <p><b>Buzzwords:</b> Firm nodule at prior surgical site with birefringent suture material engulfed by foreign-body giant cells (nuclei scattered randomly).</p>
              <p class="th-trap-mech"><b>Key Distinction:</b> Chronic granulomatous inflammation without infection or T-cell antigen specificity.</p>
            </div>
          </div>
        </section>

        <!-- SECTION 5: RAPID-FIRE STEP 1 DRILL -->
        <section class="th-section" id="th-rapid-fire">
          <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:10px;">
            <div>
              <p class="stage-kicker">Section 5 · Active Recall</p>
              <h2 class="stage-title" style="margin-bottom:4px;">USMLE Step 1 Rapid-Fire Self-Check</h2>
            </div>
            <button type="button" class="btn sm no-print" id="th-toggle-all-btn">
              ${allOpen ? 'Hide all answers' : 'Reveal all answers'}
            </button>
          </div>
          <p class="hint" style="margin-top:4px;">Test yourself before clicking to reveal. All answers expand automatically when you print or save as PDF.</p>

          <div class="th-flash-list">
            ${RAPID_FIRE.map((item, idx) => {
              const isOpen = revealed.has(item.id);
              return `
                <div class="th-flash-card ${isOpen ? 'open' : ''}">
                  <button type="button" class="th-flash-q" data-rf-id="${escapeHtml(item.id)}" aria-expanded="${isOpen}">
                    <div>
                      <span class="th-flash-tag">${idx + 1}. ${escapeHtml(item.tag)}</span>
                      <div class="th-flash-qtext">${escapeHtml(item.q)}</div>
                    </div>
                    <span class="th-flash-chevron no-print">${isOpen ? '−' : '+'}</span>
                  </button>
                  <div class="th-flash-a ${isOpen ? 'visible' : ''}">
                    <b>High-Yield Answer:</b> ${escapeHtml(item.a)}
                  </div>
                </div>`;
            }).join('')}
          </div>
        </section>

        <div class="footnav no-print" style="margin-top:28px;">
          <a href="#/" class="btn">← Back to Interactive Cases</a>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn primary" id="th-print-btn-bottom">Print / Save as PDF</button>
          </div>
        </div>
      </div>`;
  }

  function bindEvents(root) {
    const triggerPrint = () => window.print();
    root.querySelector('#th-print-btn')?.addEventListener('click', triggerPrint);
    root.querySelector('#th-print-btn-bottom')?.addEventListener('click', triggerPrint);

    root.querySelector('#th-quiz-ai-btn')?.addEventListener('click', () => {
      openTutorDrawer({
        type: 'ai-chat',
        kicker: 'USMLE Step 1 Practice · IMC 530',
        title: 'AI Pathology Step 1 Quizzer',
        caseContext:
          'Student is reviewing the IMC 530 Take-Home & USMLE Step 1 High-Yield Sheet (Acute Suppurative Appendicitis, Bleeding Chronic Peptic Ulcer, Tuberculous Caseating Granuloma, leukocyte extravasation, LAD-1, CGD, Chédiak-Higashi, sarcoidosis, mediators, wound healing/collagen remodeling). Offer concise USMLE Step 1-style vignettes or explanations on request.',
      });
    });

    root.querySelectorAll('.th-jump-pill').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href')?.slice(1);
        const target = targetId ? root.querySelector(`#${targetId}`) : null;
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    root.querySelectorAll('[data-rf-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.rfId;
        if (revealed.has(id)) revealed.delete(id);
        else revealed.add(id);
        onRerender();
      });
    });

    root.querySelector('#th-toggle-all-btn')?.addEventListener('click', () => {
      if (revealed.size === RAPID_FIRE.length) {
        revealed.clear();
      } else {
        RAPID_FIRE.forEach((item) => revealed.add(item.id));
      }
      onRerender();
    });
  }

  return { render, bindEvents };
}
