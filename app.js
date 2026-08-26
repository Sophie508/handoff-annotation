/* Node-decision annotation — static, no backend.
   Answers live in localStorage; audio blobs in IndexedDB; everything leaves as a zip. */
(() => {
'use strict';

// ───────────────────────────── i18n ─────────────────────────────
let LANG = localStorage.getItem('nda:lang') || 'zh';
const UI = {
  zh: {
    step_quiz:'偏好问卷', step_nodes:'节点标注', step_export:'导出',
    prev:'上一组', next:'下一组', prev_node:'上一个', next_node:'下一个',
    setup_h:'开始之前',
    setup_lede:'这份标注分两部分：先做一份约 15 分钟的偏好问卷，再对若干轨迹树节点独立打标。全程在你本机完成，结果不会自动上传——做完导出一个 zip，手动发回即可。',
    setup_id:'标注者 ID',
    setup_id_hint:'只用这个 ID 标识你，不要填真实姓名或邮箱——本页面和它读取的数据都是公开的。',
    setup_mic:'麦克风',
    setup_mic_hint:'每组题和每个节点后面可以录一段口头说明（也可以打字）。点下面按钮授权一次即可；不授权也能继续，只是只能打字。',
    setup_mic_btn:'授权麦克风', setup_subset:'待标节点',
    setup_resume:'发现未完成的草稿', setup_resume_btn:'继续上次', setup_discard_btn:'丢弃重来',
    setup_start:'开始',
    export_h:'导出',
    export_lede:'导出一个 zip，里面包含结果（JSON + CSV）和所有录音文件。请把这个 zip 发回给我们。',
    export_btn:'打包下载 zip',
    brand:'节点决策标注',
    mic_ok:'已授权', mic_no:'未授权（可以只打字）', mic_fail:'授权失败或被拒绝——可以只打字',
    mic_insecure:'当前不是 https / localhost，浏览器不给麦克风。请用 python3 -m http.server 打开。',
    need_id:'请先填一个标注者 ID',
    rec_start:'录音', rec_stop:'停止', rec_again:'重录', rec_del:'删掉', rec_ing:'录音中',
    rec_len:s=>`已录 ${s} 秒`, text_ph:'也可以打字说明（可选）',
    quiz_of:(a,b)=>`偏好问卷 · 第 ${a} / ${b} 组`,
    node_of:(a,b)=>`节点标注 · 第 ${a} / ${b} 个`,
    flip_at:r=>`↑ 你在第 ${r} 行翻转`,
    flip_none:'（还没有翻转点——如果你每行都选同一边，这本身也是有效答案）',
    flip_multi:'⚠ 出现了多次来回翻转，导出时会标出来',
    pair_q:'更想先看哪个方向的结果？',
    q_research:'研究问题', q_chain:'从根节点到这里的路径', q_ctx:'路径上前面的节点',
    q_cur:'当前节点', q_cand:'候选的下一步', q_ask:'你会怎么判断这个节点？',
    l_cont:'继续', l_stop:'停止', l_esc:'交给人',
    l_cont_s:'这条线继续跑', l_stop_s:'剪掉这条线', l_esc_s:'停下来问人',
    reason_h:'为什么这么判？勾选适用的（可多选）', reason_other:'其他（补充说明）',
    f_hyp:'当前假设', f_ev:'关键证据', f_risk:'主要风险', f_tools:'调用的工具', f_status:'状态',
    sum_id:'标注者 ID', sum_quiz:'问卷完成组数', sum_nodes:'已标节点数',
    sum_audio:'录音段数', sum_text:'文字说明数',
    exporting:'打包中…', exported:f=>`已下载 ${f}`,
    incomplete:'还有未完成的部分，但你仍然可以导出（未答的会留空）。',
    no_subset:'subset.json 里没有节点——先填好它再开始。',
    loaderr:e=>`数据加载失败：${e}。请确认是用 http.server 打开、且 data/ 目录在。`,
    subset_ok:(n,t)=>`共 ${n} 个节点，来自 ${t} 棵树。改 data/subset.json 可换一批。`,
    draft_found:(id,n)=>`ID「${id}」，已完成 ${n} 项。录音也还在。`,
    confirm_discard:'确定丢弃草稿（含已录的音频）重新开始？',
    step_learn:'怎么标', learn_back:'回到问卷', learn_next:'我明白了，开始标注',
    setup_consent:'知情同意',
    setup_consent_body:'这是一项研究用的标注任务。你的选择、文字说明和录音会被我们用于研究分析；录音会转成文字，转写后的内容可能出现在论文或报告里，但不会带上你的姓名。所有数据只存在你自己的电脑上，由你导出后手动发回，我们不会自动收集任何东西。你可以随时关掉页面退出，不需要给理由。',
    setup_consent_agree:'我已阅读并同意参与',
    need_consent:'请先勾选同意再开始',
    tree_of:(a,b,c,d)=>`轨迹树 ${a} / ${b} · 第 ${c} / ${d} 题`,
    tree_intro_h:n=>`第 ${n} 棵树`,
    tree_intro_p:n=>`下面 ${n} 道题都来自同一次研究——同一个研究问题、同一棵树上的不同位置。先读一遍研究问题，后面几题就不用重新进入状态了。`,
    tree_start:'开始这棵树',
    ex_choose:'三个选项分别怎么想',
    ex_verdict:'小结',
    spine_here:'你在这里'
  },
  en: {
    step_quiz:'Quiz', step_nodes:'Node labeling', step_export:'Export',
    prev:'Previous', next:'Next', prev_node:'Previous', next_node:'Next',
    setup_h:'Before you start',
    setup_lede:'Two parts: a ~15-minute preference quiz, then independent labeling of a set of trajectory-tree nodes. Everything runs on your machine and nothing is uploaded — at the end you download one zip and send it back.',
    setup_id:'Annotator ID',
    setup_id_hint:'You are identified only by this ID. Do not enter a real name or email — this page and its data are public.',
    setup_mic:'Microphone',
    setup_mic_hint:'After each group of questions and each node you can record a short spoken note (typing works too). Grant access once below; you can continue without it and just type.',
    setup_mic_btn:'Grant microphone', setup_subset:'Nodes to label',
    setup_resume:'Unfinished draft found', setup_resume_btn:'Resume', setup_discard_btn:'Discard and restart',
    setup_start:'Start',
    export_h:'Export',
    export_lede:'Download one zip containing the results (JSON + CSV) and every recording. Please send that zip back to us.',
    export_btn:'Download zip',
    brand:'Node-decision annotation',
    mic_ok:'granted', mic_no:'not granted (typing still works)', mic_fail:'denied or failed — you can still type',
    mic_insecure:'Not https / localhost, so the browser blocks the microphone. Serve with python3 -m http.server.',
    need_id:'Enter an annotator ID first',
    rec_start:'Record', rec_stop:'Stop', rec_again:'Re-record', rec_del:'Delete', rec_ing:'recording',
    rec_len:s=>`${s}s recorded`, text_ph:'or type your reasoning (optional)',
    quiz_of:(a,b)=>`Quiz · group ${a} / ${b}`,
    node_of:(a,b)=>`Node labeling · ${a} / ${b}`,
    flip_at:r=>`↑ you switch at row ${r}`,
    flip_none:'(no switch yet — picking one side throughout is also a valid answer)',
    flip_multi:'⚠ multiple switches back and forth; this is flagged in the export',
    pair_q:'Which direction would you rather see results from first?',
    q_research:'Research question', q_chain:'Path from the root to here',
    q_ctx:'Earlier nodes on the path', q_cur:'Current node', q_cand:'Candidate next step',
    q_ask:'What is your call on this node?',
    l_cont:'Continue', l_stop:'Stop', l_esc:'Human',
    l_cont_s:'keep this line running', l_stop_s:'prune this line', l_esc_s:'defer to a human',
    reason_h:'Why this call? Check all that apply', reason_other:'Other (specify)',
    f_hyp:'Current hypothesis', f_ev:'Key evidence', f_risk:'Main risk',
    f_tools:'Tools called', f_status:'Status',
    sum_id:'Annotator ID', sum_quiz:'Quiz groups done', sum_nodes:'Nodes labeled',
    sum_audio:'Recordings', sum_text:'Typed notes',
    exporting:'packing…', exported:f=>`downloaded ${f}`,
    incomplete:'Some parts are unfinished; you can still export (blanks stay blank).',
    no_subset:'subset.json has no items — fill it in first.',
    loaderr:e=>`Failed to load data: ${e}. Check you opened this via http.server and data/ exists.`,
    subset_ok:(n,t)=>`${n} nodes from ${t} trees. Edit data/subset.json to change the set.`,
    draft_found:(id,n)=>`ID "${id}", ${n} items answered. Recordings are still here.`,
    confirm_discard:'Discard the draft (including recordings) and start over?',
    step_learn:'How to label', learn_back:'Back to quiz', learn_next:'Got it — start labeling',
    setup_consent:'Consent',
    setup_consent_body:'This is an annotation task for research. Your choices, written notes and recordings will be used for research analysis; recordings will be transcribed, and the transcribed text may appear in a paper or report, but never with your name. All data stays on your own computer — you export it and send it back by hand, and nothing is collected automatically. You may close the page and stop at any time, without giving a reason.',
    setup_consent_agree:'I have read this and agree to take part',
    need_consent:'Please tick the consent box first',
    tree_of:(a,b,c,d)=>`Tree ${a} / ${b} · item ${c} / ${d}`,
    tree_intro_h:n=>`Tree ${n}`,
    tree_intro_p:n=>`The next ${n} items all come from one research run — one research question, different points on the same tree. Read the question once and the rest will not need re-orienting.`,
    tree_start:'Start this tree',
    ex_choose:'How each option looks',
    ex_verdict:'In short',
    spine_here:'you are here'
  }
};
const T = k => UI[LANG][k];
const t = v => (v && typeof v === 'object') ? (v[LANG] ?? v.zh ?? v.en ?? '') : (v ?? '');

// ───────────────────────────── dom utils ─────────────────────────────
const $ = s => document.querySelector(s);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid === null || kid === undefined || kid === false) continue;
    n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return n;
};

