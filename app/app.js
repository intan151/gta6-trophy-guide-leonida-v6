// Leonida Ledger: tracker, roadmap and missables for the 55 GTA VI trophies.
// All data comes from data/trophies.json (same origin, fetched once at load).
// Progress lives in localStorage; export/import move it as a JSON file.

const EARNED_KEY = 'leonida-ledger-earned-v1';
const SPOILER_KEY = 'leonida-ledger-spoilers-v1';
const EXOPHASE_URL = 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/';
const PSNPROFILES_URL = 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi';

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detail');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilersEl = document.getElementById('spoilers');
const hideEarnedEl = document.getElementById('hideEarned');
const onlineNoteEl = document.getElementById('onlineNote');
const resultCountEl = document.getElementById('resultCount');

const STAGES = [
  { n: 1, title: 'Story first — Chapters 1 to 4 and the finale', body: 'Play the main story straight through. This clears the 4 chapter trophies, the opening mission, the final mission gold, and the 6 named-mission trophies. Do the missable mission trophies as they come up; the finale is your last easy chance at first-pass moments.' },
  { n: 2, title: 'Side missions — contacts and strangers', body: 'Clear the five contact strands (Andy, Kenton, Billy, Randy, Tyrone), Bret\'s hunt, and 8 stranger strands across Leonida. Strands unlock as the story advances, so sweep the map for markers after each chapter.' },
  { n: 3, title: 'Collectibles and exploration', body: 'Sweep Leonida region by region: 3 card sets, 100 WAiNK locations, 18 meditation spots, 100 vehicles discovered, all 52 areas, 8 garages, and 10 Scooter Bros registrations. The strange-encounter trophy and the Ocean Beach cocktail live here too.' },
  { n: 4, title: 'Activities and challenges', body: 'The skill stage: gold in all 42 Shooting Range challenges, wins in 20 different races and at all 14 drone race locations, beating Cal at fishing, one arcade game, 50 challenges, and trying all 9 activity types. Start the Shooting Range early — it is the longest grind.' },
  { n: 5, title: 'Cleanup — money, robberies and feats', body: 'The last stage: 5 bank vaults, the armored truck, one illegal operation per gang, the partner feats, the combat feats, $250,000 laundered and $100,000 spent. These feed the 100% completion gold, and the platinum pops with the last of them.' },
];

const KIND_LABELS = {
  platinum: 'Platinum', story: 'Story', completion: 'Completion', side: 'Side mission',
  collectible: 'Collectible', activity: 'Activity', exploration: 'Exploration',
  combat: 'Combat', money: 'Money',
};

let trophies = [];
let earned = new Set(loadJSON(EARNED_KEY, []));
let kindFilter = 'all';
let selectedId = null;

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function saveSpoilers() {
  localStorage.setItem(SPOILER_KEY, JSON.stringify(spoilersEl.checked));
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function gradeBadge(grade) {
  const span = el('span', 'badge grade-' + grade, grade);
  span.title = grade + ' trophy';
  return span;
}

function isSpoilerHidden(t) {
  return spoilersEl.checked && t.kind === 'story' && !earned.has(t.id);
}

function kindMatches(t) {
  if (kindFilter === 'all') return true;
  if (kindFilter === 'missable') return t.missable;
  if (kindFilter === 'online') return false;
  if (kindFilter === 'story') return t.kind === 'story' || t.kind === 'platinum' || t.kind === 'completion';
  return t.kind === kindFilter;
}

function trophyVisible(t) {
  if (!kindMatches(t)) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earned.has(t.id)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + (t.target || '')).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function trophyCard(t) {
  const li = el('li', 'trophy' + (earned.has(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : ''));
  li.dataset.id = String(t.id);

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = earned.has(t.id);
  check.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  check.addEventListener('change', () => {
    if (check.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveEarned();
    renderAll();
  });
  li.append(check);

  const body = el('div', 'trophyBody', null);
  body.setAttribute('role', 'button');
  body.tabIndex = 0;
  body.addEventListener('click', () => {
    selectedId = t.id;
    renderAll();
    detailEl.scrollIntoView({ block: 'nearest' });
  });
  body.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectedId = t.id;
      renderAll();
    }
  });

  const top = el('div', 'trophyTop');
  if (isSpoilerHidden(t)) {
    top.append(el('span', 'trophyName', 'Hidden story trophy'));
    top.append(gradeBadge(t.grade));
  } else {
    top.append(el('span', 'trophyName', t.name));
    top.append(gradeBadge(t.grade));
  }
  body.append(top);

  const desc = el('p', 'trophyDesc', isSpoilerHidden(t)
    ? 'A story trophy — earn it to reveal its name and description.'
    : t.description);
  body.append(desc);

  const meta = el('p', 'trophyMeta');
  const bits = [];
  if (t.missable) bits.push('MISSABLE');
  if (t.hidden) bits.push('Hidden on PSN');
  bits.push(KIND_LABELS[t.kind] || t.kind);
  if (t.target && !isSpoilerHidden(t)) bits.push(t.target);
  meta.textContent = bits.join(' · ');
  body.append(meta);
  li.append(body);
  return li;
}

