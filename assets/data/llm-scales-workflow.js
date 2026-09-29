export const meta = {
  name: 'llm-scale-sweep',
  description: 'Find and verify every psychometrically validated LLM/GenAI survey scale',
  phases: [
    { title: 'Sweep', detail: '7 construct-cluster literature sweeps' },
    { title: 'Gap-fill', detail: 'completeness critic hunts for missed scales' },
    { title: 'Verify', detail: 'independent source check of every entry' },
  ],
}

const TODAY = args.today

const CONSTRUCTS = ['attitudes','acceptance-use','trust','reliance','credibility','dependence','literacy','self-efficacy','anxiety','ethics-concerns','privacy','academic-integrity','learning','anthropomorphism','social-presence','relationships','workplace','health','creativity','other']

const SCOPE = `
TASK CONTEXT: We are building a public, searchable catalogue of PSYCHOMETRICALLY VALIDATED survey scales about people's interaction with MODERN LLMs / GENERATIVE AI, for students and researchers.

INCLUDE a scale only if ALL hold:
1. Its items target LLMs, generative AI, or AI chatbots (ChatGPT, Copilot, Gemini, Claude, Bard, Ernie, AI companions like Replika/Character.AI, "generative AI tools"). A general-AI scale re-worded for ChatGPT/GenAI and fully re-validated counts (as its own entry).
2. It has a dedicated development/validation paper or preprint (main aim = develop or validate the scale), reporting (a) factor structure (EFA, CFA, ESEM, IRT/Rasch, network), (b) reliability (alpha, omega, CR, test-retest), and (c) at least one validity evidence (convergent/discriminant, criterion, known-groups, measurement invariance, nomological).
3. Published (journal or peer-reviewed proceedings) OR preprint (PsyArXiv, OSF, arXiv, SSRN, Research Square, medRxiv, etc.).

EXCLUDE: general "AI" scales not targeted at GenAI/LLMs (GAAIS, ATAI, AI anxiety scale, MAILS, AI literacy scales about AI broadly), robots, automation/decision-aid trust, TAM/UTAUT/structural models that merely adapt items without a validation study, theses/dissertations, papers that only USE a scale.

TRANSLATIONS/ADAPTATIONS: if a validated translation/cross-cultural adaptation of a qualifying scale exists, list it in that scale's "adaptations" array. If you only find the adaptation, still report it as a record and set "adaptation_of" to the original scale's name + DOI.

SEARCH HOW: First load web tools: call ToolSearch with query "select:WebSearch,WebFetch". Search Google Scholar-style queries, PsyArXiv, OSF, arXiv, SSRN, ERIC, Research Square, and publisher sites (Elsevier, Springer, Taylor & Francis, Frontiers, MDPI, Wiley, SAGE, APA). Use many query variants (e.g. "ChatGPT scale development validation", "generative AI" scale psychometric, "chatbot" questionnaire CFA reliability, Turkish/Chinese/Spanish/German adaptation). Snowball: check reference lists of reviews of GenAI measurement and "cited by" of known scales. Be exhaustive for your cluster — aim to find every qualifying scale, 2023-2026 especially.

HONESTY: Only report what you actually saw in a source (full text preferred; abstract minimum). Never guess DOIs — fetch https://doi.org/<doi> or the publisher page to confirm. If a field is unknown write null (or empty array), do not invent. In evidence_notes say what you saw and where (full text vs abstract only).

FIELD RULES:
- id: kebab-case slug of acronym or short name (e.g. "chatgpt-dependence-scale").
- summary: 1-2 plain-language sentences for a student: what it measures and when you'd use it.
- constructs: 1-3 values ONLY from: ${CONSTRUCTS.join(', ')}.
- subscales: name, item count, one-line description of what that subscale captures. Unidimensional → one entry named "(unidimensional)".
- psychometrics.reliability: short string with numbers, e.g. "α .84–.92; ω .86".
- citation: APA 7.
- status: "published" or "preprint" (if a preprint later appeared in a journal, status=published and keep preprint_url).
- items_available: true only if full item wording is given in the paper/appendix/OSF.
`