// ───────────────────────────── audio store (IndexedDB) ─────────────────────────────
const AudioStore = (() => {
  let dbp = null;
  const open = () => dbp ||= new Promise((res, rej) => {
    const r = indexedDB.open('nda-audio', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('clips');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const tx = async (mode, fn) => {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction('clips', mode);
      const req = fn(t.objectStore('clips'));
      t.oncomplete = () => res(req && req.result);
      t.onerror = () => rej(t.error);
    });
  };
  return {
    put: (k, blob) => tx('readwrite', s => s.put(blob, k)),
    get: (k) => tx('readonly', s => s.get(k)),
    keys: () => tx('readonly', s => s.getAllKeys()),
    del: (k) => tx('readwrite', s => s.delete(k)),
    clear: () => tx('readwrite', s => s.clear()),
  };
})();

// ───────────────────────────── state ─────────────────────────────
const DRAFT_KEY = 'nda:draft';
const State = {
  annotatorId: '', startedAt: null,
  quiz: {},           // sectionId -> {answers:{}, rationale:''}
  nodes: {},          // "tree|node" -> {label, rationale, shownAt, answeredAt}
  audio: {},          // recId -> {dur, mime, bytes}
  qi: 0, ni: 0,
  save() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      annotatorId: this.annotatorId, startedAt: this.startedAt,
      consent: this.consent, quiz: this.quiz, nodes: this.nodes, audio: this.audio,
      qi: this.qi, ni: this.ni,
      savedAt: new Date().toISOString()
    }));
  },
  load() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      Object.assign(this, d);
      this.audio ||= {};
      return d;
    } catch { return null; }
  },
  answeredCount() {
    return Object.values(this.quiz).filter(s => Object.keys(s.answers || {}).length).length
         + Object.values(this.nodes).filter(n => n.label).length;
  }
};

let QUIZ = null, INDEX = null, LEARN = null, SUBSET = [], SECTIONS = [], NODEDATA = [];
let micGranted = false;

// ───────────────────────── webm → wav ─────────────────────────
// MediaRecorder gives webm/opus, which Finder and QuickTime refuse to open.
// Re-encode to 16 kHz mono 16-bit WAV at export time so the files just play.
async function toWav(blob) {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  try {
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    const rate = 16000;
    const frames = Math.max(1, Math.round(decoded.duration * rate));
    const off = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, frames, rate);
    const src = off.createBufferSource();
    src.buffer = decoded;
    src.connect(off.destination);
    src.start();
    const mono = (await off.startRendering()).getChannelData(0);

    const buf = new ArrayBuffer(44 + mono.length * 2);
    const view = new DataView(buf);
    const str = (off_, sv) => { for (let i = 0; i < sv.length; i++) view.setUint8(off_ + i, sv.charCodeAt(i)); };
    str(0, 'RIFF'); view.setUint32(4, 36 + mono.length * 2, true); str(8, 'WAVE');
    str(12, 'fmt '); view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    str(36, 'data'); view.setUint32(40, mono.length * 2, true);
    for (let i = 0; i < mono.length; i++) {
      const v = Math.max(-1, Math.min(1, mono[i]));
      view.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
    }
    return { blob: new Blob([buf], { type: 'audio/wav' }), ext: 'wav',
             seconds: Math.round(decoded.duration) };
  } catch (e) {
    console.warn('wav conversion failed, keeping original', e);
    return { blob, ext: (blob.type.split('/')[1] || 'webm').split(';')[0], seconds: null };
  } finally {
    ctx.close && ctx.close();
  }
}

// ───────────────────── recording ids (used as file names) ─────────────────────
// Names must say what they answer without opening them: part, order, and the
// question or node they belong to.
const safe = x => String(x).replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-|-$/g, '');
const quizRecId = (i, sec) => `quiz-${i + 1}-${safe(sec.id)}-${safe(State.annotatorId)}`;
const nodeRecId = (i, item) =>
  `tree${item.section || 1}-${String(i + 1).padStart(2, '0')}-${safe(item.node_id)}-${safe(State.annotatorId)}`;