function renderList() {
  listEl.replaceChildren();
  const shown = trophies.filter(trophyVisible);
  for (const t of shown) listEl.append(trophyCard(t));
  resultCountEl.textContent = shown.length === trophies.length
    ? 'Showing all 55 trophies.'
    : 'Showing ' + shown.length + ' of 55 trophies.';
  onlineNoteEl.hidden = kindFilter !== 'online';
}

function sourceLink(source) {
  if (source.startsWith('Exophase')) {
    const a = document.createElement('a');
    a.href = EXOPHASE_URL;
    a.textContent = source;
    return a;
  }
  if (source.startsWith('PSNProfiles')) {
    const a = document.createElement('a');
    a.href = PSNPROFILES_URL;
    a.textContent = source;
    return a;
  }
  return document.createTextNode(source);
}

function renderDetail() {
  detailEl.replaceChildren();
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    detailEl.append(el('p', 'detailEmpty', 'Select a trophy to read its guide, steps and sources.'));
    return;
  }
  const hidden = isSpoilerHidden(t);
  detailEl.append(el('p', 'detailKicker', 'Trophy ' + t.id + ' of 55'));
  const head = el('div', 'detailHead');
  head.append(el('h2', null, hidden ? 'Hidden story trophy' : t.name));
  head.append(gradeBadge(t.grade));
  detailEl.append(head);
  detailEl.append(el('p', 'detailDesc', hidden ? 'Earn this story trophy to reveal its name and description.' : t.description));

  const flags = el('p', 'detailFlags');
  const flagBits = [];
  if (t.missable) flagBits.push('MISSABLE — do it on your first pass');
  if (t.hidden) flagBits.push('Hidden on PlayStation until earned');
  flagBits.push((KIND_LABELS[t.kind] || t.kind) + ' · Roadmap stage ' + t.stage);
  if (t.target) flagBits.push('Target: ' + t.target);
  flags.textContent = flagBits.join(' · ');
  detailEl.append(flags);

  if (hidden) {
    detailEl.append(el('p', 'detailEmpty', 'Spoilers are on: the guide, steps and sources for this story trophy stay hidden until you earn it. Uncheck “Hide story spoilers” above to read it now.'));
    return;
  }
  detailEl.append(el('h3', null, 'Guide'));
  detailEl.append(el('p', null, t.guide));
  detailEl.append(el('h3', null, 'Steps'));
  const steps = el('ol', 'detailSteps');
  for (const s of t.steps) steps.append(el('li', null, s));
  detailEl.append(steps);
  detailEl.append(el('h3', null, 'Sources'));
  const srcs = el('ul', 'detailSources');
  for (const s of t.sources) {
    const li = el('li');
    li.append(sourceLink(s));
    srcs.append(li);
  }
  detailEl.append(srcs);
  detailEl.append(el('p', 'detailNote', 'Guides are written in our own words for this entry. Where the official description names no place, the guide says so rather than guessing one.'));
}