const SUBSCALE = { type: 'object', properties: { name: { type: 'string' }, items: { type: ['integer','null'] }, description: { type: 'string' } }, required: ['name','items','description'] }
const SAMPLE = { type: 'object', properties: { n: { type: ['integer','null'] }, country: { type: 'string' }, population: { type: 'string' } }, required: ['n','country','population'] }
const ADAPT = { type: 'object', properties: { language: { type: 'string' }, country: { type: 'string' }, citation: { type: 'string' }, doi: { type: ['string','null'] }, url: { type: ['string','null'] }, status: { type: 'string', enum: ['published','preprint'] }, notes: { type: 'string' } }, required: ['language','country','citation','doi','url','status','notes'] }
const RECORD = {
  type: 'object',
  properties: {
    id: { type: 'string' }, name: { type: 'string' }, acronym: { type: ['string','null'] },
    summary: { type: 'string' }, target: { type: 'string' },
    constructs: { type: 'array', items: { type: 'string', enum: CONSTRUCTS } },
    populations: { type: 'array', items: { type: 'string' } },
    items: { type: ['integer','null'] }, response: { type: ['string','null'] },
    subscales: { type: 'array', items: SUBSCALE },
    psychometrics: { type: 'object', properties: {
      structure: { type: 'string' }, reliability: { type: 'string' },
      validity: { type: 'array', items: { type: 'string' } },
      samples: { type: 'array', items: SAMPLE } }, required: ['structure','reliability','validity','samples'] },
    status: { type: 'string', enum: ['published','preprint'] },
    citation: { type: 'string' }, authors: { type: 'string' }, year: { type: ['integer','null'] }, venue: { type: ['string','null'] },
    doi: { type: ['string','null'] }, url: { type: ['string','null'] }, preprint_url: { type: ['string','null'] },
    items_available: { type: 'boolean' }, language: { type: 'string' },
    adaptations: { type: 'array', items: ADAPT },
    adaptation_of: { type: ['string','null'] },
    evidence_notes: { type: 'string' },
  },
  required: ['id','name','acronym','summary','target','constructs','populations','items','response','subscales','psychometrics','status','citation','authors','year','venue','doi','url','preprint_url','items_available','language','adaptations','adaptation_of','evidence_notes'],
}
const FOUND = { type: 'object', properties: {
  scales: { type: 'array', items: RECORD },
  borderline: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, citation: { type: 'string' }, link: { type: ['string','null'] }, reason: { type: 'string' } }, required: ['name','citation','link','reason'] } },
  queries_run: { type: 'integer' },
}, required: ['scales','borderline','queries_run'] }

const CLUSTERS = [
  ['attitudes', 'Attitudes toward ChatGPT/GenAI, perceptions, acceptance, adoption, use intention, usage frequency/behaviour, satisfaction, perceived usefulness scales that were properly validated.'],
  ['trust', 'Trust in LLMs/chatbots, reliance, over-reliance, verification behaviour, perceived credibility/accuracy of GenAI output, scepticism, calibration.'],
  ['dependence', 'ChatGPT/GenAI dependence, addiction, problematic or compulsive use, overuse, AI chatbot dependency, withdrawal, fear of missing out on AI.'],
  ['literacy', 'GenAI literacy, ChatGPT competence, prompt engineering skill, GenAI self-efficacy, digital competence with GenAI, critical evaluation skills, readiness to use GenAI.'],
  ['anxiety', 'GenAI/ChatGPT anxiety, technostress, job/replacement threat from GenAI, ethical concerns, perceived risks, privacy concerns, misinformation worry, moral judgments of GenAI use.'],
  ['education', 'Education-specific: student and teacher GenAI/ChatGPT use scales, academic integrity/cheating/plagiarism with GenAI, GenAI in learning/writing/assessment, teacher acceptance, learning outcomes, AI-assisted learning motivation.'],
  ['social', 'Anthropomorphism/mind perception of LLM chatbots, social presence, parasocial/companion relationships (Replika, Character.AI), emotional attachment, loneliness with AI companions, plus workplace GenAI scales (employee use, AI-augmented work, creativity with GenAI) and health contexts (patients/clinicians using ChatGPT).'],
]

phase('Sweep')
const sweeps = await parallel(CLUSTERS.map(([key, desc]) => () =>
  agent(`${SCOPE}\n\nYOUR CLUSTER: ${desc}\nFind every qualifying scale in this cluster (scales that also fit other clusters are fine to include). Put near-misses you are unsure about in "borderline" with the reason.`,
    { label: `sweep:${key}`, phase: 'Sweep', schema: FOUND })))