// ───────────────────────────── recorder ─────────────────────────────
function Recorder(recId, promptText, onChange) {
  const wrap = el('div', { class: 'rec' });
  wrap.append(el('p', { class: 'q' }, promptText));

  const btn = el('button', { class: 'secondary', type: 'button' }, T('rec_start'));
  const state = el('span', { class: 'recstate' });
  const player = el('audio', { controls: 'controls' });
  player.hidden = true;
  const del = el('button', { class: 'ghost', type: 'button' }, T('rec_del'));
  del.hidden = true;

  let rec = null, chunks = [], timer = null, t0 = 0;
  // duration comes from wall-clock timestamps, not from tick counting: background
  // tabs throttle setInterval, and a Blob's custom props do not survive IndexedDB.
  const elapsed = () => Math.max(0, Math.round((Date.now() - t0) / 1000));

  const showExisting = async () => {
    const blob = await AudioStore.get(recId);
    if (blob) {
      player.src = URL.createObjectURL(blob);
      player.hidden = false; del.hidden = false;
      const d = (State.audio[recId] || {}).dur;
      state.textContent = d === undefined ? T('rec_len')('—') : T('rec_len')(d);
      btn.textContent = T('rec_again');
    }
  };
  showExisting();

  btn.addEventListener('click', async () => {
    if (rec && rec.state === 'recording') { rec.stop(); return; }
    if (!window.isSecureContext) { state.textContent = T('mic_insecure'); return; }
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { state.textContent = T('mic_fail'); return; }
    chunks = []; t0 = Date.now();
    rec = new MediaRecorder(stream);
    rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    rec.onstop = async () => {
      const secs = elapsed();
      stream.getTracks().forEach(tr => tr.stop());
      clearInterval(timer);
      const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      await AudioStore.put(recId, blob);
      State.audio[recId] = { dur: secs, mime: blob.type, bytes: blob.size };
      State.save();
      player.src = URL.createObjectURL(blob);
      player.hidden = false; del.hidden = false;
      btn.textContent = T('rec_again');
      state.textContent = T('rec_len')(secs);
      onChange && onChange(recId);
    };
    rec.start();
    btn.textContent = T('rec_stop');
    state.innerHTML = `<span class="recdot"></span>${T('rec_ing')} 0s`;
    timer = setInterval(() => {
      state.innerHTML = `<span class="recdot"></span>${T('rec_ing')} ${elapsed()}s`;
    }, 500);
  });

  del.addEventListener('click', async () => {
    await AudioStore.del(recId);
    delete State.audio[recId]; State.save();
    player.hidden = true; del.hidden = true; player.removeAttribute('src');
    state.textContent = ''; btn.textContent = T('rec_start');
    onChange && onChange(null);
  });

  wrap.append(el('div', { class: 'row' }, btn, del, state), player);
  return wrap;
}

function RationaleBlock(recId, promptText, getText, setText) {
  const box = Recorder(recId, promptText, () => State.save());
  const ta = el('textarea', { placeholder: T('text_ph') });
  ta.value = getText() || '';
  ta.addEventListener('input', () => { setText(ta.value); State.save(); });
  box.append(ta);
  return box;
}