function renderProgress() {
  const n = earned.size;
  document.getElementById('earnedCount').textContent = String(n);
  document.getElementById('progressFill').style.width = (n / 55 * 100) + '%';
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(n));
  document.getElementById('progressNote').textContent = n >= 55
    ? 'Platinum earned — you are a Leonida Legend.'
    : 'Platinum is ' + (54 - Math.min(n, 54)) + ' trophies away.';
  const counts = {};
  for (const t of trophies) if (earned.has(t.id)) counts[t.grade] = (counts[t.grade] || 0) + 1;
  document.getElementById('gradeCounts').textContent =
    'Platinum ' + (counts.platinum || 0) + '/1 · Gold ' + (counts.gold || 0) + '/2 · Silver ' + (counts.silver || 0) + '/6 · Bronze ' + (counts.bronze || 0) + '/46';
  document.getElementById('missableCount').textContent =
    '(' + trophies.filter((t) => t.missable && earned.has(t.id)).length + '/' + trophies.filter((t) => t.missable).length + ' earned)';
}

function renderRoadmap() {
  const stagesEl = document.getElementById('roadmapStages');
  stagesEl.replaceChildren();
  for (const s of STAGES) {
    const li = el('li', 'stage');
    li.append(el('h3', null, 'Stage ' + s.n + ' — ' + s.title));
    li.append(el('p', null, s.body));
    const stageTrophies = trophies.filter((t) => t.stage === s.n);
    const done = stageTrophies.filter((t) => earned.has(t.id)).length;
    li.append(el('p', 'stageCount', done + ' of ' + stageTrophies.length + ' earned in this stage'));
    stagesEl.append(li);
  }
  const listsEl = document.getElementById('roadmapLists');
  listsEl.replaceChildren();
  for (const s of STAGES) {
    listsEl.append(el('h4', null, 'Stage ' + s.n + ' — ' + s.title));
    const ol = el('ol', 'trophyList compact');
    for (const t of trophies.filter((x) => x.stage === s.n)) ol.append(trophyCard(t));
    listsEl.append(ol);
  }
}

function renderMissables() {
  const listEl2 = document.getElementById('missableList');
  listEl2.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) listEl2.append(trophyCard(t));
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
}

function switchView(view) {
  for (const btn of document.querySelectorAll('#tabs button')) {
    btn.classList.toggle('active', btn.dataset.view === view);
  }
  document.getElementById('viewTracker').hidden = view !== 'tracker';
  document.getElementById('viewRoadmap').hidden = view !== 'roadmap';
  document.getElementById('viewMissables').hidden = view !== 'missables';
  if (location.hash.slice(1) !== view) history.replaceState(null, '', '#' + view);
}

for (const btn of document.querySelectorAll('#tabs button')) {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
}

for (const chip of document.querySelectorAll('#kindFilters .chip')) {
  chip.addEventListener('click', () => {
    kindFilter = chip.dataset.kind;
    for (const c of document.querySelectorAll('#kindFilters .chip')) c.classList.toggle('active', c === chip);
    renderList();
  });
}

searchEl.addEventListener('input', renderList);
gradeEl.addEventListener('change', renderList);
hideEarnedEl.addEventListener('change', renderList);
spoilersEl.addEventListener('change', () => {
  saveSpoilers();
  renderAll();
});

document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-ledger-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(Number(id))).map((id) => Number(id)));
    saveEarned();
    renderAll();
  } catch {
    alert('That file is not a Leonida Ledger progress export.');
  }
  event.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies? This cannot be undone.')) {
    earned = new Set();
    saveEarned();
    renderAll();
  }
});

spoilersEl.checked = loadJSON(SPOILER_KEY, true);

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;
renderAll();
switchView(['tracker', 'roadmap', 'missables'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'tracker');