const norm = s => (s || '').toLowerCase().replace(/https?:\/\/(dx\.)?doi\.org\//, '').replace(/[^a-z0-9]/g, '')
const keyOf = r => r.doi ? 'doi:' + norm(r.doi) : 'n:' + norm(r.name) + (r.year || '')
function mergeInto(map, recs) {
  let fresh = 0
  for (const r of recs) {
    const k = keyOf(r)
    const nk = 'n:' + norm(r.name) + (r.year || '')
    const existingKey = map.has(k) ? k : [...map.keys()].find(x => map.get(x)._nk === nk)
    if (existingKey) {
      const e = map.get(existingKey)
      e.constructs = [...new Set([...e.constructs, ...r.constructs])].slice(0, 3)
      const seenA = new Set(e.adaptations.map(a => norm(a.doi || a.citation)))
      for (const a of r.adaptations) if (!seenA.has(norm(a.doi || a.citation))) e.adaptations.push(a)
      if (JSON.stringify(r).length > JSON.stringify(e).length) Object.assign(e, { ...r, constructs: e.constructs, adaptations: e.adaptations })
      e.evidence_notes += ' | ' + r.evidence_notes
    } else { map.set(k, { ...r, _nk: nk }); fresh++ }
  }
  return fresh
}

const found = new Map()
let borderline = []
for (const s of sweeps.filter(Boolean)) { mergeInto(found, s.scales); borderline.push(...s.borderline) }
log(`Sweep: ${found.size} unique candidates, ${borderline.length} borderline`)

phase('Gap-fill')
const known = [...found.values()].map(r => `- ${r.name}${r.acronym ? ' (' + r.acronym + ')' : ''}, ${r.year}, doi ${r.doi}`).join('\n')
const gap = await agent(`${SCOPE}\n\nYOU ARE THE COMPLETENESS CRITIC. Seven cluster sweeps already found these scales:\n${known}\n\nFind qualifying scales that are MISSING from this list. Try angles the sweeps may have missed: non-English origin scales (Chinese, Turkish, Korean, Arabic, Spanish, Portuguese, German, Indonesian, Persian journals), specific professions (nurses, physicians, lawyers, programmers, journalists), code assistants (GitHub Copilot), AI image generators if paired with text GenAI, older-adult samples, children/adolescents, conference proceedings (CHI, CSCW), recent 2025-2026 preprints, systematic reviews of GenAI instruments and their tables. Also list validated translations/adaptations of the known scales (report them as records with adaptation_of set). Return ONLY new items, not ones already listed.`,
  { label: 'gap-fill', phase: 'Gap-fill', schema: FOUND })
if (gap) { const n = mergeInto(found, gap.scales); borderline.push(...gap.borderline); log(`Gap-fill added ${n} new candidates`) }

const all = [...found.values()].map(({ _nk, ...r }) => r)
const BATCH = 10
const batches = []
for (let i = 0; i < all.length; i += BATCH) batches.push(all.slice(i, i + BATCH))
log(`Verifying ${all.length} candidates in ${batches.length} batches`)

const VERDICTS = { type: 'object', properties: { results: { type: 'array', items: { type: 'object', properties: {
  id: { type: 'string' },
  verdict: { type: 'string', enum: ['keep','drop','borderline'] },
  reason: { type: 'string' },
  corrections: { type: 'string' },
  record: RECORD,
}, required: ['id','verdict','reason','corrections','record'] } } }, required: ['results'] }

phase('Verify')
const verified = await parallel(batches.map((b, i) => () =>
  agent(`${SCOPE}\n\nYOU ARE AN INDEPENDENT, SKEPTICAL VERIFIER. Other agents proposed the records below. For EACH record, open the actual source (fetch the DOI/URL; find full text via publisher, PMC, ResearchGate, preprint server) and check:\n1. The DOI/URL resolves to this paper; citation (authors, year, title, venue) is correct.\n2. It meets ALL inclusion criteria (GenAI/LLM-targeted items; dedicated validation; factor structure + reliability + validity evidence). If it fails, verdict "drop" with reason. If you truly cannot tell, "borderline".\n3. Subscale names, item counts, total items, response format, reliability numbers, samples match the paper. FIX any errors in "record".\n4. Status is current: if a preprint now has a journal version, set status "published", update citation/doi/venue, keep preprint_url.\n5. Adaptations listed are real (check each quickly); remove any you cannot confirm.\n6. Summary is accurate and plain-language; constructs fit.\nIf the record has adaptation_of set, confirm the original and keep adaptation_of (we will nest it).\nReturn one result per input record (same id), with the corrected full record. In corrections, list what you changed (or "none"). In record.evidence_notes, state what you verified and whether from full text or abstract.\n\nRECORDS:\n${JSON.stringify(b, null, 1)}`,
    { label: `verify:${i + 1}/${batches.length}`, phase: 'Verify', schema: VERDICTS })))

const results = verified.filter(Boolean).flatMap(v => v.results)
const kept = results.filter(r => r.verdict === 'keep').map(r => ({ ...r.record, verified: TODAY }))
const border = results.filter(r => r.verdict === 'borderline').map(r => ({ name: r.record.name, citation: r.record.citation, link: r.record.doi || r.record.url, reason: r.reason }))
const dropped = results.filter(r => r.verdict === 'drop').map(r => ({ name: r.record.name, reason: r.reason }))
const unverifiedIds = new Set(results.map(r => r.id))
const missing = all.filter(r => !unverifiedIds.has(r.id)).map(r => r.name)
if (missing.length) log(`WARNING: ${missing.length} candidates got no verifier result`)
log(`Kept ${kept.length}, borderline ${border.length}, dropped ${dropped.length}`)
return { kept, borderline: [...border, ...borderline], dropped, unverified: missing, corrections: results.filter(r => r.corrections && r.corrections !== 'none').map(r => ({ id: r.id, corrections: r.corrections })) }