// ───────────────────────────── deterministic shuffle ─────────────────────────────
function seeded(seedStr) {
  let h = 2166136261;
  for (const ch of seedStr) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
}
function shuffle(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ───────────────────────────── quiz rendering ─────────────────────────────
function sectionState(id) {
  return State.quiz[id] ||= { answers: {}, rationale: '', audio: null };
}

function renderStaircase(sec, host) {
  const st = sectionState(sec.id);
  const list = el('div');
  const paint = () => {
    list.innerHTML = '';
    const picks = sec.items.map(it => st.answers[it.id]);
    let firstFlip = -1, switches = 0;
    for (let i = 1; i < picks.length; i++)
      if (picks[i] && picks[i - 1] && picks[i] !== picks[i - 1]) {
        switches++; if (firstFlip < 0) firstFlip = i;
      }
    sec.items.forEach((it, i) => {
      const cur = st.answers[it.id];
      const A = el('button', {
        class: 'choice' + (cur === 'A' ? ' sel' : ''), type: 'button',
        onclick: () => { st.answers[it.id] = 'A'; State.save(); paint(); }
      }, t(it.optionA || sec.optionA));
      const B = el('button', {
        class: 'choice' + (cur === 'B' ? ' sel' : ''), type: 'button',
        onclick: () => { st.answers[it.id] = 'B'; State.save(); paint(); }
      }, t(it.optionB || sec.optionB));
      list.append(el('div', { class: 'qrow' }, el('div', { class: 'idx' }, i + 1), A, B));
      if (firstFlip === i)
        list.append(el('div', { class: 'flip' }, T('flip_at')(i + 1)));
    });
    if (Object.keys(st.answers).length === sec.items.length && firstFlip < 0)
      list.append(el('div', { class: 'flip' }, T('flip_none')));
    if (switches > 1) list.append(el('div', { class: 'flip' }, T('flip_multi')));
  };
  paint();
  host.append(list);
}

function pairsFor(sec) {
  const ds = sec.directions;
  const all = [];
  for (let i = 0; i < ds.length; i++)
    for (let j = i + 1; j < ds.length; j++) all.push([ds[i], ds[j]]);
  const rnd = seeded(State.annotatorId + '|' + sec.id);
  return shuffle(all, rnd).map(([a, b]) => (rnd() < 0.5 ? [b, a] : [a, b]));
}

function renderPairwise(sec, host) {
  const st = sectionState(sec.id);
  const pairs = pairsFor(sec);
  const list = el('div');
  const paint = () => {
    list.innerHTML = '';
    list.append(el('p', { class: 'hint' }, T('pair_q')));
    pairs.forEach(([a, b], i) => {
      const key = `${a.id}|${b.id}`;
      const cur = st.answers[key];
      const mk = d => el('button', {
        class: 'choice' + (cur === d.id ? ' sel' : ''), type: 'button',
        onclick: () => { st.answers[key] = d.id; State.save(); paint(); }
      }, t(d.label), el('span', { class: 'sub' }, t(d.hint)));
      list.append(el('div', { class: 'qrow' }, el('div', { class: 'idx' }, i + 1), mk(a), mk(b)));
    });
  };
  paint();
  host.append(list);
}

function renderChecklist(sec, host) {
  const st = sectionState(sec.id);
  const list = el('div');
  const paint = () => {
    list.innerHTML = '';
    sec.items.forEach(it => {
      const on = !!st.answers[it.id];
      const cb = el('input', { type: 'checkbox' });
      cb.checked = on;
      const row = el('label', { class: 'check' + (on ? ' sel' : '') },
        cb, el('span', { class: 'rank' }, it.rank), el('span', {}, t(it.label)));
      cb.addEventListener('change', () => {
        st.answers[it.id] = cb.checked; State.save(); paint();
      });
      list.append(row);
    });
  };
  paint();
  host.append(list);
}

function renderBudget(sec, host) {
  const st = sectionState(sec.id);
  if (st.answers.value === undefined) st.answers.value = sec.default;
  const inp = el('input', {
    type: 'number', min: sec.min, max: sec.max, step: '1', value: st.answers.value
  });
  inp.addEventListener('input', () => {
    st.answers.value = inp.value === '' ? null : Number(inp.value); State.save();
  });
  host.append(el('div', { class: 'card' }, inp,
    el('p', { class: 'hint' }, `0 – ${sec.max}`)));
}

function renderQuiz() {
  const host = $('#quizBody');
  host.innerHTML = '';
  const sec = QUIZ.sections[State.qi];
  const st = sectionState(sec.id);

  $('#quizProgress').textContent = T('quiz_of')(State.qi + 1, QUIZ.sections.length);
  $('#quizBar').style.width = ((State.qi) / QUIZ.sections.length * 100) + '%';

  host.append(el('h1', {}, t(sec.title)));
  host.append(el('p', { class: 'lede' }, t(sec.prompt)));
  if (sec.provisional)
    host.append(el('div', { class: 'card warn' }, el('p', { class: 'hint' }, t(sec.provisional_note))));

  ({ staircase: renderStaircase, pairwise: renderPairwise,
     'threshold-checklist': renderChecklist, budget: renderBudget }[sec.type])(sec, host);

  host.append(RationaleBlock(
    quizRecId(State.qi, sec), t(sec.rationale_prompt),
    () => st.rationale, v => st.rationale = v));

  $('#quizPrev').disabled = State.qi === 0;
  $('#quizNext').textContent = State.qi === QUIZ.sections.length - 1 ? T('step_nodes') + ' →' : T('next');
  window.scrollTo(0, 0);
}

// ───────────────────────────── instructions view ─────────────────────────────
function mdBold(text) {
  // instructions.json uses **bold** for the two things worth emphasising
  const frag = document.createDocumentFragment();
  String(text).split(/(\*\*[^*]+\*\*)/).forEach(part => {
    if (/^\*\*[^*]+\*\*$/.test(part)) frag.append(el('b', {}, part.slice(2, -2)));
    else if (part) frag.append(document.createTextNode(part));
  });
  return frag;
}

function paragraphs(text) {
  return String(text).split(/\n\n+/).map(par => el('p', {}, mdBold(par)));
}

function renderLearn() {
  const host = $('#learnBody');
  host.innerHTML = '';
  if (!LEARN) { host.append(el('p', { class: 'hint' }, '(instructions.json missing)')); return; }

  host.append(el('h1', {}, t(LEARN.title)));
  for (const b of LEARN.blocks) {
    host.append(el('h2', { style: 'margin-top:22px' }, t(b.h)));
    if (b.p) host.append(...paragraphs(t(b.p)));
    if (b.choices) {
      const row = el('div', { class: 'labelrow', style: 'margin-top:10px' });
      const cls = { '继续': 'CONTINUE', 'Continue': 'CONTINUE', '停止': 'STOP', 'Stop': 'STOP',
                    '交给人': 'ESCALATE', 'Escalate': 'ESCALATE' };
      b.choices.forEach(c => {
        const key = cls[t(c.label)] || 'CONTINUE';
        row.append(el('div', { class: 'lbtn sel explain', 'data-l': key },
          t(c.label), el('span', { class: 'sub' }, t(c.text))));
      });
      host.append(row);
    }
    if (b.list) {
      const dl = el('div', { class: 'card' });
      b.list.forEach(item => dl.append(el('div', { class: 'field' },
        el('div', { class: 'k' }, t(item.k)), el('div', { class: 'v' }, t(item.v)))));
      host.append(dl);
    }
  }

  // worked example, rendered in the same shape as a real item
  const ex = LEARN.example;
  host.append(el('h2', { style: 'margin-top:26px' }, t(ex.h)));
  host.append(el('p', { class: 'lede' }, t(ex.intro)));
  const demo = el('div', { class: 'example' });
  demo.append(el('div', { class: 'qtitle' }, T('q_research')),
              el('h2', {}, t(ex.question)));
  const spine = ex.path.map((n, i) => ({ id: n.id, label: t(n.hypothesis), cur: false }))
                       .concat([{ id: ex.current.id, label: t(ex.current.hypothesis), cur: true }]);
  demo.append(renderSpine(spine));
  demo.append(el('div', { class: 'card' },
    fieldBlock(T('f_hyp'), t(ex.current.hypothesis)),
    fieldBlock(T('f_ev'), t(ex.current.evidence)),
    fieldBlock(T('f_risk'), t(ex.current.risk))));
  demo.append(el('div', { class: 'candidate' },
    el('div', { class: 'k fieldlabel' }, T('q_cand')),
    el('div', {}, t(ex.current.next_action))));
  demo.append(el('div', { class: 'fieldlabel', style: 'margin-top:16px' }, T('ex_choose')));
  const sub = { CONTINUE: 'l_cont', STOP: 'l_stop', ESCALATE: 'l_esc' };
  ex.reasoning.forEach(r => demo.append(el('div', { class: 'reason', 'data-l': r.label },
    el('b', {}, T(sub[r.label])), ' — ', t(r.text))));
  demo.append(el('div', { class: 'fieldlabel', style: 'margin-top:16px' }, T('ex_verdict')));
  demo.append(el('p', {}, t(ex.verdict)));
  host.append(demo);
  host.append(el('div', { class: 'card' }, el('p', {}, t(LEARN.closing))));
  window.scrollTo(0, 0);
}

// ───────────────────────────── tree spine ─────────────────────────────
// Only the root→current chain, drawn as nodes. Siblings and descendants stay
// hidden: the point is orientation, not extra evidence.
function renderSpine(steps) {
  const wrap = el('div', { class: 'spine' });
  steps.forEach((s, i) => {
    const row = el('div', { class: 'spinerow' + (s.cur ? ' cur' : '') });
    const rail = el('div', { class: 'rail' },
      el('span', { class: 'bead' }),
      i < steps.length - 1 ? el('span', { class: 'line' }) : null);
    const body = el('div', { class: 'sbody' },
      el('div', { class: 'sid' }, s.id + (s.type ? ' · ' + s.type : ''),
         s.cur ? el('span', { class: 'here' }, T('spine_here')) : null),
      el('div', { class: 'stext' }, s.label || '—'));
    row.append(rail, body);
    wrap.append(row);
  });
  return wrap;
}

// ───────────────────────────── node rendering ─────────────────────────────
function nodeKey(item) { return item.tree_id + '|' + item.node_id; }

// Per-action reason taxonomy (action, reason). Shown as multi-select once a
// label is picked. [code, zh, en]. Only CONTINUE and STOP have reasons; the
// HUMAN (internal value ESCALATE) action has none — annotators just write a
// rationale for those.
const REASONS = {
  CONTINUE: [
    ['cont_unexplored', '有分支没探索', 'Unexplored branch'],
    ['cont_insufficient', '证据不足，需要再找', 'Evidence insufficient'],
    ['cont_contradiction', '有矛盾证据待解决', 'Unresolved contradiction'],
    ['cont_verify', '需要验证已有结论', 'Verify existing claim'],
    ['cont_recover', '从失败的路子里恢复 / 换方法', 'Recover from failed approach'],
  ],
  STOP: [
    ['stop_sufficient', '够了，已足够回答问题', 'Sufficient — question answered'],
    ['stop_exhausted', '搜尽了，再搜也不会有新信息', 'Exhausted — no new info expected'],
    ['stop_impossible', '做不到，当前环境无法解决', 'Impossible in this environment'],
  ],
};

// Some source trees stored list-valued fields as their Python/JSON repr
// (`["a", "b"]`). Render those as readable text instead of raw brackets.
function prettyValue(v) {
  if (Array.isArray(v)) return v.join(' · ');
  const s = String(v).trim();
  if (!(s.startsWith('[') && s.endsWith(']'))) return s;
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed.map(x => String(x).trim()).filter(Boolean).join(' · ');
  } catch {
    const inner = s.slice(1, -1).trim();
    if (inner) return inner.split(/,\s*/).map(x => x.replace(/^['"]|['"]$/g, '').trim())
                           .filter(Boolean).join(' · ');
  }
  return s;
}

function fieldBlock(k, v) {
  const text = v === null || v === undefined ? '' : prettyValue(v);
  if (!text || /^none recorded\.?$/i.test(text)) return null;
  return el('div', { class: 'field' }, el('div', { class: 'k' }, k), el('div', { class: 'v' }, text));
}

function renderNode() {
  const host = $('#nodeBody');
  host.innerHTML = '';
  const item = NODEDATA[State.ni];
  const st = State.nodes[nodeKey(item)] ||= { label: null, rationale: '', shownAt: null };
  st.shownAt ||= new Date().toISOString();
  st.reasons ||= [];
  if (st.reason_other == null) st.reason_other = '';

  const sameTree = NODEDATA.filter(x => x.tree_id === item.tree_id);
  const posInTree = sameTree.indexOf(item) + 1;
  const treeNo = item.section || (SECTIONS.findIndex(x => x.tree_id === item.tree_id) + 1) || 1;
  const nTrees = SECTIONS.length || 1;
  $('#nodeProgress').textContent = T('tree_of')(treeNo, nTrees, posInTree, sameTree.length);
  $('#nodeBar').style.width = (State.ni / NODEDATA.length * 100) + '%';

  const { tree, node } = item;
  // A new research question needs re-reading; the rest of the tree does not.
  if (posInTree === 1) {
    host.append(el('div', { class: 'treehead' },
      el('div', { class: 'fieldlabel' }, T('tree_intro_h')(treeNo)),
      el('p', { class: 'hint' }, T('tree_intro_p')(sameTree.length))));
  }
  host.append(el('div', { class: 'qtitle' }, T('q_research')));
  host.append(el('h2', {}, tree.question || tree.task));
  host.append(el('div', { class: 'nodemeta' },
    `${item.dataset === 'A' ? 'Dataset A' : 'Dataset B'} · ${tree.subject_model} · ${tree.task} · node ${node.id}`));

  // ex-ante masking: ancestors + current only. No children, no machine output.
  const path = node.path || [node.id];
  host.append(el('div', { class: 'fieldlabel' }, T('q_chain')));
  host.append(renderSpine(path.map(pid => {
    const p = tree.nodes[pid] || {};
    return { id: pid, type: p.node_type || '', cur: pid === node.id,
             label: prettyValue(p.current_hypothesis || '') };
  })));

  host.append(el('div', { class: 'fieldlabel', style: 'margin-top:16px' }, T('q_cur')));
  const card = el('div', { class: 'card' },
    fieldBlock(T('f_hyp'), node.current_hypothesis),
    fieldBlock(T('f_ev'), node.key_evidence),
    fieldBlock(T('f_risk'), node.main_risk),
    fieldBlock(T('f_tools'), node.tools_called),
    fieldBlock(T('f_status'), node.status));
  host.append(card);

  if (node.next_action)
    host.append(el('div', { class: 'candidate' },
      el('div', { class: 'k fieldlabel' }, T('q_cand')),
      el('div', {}, prettyValue(node.next_action))));

  host.append(el('div', { class: 'fieldlabel', style: 'margin-top:18px' }, T('q_ask')));
  const row = el('div', { class: 'labelrow' });
  const defs = [['CONTINUE', 'l_cont', 'l_cont_s'], ['STOP', 'l_stop', 'l_stop_s'],
                ['ESCALATE', 'l_esc', 'l_esc_s']];
  const reasonHost = el('div', { class: 'reasonblock', style: 'margin-top:14px' });
  const paintReasons = () => {
    reasonHost.innerHTML = '';
    if (!st.label || !REASONS[st.label]) return;   // HUMAN has no reason options
    reasonHost.append(el('div', { class: 'fieldlabel' }, T('reason_h')));
    const opts = el('div', { style: 'display:flex;flex-direction:column;gap:7px;margin-top:8px' });
    (REASONS[st.label] || []).forEach(([code, zh, en]) => {
      const cb = el('input', { type: 'checkbox' });
      cb.checked = st.reasons.includes(code);
      cb.addEventListener('change', () => {
        if (cb.checked) { if (!st.reasons.includes(code)) st.reasons.push(code); }
        else st.reasons = st.reasons.filter(x => x !== code);
        State.save();
      });
      opts.append(el('label', {
        style: 'display:flex;align-items:flex-start;gap:8px;font-size:14.5px;cursor:pointer'
      }, cb, el('span', {}, LANG === 'zh' ? zh : en)));
    });
    reasonHost.append(opts);
    const other = el('input', {
      type: 'text', value: st.reason_other || '', placeholder: T('reason_other'),
      style: 'margin-top:9px;width:100%;padding:7px 10px;border:1px solid var(--line,#d8dfe6);border-radius:6px;font-size:14px'
    });
    other.addEventListener('input', () => { st.reason_other = other.value; State.save(); });
    reasonHost.append(other);
  };
  const paint = () => {
    row.innerHTML = '';
    defs.forEach(([L, k, s]) => row.append(el('button', {
      class: 'lbtn' + (st.label === L ? ' sel' : ''), type: 'button', 'data-l': L,
      onclick: () => {
        // reasons are action-specific: switching the action clears them
        if (st.label !== L) { st.label = L; st.reasons = []; st.reason_other = ''; }
        st.answeredAt = new Date().toISOString(); State.save(); paint(); paintReasons();
      }
    }, T(k), el('span', { class: 'sub' }, T(s)))));
  };
  paint();
  host.append(row);
  paintReasons();
  host.append(reasonHost);

  host.append(RationaleBlock(
    nodeRecId(State.ni, item),
    LANG === 'zh' ? '为什么这么判？（可录音，也可打字）' : 'Why this call? (record or type)',
    () => st.rationale, v => st.rationale = v));

  $('#nodePrev').disabled = State.ni === 0;
  $('#nodeNext').textContent = State.ni === NODEDATA.length - 1 ? T('step_export') + ' →' : T('next_node');
  window.scrollTo(0, 0);
}

// ───────────────────────────── derived params ─────────────────────────────
function derive() {
  const out = {};
  for (const sec of QUIZ.sections) {
    const st = State.quiz[sec.id];
    if (!st) continue;
    if (sec.type === 'staircase') {
      const picks = sec.items.map(it => st.answers[it.id] || null);
      let flip = null, switches = 0;
      for (let i = 1; i < picks.length; i++)
        if (picks[i] && picks[i - 1] && picks[i] !== picks[i - 1]) {
          switches++; if (flip === null) flip = i;
        }
      const row = flip === null ? null : sec.items[flip];
      out[sec.param] = {
        section: sec.id, picks,
        flip_row: flip === null ? null : flip + 1,
        flip_value: row ? (row.loss ?? row.p ?? null) : null,
        multiple_switches: switches > 1,
        all_same: picks.every(p => p && p === picks[0]) ? picks[0] : null,
        mapping: sec.mapping
      };
    } else if (sec.type === 'pairwise') {
      const wins = {}; sec.directions.forEach(d => wins[d.id] = 0);
      const comparisons = [];
      for (const [key, winner] of Object.entries(st.answers)) {
        const [a, b] = key.split('|');
        comparisons.push({ a, b, winner });
        if (wins[winner] !== undefined) wins[winner]++;
      }
      out[sec.param] = {
        section: sec.id, comparisons, win_counts: wins,
        n_pairs_total: sec.directions.length * (sec.directions.length - 1) / 2,
        n_pairs_answered: comparisons.length, mapping: sec.mapping
      };
    } else if (sec.type === 'threshold-checklist') {
      const ticked = sec.items.filter(it => st.answers[it.id]);
      out[sec.param] = {
        section: sec.id,
        ticked: ticked.map(it => it.id),
        threshold_rank: ticked.length ? Math.min(...ticked.map(it => it.rank)) : null,
        non_contiguous: ticked.length
          ? (Math.max(...sec.items.map(i => i.rank)) - Math.min(...ticked.map(i => i.rank)) + 1) !== ticked.length
          : false,
        mapping: sec.mapping
      };
    } else if (sec.type === 'budget') {
      const v = st.answers.value;
      out[sec.param] = {
        section: sec.id, value: v ?? null, anchor_n: sec.anchor_n,
        quota_fraction: (v === null || v === undefined) ? null : v / sec.anchor_n,
        provisional: true, mapping: sec.mapping
      };
    }
  }
  out.gate_parameters = gateParameters(out);
  return out;
}

// The values the frozen G0–G3 engine actually consumes. Everything above is the
// raw reading; this is what gets substituted into the gates for this person.
// Keep in step with build/params.py — that file re-runs the same arithmetic
// offline and is what the sensitivity analysis uses.
function gateParameters(d) {
  // Two layers, matching build/params.py exactly (that file is the offline
  // authority and carries the citations):
  //  measurement — MPL interval+midpoint (λ), Holt–Laury CRRA closed form (ρ),
  //                Bradley–Terry MM fit with pseudo-counts (β), Guttman (α);
  //  calibration — affine placement into the gates' responsive ranges,
  //                PROVISIONAL, raw readings always exported alongside.
  const p = { frozen_reference: { delta: 0.15, lambda0: 0.20, m4_cut: 2,
                                  m5_cut: 2, quota_frac: 0.05 } };
  const lam = d['λ'], rho = d['ρ'], alpha = d['α'], bud = d['B'], beta = d['β'];
  const G_RHO = 4, K_DELTA = 0.227;
  const crraR = pr => 1 - Math.log(1 / pr) / Math.log(G_RHO);
  const round3 = x => Math.round(x * 1000) / 1000;

  const secRows = id => {
    const sec = (QUIZ.sections || []).find(x => x.id === id);
    return sec ? sec.items.map(it => (it.loss ?? it.p) / 100) : [];
  };
  const interval = (reading, rows, loCap, hiCap) => {
    if (!reading) return null;
    if (reading.flip_row !== null) {
      const i = reading.flip_row - 1;           // 0-based index of the switch row
      return [rows[i - 1], rows[i]];
    }
    if (reading.all_same === 'B') return [loCap, rows[0]];
    if (reading.all_same === 'A') return [rows[rows.length - 1], hiCap];
    return null;
  };

  // λ: WTP interval + midpoint, then affine placement into [0.35, 1.05]
  const li = interval(lam, secRows('lambda'), 0.0, 1.0);
  if (li) {
    p.lambda_wtp_interval = li;
    p.lambda_wtp = round3((li[0] + li[1]) / 2);
    p.lambda0 = round3(0.35 + (p.lambda_wtp - 0.025) / 0.825 * 0.70);
  } else { p.lambda_wtp = null; p.lambda0 = null; }

  // ρ: CRRA interval via r = 1 − ln(1/p*)/ln G, then δ = 0.15 + K·r
  const ri = interval(rho, secRows('rho'), 0.13, 0.97);
  if (ri) {
    p.rho_crra_interval = [round3(crraR(ri[0])), round3(crraR(ri[1]))];
    p.rho_crra = round3((crraR(ri[0]) + crraR(ri[1])) / 2);
    p.rho_payoff_ratio_G = G_RHO;
    p.delta = round3(0.15 + K_DELTA * p.rho_crra);
  } else { p.rho_crra = null; p.delta = null; }

  // α: Guttman lowest rank → the three reachable M4 cuts
  const rank = alpha ? alpha.threshold_rank : null;
  p.m4_cut = rank === null || rank === undefined ? null : (rank <= 2 ? 1 : rank <= 4 ? 2 : 3);
  p.alpha_lowest_rank = rank ?? null;
  p.alpha_resolution_note = '6 checklist rungs map onto 3 reachable M4 cuts';

  // B: answer ÷ anchor = per-tree escalation quota
  p.quota_frac = bud && bud.quota_fraction !== null ? bud.quota_fraction : null;

  // β: Bradley–Terry MM fit, 0.5 pseudo-counts, geometric mean 1
  if (beta && (beta.comparisons || []).length) {
    const ids = [...new Set(beta.comparisons.flatMap(c => [c.a, c.b]))].sort();
    const wins = {};
    ids.forEach(a => { wins[a] = {}; ids.forEach(b => { if (a !== b) wins[a][b] = 0.5; }); });
    beta.comparisons.forEach(c => {
      const loser = c.winner === c.a ? c.b : c.a;
      wins[c.winner][loser] += 1;
    });
    let pi = Object.fromEntries(ids.map(a => [a, 1]));
    for (let it = 0; it < 500; it++) {
      const nw = {};
      ids.forEach(a => {
        const W = ids.filter(b => b !== a).reduce((t, b) => t + wins[a][b], 0);
        const den = ids.filter(b => b !== a)
          .reduce((t, b) => t + (wins[a][b] + wins[b][a]) / (pi[a] + pi[b]), 0);
        nw[a] = den ? W / den : 1;
      });
      const gm = Math.exp(ids.reduce((t, a) => t + Math.log(nw[a]), 0) / ids.length);
      ids.forEach(a => { pi[a] = nw[a] / gm; });
    }
    p.beta_worth = Object.fromEntries(ids.map(a => [a, round3(pi[a])]));
    p.beta_weight = p.beta_worth;
    // circular triads: the classic pairwise-consistency check
    const beats = {};
    beta.comparisons.forEach(c => { beats[c.a + '|' + c.b] = c.winner; beats[c.b + '|' + c.a] = c.winner; });
    const over = (x, y) => beats[x + '|' + y] === x;
    let triads = 0;
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++)
        for (let k = j + 1; k < ids.length; k++) {
          const [a, b, c] = [ids[i], ids[j], ids[k]];
          if ((over(a, b) && over(b, c) && over(c, a)) ||
              (over(b, a) && over(c, b) && over(a, c))) triads++;
        }
    p.beta_circular_triads = triads;
    p.beta_note = 'Bradley-Terry MM fit, 0.5 pseudo-counts per pair, worths normalised to geometric mean 1';
  }
  return p;
}

// ───────────────────────────── export ─────────────────────────────
const csvCell = v => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

async function audioName(recId) {
  return (await AudioStore.get(recId)) ? recId + '.wav' : '';
}

const AUDIO_CONTEXT = {};   // recId -> what that clip is answering

async function buildExport() {
  const now = new Date().toISOString();
  const rows = [];
  const quizOut = {};

  for (const sec of QUIZ.sections) {
    const st = State.quiz[sec.id] || { answers: {}, rationale: '' };
    const recId = quizRecId(QUIZ.sections.indexOf(sec), sec);
    const af = await audioName(recId);
    const ameta = State.audio[recId] || {};
    AUDIO_CONTEXT[recId] = {
      part: LANG === 'zh' ? '偏好问卷' : 'quiz',
      order: QUIZ.sections.indexOf(sec) + 1,
      refers_to: `${sec.param} · ${sec.id}`,
      prompt: t(sec.rationale_prompt),
    };
    quizOut[sec.id] = { param: sec.param, type: sec.type, answers: st.answers,
                        rationale_text: st.rationale || '', audio_file: af,
                        audio_seconds: af ? (ameta.dur ?? null) : null };
    for (const [k, v] of Object.entries(st.answers)) {
      rows.push({
        annotator_id: State.annotatorId, kind: 'quiz', section: sec.id, param: sec.param,
        item_id: k, response: typeof v === 'boolean' ? (v ? 'checked' : '') : v,
        dataset: '', tree_id: '', subject_model: '', task: '', node_id: '',
        human_label: '', human_reasons: '', human_reason_other: '',
        luna_label: '', luna_gate: '', sonnet_label: '', sonnet_gate: '',
        labelers_comparable: '',
        rationale_text: st.rationale || '', audio_file: af,
        audio_seconds: af ? (ameta.dur ?? '') : '', timestamp: now
      });
    }
  }

  const nodeOut = [];
  for (const item of NODEDATA) {
    const st = State.nodes[nodeKey(item)] || {};
    const recId = nodeRecId(NODEDATA.indexOf(item), item);
    const af = await audioName(recId);
    const ameta = State.audio[recId] || {};
    AUDIO_CONTEXT[recId] = {
      part: (LANG === 'zh' ? '轨迹树 ' : 'tree ') + (item.section || 1),
      order: NODEDATA.indexOf(item) + 1,
      refers_to: `${item.tree_id} · ${item.node_id}`,
      prompt: (item.tree.question || item.tree.task || '').slice(0, 160),
    };
    const m = item.node.machine || {};
    const comparable = INDEX.datasets[item.dataset].labelers_comparable;
    nodeOut.push({
      dataset: item.dataset, tree_id: item.tree_id, subject_model: item.tree.subject_model,
      task: item.tree.task, node_id: item.node_id, node_type: item.node.node_type || '',
      human_label: st.label || null, human_reasons: st.reasons || [],
      human_reason_other: st.reason_other || '',
      rationale_text: st.rationale || '', audio_file: af,
      audio_seconds: af ? (ameta.dur ?? null) : null,
      shown_at: st.shownAt || null, answered_at: st.answeredAt || null,
      machine: {
        luna: m.luna ? { label: m.luna.label, gate: m.luna.gate, measures: m.luna.measures } : null,
        sonnet: m.sonnet ? { label: m.sonnet.label, gate: m.sonnet.gate, measures: m.sonnet.measures } : null
      },
      labelers_comparable: comparable
    });
    rows.push({
      annotator_id: State.annotatorId, kind: 'node', section: '', param: '',
      item_id: item.tree_id + '|' + item.node_id, response: st.label || '',
      dataset: item.dataset, tree_id: item.tree_id,
      subject_model: item.tree.subject_model, task: item.tree.task,
      node_id: item.node_id, human_label: st.label || '',
      human_reasons: (st.reasons || []).join(';'), human_reason_other: st.reason_other || '',
      luna_label: m.luna ? m.luna.label : '', luna_gate: m.luna ? m.luna.gate : '',
      sonnet_label: m.sonnet ? m.sonnet.label : '', sonnet_gate: m.sonnet ? m.sonnet.gate : '',
      labelers_comparable: comparable,
      rationale_text: st.rationale || '', audio_file: af,
      audio_seconds: af ? (ameta.dur ?? '') : '', timestamp: now
    });
  }

  const cols = ['annotator_id','kind','section','param','item_id','response','dataset',
    'tree_id','subject_model','task','node_id','human_label','human_reasons','human_reason_other',
    'luna_label','luna_gate','sonnet_label',
    'sonnet_gate','labelers_comparable','rationale_text','audio_file','audio_seconds','timestamp'];
  const csv = [cols.join(',')]
    .concat(rows.map(r => cols.map(c => csvCell(r[c])).join(','))).join('\n');

  const results = {
    annotator_id: State.annotatorId,
    started_at: State.startedAt, exported_at: now,
    quiz_version: QUIZ.version, ui_language: LANG, consent: State.consent,
    labelers: INDEX.labelers,
    dataset_notes: INDEX.datasets,
    quiz: quizOut, derived_parameters: derive(), nodes: nodeOut
  };
  return { results, csv };
}

async function doExport() {
  const st = $('#exportState');
  st.textContent = T('exporting');
  const { results, csv } = await buildExport();
  const zip = new JSZip();
  zip.file('results.json', JSON.stringify(results, null, 1));
  zip.file('results.csv', csv);
  zip.file('README.txt',
    'Node-decision annotation export\n' +
    `annotator: ${State.annotatorId}\nexported: ${results.exported_at}\n\n` +
    'results.json  full record incl. machine labels and derived parameters\n' +
    'results.csv   one row per quiz item / node\n' +
    'audio/        recordings; file names appear in the audio_file column\n');
  // recordings: re-encode and ship an index so a clip's file name is not the
  // only clue to which question it answers
  const manifest = [['file', 'annotator_id', 'part', 'order', 'refers_to', 'prompt', 'seconds']];
  const keys = (await AudioStore.keys()).filter(k => k.endsWith(safe(State.annotatorId)));
  for (const k of keys) {
    const raw = await AudioStore.get(k);
    if (!raw) continue;
    st.textContent = T('exporting') + ` (${manifest.length}/${keys.length})`;
    const { blob, ext, seconds } = await toWav(raw);
    zip.file(`audio/${k}.${ext}`, blob);
    const meta = AUDIO_CONTEXT[k] || {};
    manifest.push([`${k}.${ext}`, State.annotatorId, meta.part || '', meta.order || '',
                   meta.refers_to || '', meta.prompt || '', seconds ?? (State.audio[k] || {}).dur ?? '']);
  }
  if (manifest.length > 1)
    zip.file('audio/INDEX.csv', manifest.map(r => r.map(csvCell).join(',')).join('\n'));
  const blob = await zip.generateAsync({ type: 'blob' });
  const fname = `annotation_${State.annotatorId}_${results.exported_at.slice(0, 10)}.zip`;
  const a = el('a', { href: URL.createObjectURL(blob), download: fname });
  document.body.append(a); a.click(); a.remove();
  st.textContent = T('exported')(fname);
}

function renderExport() {
  const host = $('#exportSummary');
  host.innerHTML = '';
  const quizDone = Object.values(State.quiz).filter(s => Object.keys(s.answers || {}).length).length;
  const nodesDone = Object.values(State.nodes).filter(n => n.label).length;
  const texts = Object.values(State.quiz).filter(s => (s.rationale || '').trim()).length
              + Object.values(State.nodes).filter(n => (n.rationale || '').trim()).length;
  AudioStore.keys().then(keys => {
    const mine = keys.filter(k => k.endsWith(State.annotatorId)).length;
    const rows = [
      [T('sum_id'), State.annotatorId, false],
      [T('sum_quiz'), `${quizDone} / ${QUIZ.sections.length}`, quizDone < QUIZ.sections.length],
      [T('sum_nodes'), `${nodesDone} / ${NODEDATA.length}`, nodesDone < NODEDATA.length],
      [T('sum_audio'), mine, false],
      [T('sum_text'), texts, false],
    ];
    host.innerHTML = '';
    rows.forEach(([k, v, bad]) => host.append(el('div', { class: 'sumrow' + (bad ? ' bad' : '') },
      el('span', {}, k), el('span', { class: 'v' }, v))));
    if (quizDone < QUIZ.sections.length || nodesDone < NODEDATA.length)
      host.append(el('p', { class: 'hint' }, T('incomplete')));
  });
  window.scrollTo(0, 0);
}

// ───────────────────────────── navigation ─────────────────────────────
function show(view) {
  ['setup', 'quiz', 'learn', 'nodes', 'export'].forEach(v =>
    $('#view-' + v).hidden = v !== view);
  $('#stepbar').hidden = view === 'setup';
  document.querySelectorAll('.step').forEach(b => {
    b.classList.toggle('active', b.dataset.goto === view);
  });
  if (view === 'quiz') renderQuiz();
  if (view === 'learn') renderLearn();
  if (view === 'nodes') renderNode();
  if (view === 'export') renderExport();
}

// ───────────────────────────── data loading ─────────────────────────────
async function loadJSON(path) {
  const r = await fetch(path, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${path} → ${r.status}`);
  return r.json();
}

async function loadAll() {
  QUIZ = await loadJSON('data/quiz.json');
  INDEX = await loadJSON('data/index.json');
  try { LEARN = await loadJSON('data/instructions.json'); }
  catch (e) { console.warn('instructions.json not loaded', e); }
  const subset = await loadJSON('data/subset.json');
  SUBSET = subset.items || [];
  SECTIONS = subset.sections || [];
  const treeCache = new Map();
  NODEDATA = [];
  for (const it of SUBSET) {
    const file = 'data/trees/' + it.tree_id.replace(/\//g, '__') + '.json';
    if (!treeCache.has(file)) treeCache.set(file, await loadJSON(file));
    const tree = treeCache.get(file);
    const node = tree.nodes[it.node_id];
    if (!node) { console.warn('missing node', it); continue; }
    NODEDATA.push({ ...it, tree, node });
  }
  window.SUBSET_N = NODEDATA.length;   // for the e2e driver
  return { nTrees: treeCache.size };
}

// ───────────────────────────── boot ─────────────────────────────
function applyLang() {
  document.documentElement.lang = LANG;
  $('#langBtn').textContent = LANG === 'zh' ? 'EN' : '中';
  $('#brandTitle').textContent = T('brand');
  document.querySelectorAll('[data-i18n]').forEach(n => {
    const v = T(n.dataset.i18n);
    if (typeof v === 'string') n.textContent = v;
  });
}

async function init() {
  applyLang();
  $('#langBtn').addEventListener('click', () => {
    LANG = LANG === 'zh' ? 'en' : 'zh';
    localStorage.setItem('nda:lang', LANG);
    applyLang();
    const cur = ['setup', 'quiz', 'learn', 'nodes', 'export'].find(v => !$('#view-' + v).hidden);
    show(cur);
  });

  try {
    const { nTrees } = await loadAll();
    $('#subsetInfo').textContent = NODEDATA.length
      ? T('subset_ok')(NODEDATA.length, nTrees)
      : T('no_subset');
  } catch (e) {
    $('#subsetInfo').textContent = T('loaderr')(e.message);
    $('#startBtn').disabled = true;
    return;
  }

  const draft = (() => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { return null; } })();
  if (draft && draft.annotatorId) {
    const n = (Object.values(draft.quiz || {}).filter(s => Object.keys(s.answers || {}).length).length)
            + (Object.values(draft.nodes || {}).filter(x => x.label).length);
    $('#resumeCard').hidden = false;
    $('#resumeInfo').textContent = T('draft_found')(draft.annotatorId, n);
    $('#annotatorId').value = draft.annotatorId;
  }
  $('#resumeBtn').addEventListener('click', () => {
    State.load(); applyLang(); $('#consentBox').checked = !!(State.consent || {}).agreed;
    $('#whoami').textContent = State.annotatorId; show('quiz');
  });
  $('#discardBtn').addEventListener('click', async () => {
    if (!confirm(T('confirm_discard'))) return;
    localStorage.removeItem(DRAFT_KEY); await AudioStore.clear();
    location.reload();
  });

  $('#micBtn').addEventListener('click', async () => {
    if (!window.isSecureContext) { $('#micState').textContent = T('mic_insecure'); return; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach(t => t.stop());
      micGranted = true; $('#micState').textContent = T('mic_ok');
    } catch { $('#micState').textContent = T('mic_fail'); }
  });
  $('#micState').textContent = T('mic_no');

  $('#startBtn').addEventListener('click', () => {
    const id = $('#annotatorId').value.trim();
    if (!id) { alert(T('need_id')); return; }
    if (!$('#consentBox').checked) { alert(T('need_consent')); return; }
    State.consent = { agreed: true, at: new Date().toISOString() };
    State.annotatorId = id;
    State.startedAt ||= new Date().toISOString();
    State.save();
    $('#whoami').textContent = id;
    show('quiz');
  });

  $('#quizPrev').addEventListener('click', () => {
    if (State.qi > 0) { State.qi--; State.save(); renderQuiz(); }
  });
  $('#quizNext').addEventListener('click', () => {
    if (State.qi < QUIZ.sections.length - 1) { State.qi++; State.save(); renderQuiz(); }
    else { State.save(); show('learn'); }
  });
  $('#learnBack').addEventListener('click', () => show('quiz'));
  $('#learnNext').addEventListener('click', () => show('nodes'));
  $('#nodePrev').addEventListener('click', () => {
    if (State.ni > 0) { State.ni--; State.save(); renderNode(); }
  });
  $('#nodeNext').addEventListener('click', () => {
    if (State.ni < NODEDATA.length - 1) { State.ni++; State.save(); renderNode(); }
    else { State.save(); show('export'); }
  });
  document.querySelectorAll('.step').forEach(b =>
    b.addEventListener('click', () => State.annotatorId && show(b.dataset.goto)));
  $('#exportBtn').addEventListener('click', doExport);
}

init();
})();
