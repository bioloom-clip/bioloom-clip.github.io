const overviewVideo = document.querySelector('#video video');
const overviewPlay = document.querySelector('#video .overview-play');
function playOverview() {
  overviewVideo.play().catch(() => overviewVideo.focus({ preventScroll: true }));
}
function syncOverviewButton() {
  overviewPlay.classList.toggle('overview-replay', overviewVideo.ended);
  overviewPlay.hidden = !overviewVideo.paused && !overviewVideo.ended;
  overviewPlay.setAttribute('aria-label', overviewVideo.ended ? 'Replay BioLoom video' :
    overviewVideo.currentTime ? 'Resume BioLoom video' : 'Play BioLoom video');
}
overviewVideo.addEventListener('seeked', () => {
  if (overviewVideo.paused && !overviewVideo.ended && overviewVideo.currentTime < overviewVideo.duration) {
    playOverview();
  }
});
overviewPlay.addEventListener('click', () => {
  overviewVideo.focus({ preventScroll: true });
  playOverview();
});
for (const event of ['play', 'pause', 'ended']) {
  overviewVideo.addEventListener(event, syncOverviewButton);
}
syncOverviewButton();
document.querySelector('.actions a[href="#video"]').addEventListener('click', event => {
  if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) playOverview();
});

const demoFigurePath = index => `assets/retrieval/demo-1000/${String(index).padStart(4, '0')}.webp`;

const player = document.querySelector('.method-player');
const stages = {
  figure: 'Browse the whole-figure gallery.',
  selected: 'Selected the tube formation figure. The full original caption is linked alongside it.',
  exact: 'Panel i shows tube formation. Its own caption is an exact match.',
  related: 'Text to image. The chart caption adds capillary branch counts for each experimental group, quantifying the tube formation illustrated in microscopy panel i.',
  learning: 'Learning across relations. Exact pairs and sibling captions provide complementary training signals.',
};
const stageOrder = Object.keys(stages);
const stageButtons = [...player.querySelectorAll('[data-step-button]')];
const stageAnnouncement = player.querySelector('.stage-announcement');
const playButton = player.querySelector('[data-play]');
const figureGrid = player.querySelector('.figure-gallery-grid');
// Indices of BioLoomBench images with at least two annotated panels.
const wholeFigureIndices = [
  0, 54, 109, 162, 216, 271, 324, 376, 429, 482, 535, 589, 641, 697, 747,
  1, 55, 110, 163, 217, 275, 325, 377, 430, 483, 536, 591, 642, 698, 749,
  4, 56, 113, 166, 218, 278, 326, 379, 431, 484, 537, 592, 643, 701, 750,
  6, 57, 114, 167, 219, 281, 327, 382, 432, 485, 540, 593, 645, 702, 752,
  7, 58, 116, 171, 220, 283, 328, 384, 433, 486, 541, 594, 646, 703, 753,
  8, 59, 119, 172, 221, 290, 330, 385, 434, 487, 542, 595, 647, 705, 754,
  9, 60, 121, 174, 223, 293, 332, 386, 435,
];
for (const index of wholeFigureIndices) {
  const { domain, short } = retrievalData.rows[index];
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.figure = '';
  button.setAttribute('aria-label', `Preview ${domain.toLowerCase()} figure ${index + 1}`);
  button.setAttribute('aria-pressed', 'false');
  const image = document.createElement('img');
  image.loading = 'lazy';
  image.src = demoFigurePath(index);
  image.alt = short;
  button.append(image);
  figureGrid.append(button);
}
const pairingExample = figureGrid.querySelector('[data-figure="example"]');
figureGrid.insertBefore(pairingExample, figureGrid.children[4]);
const figureButtons = [...figureGrid.querySelectorAll('[data-figure]')];
player.querySelector('.figure-gallery-count').textContent = figureButtons.length;
for (const [index, tile] of figureButtons.slice(0, 36).entries()) {
  tile.style.setProperty('--tile-delay', `${Math.min(index, 24) * 18}ms`);
}
const selectedImage = player.querySelector('.source-image img');
const figureContext = player.querySelector('.figure-context');
const pairedPanels = player.querySelector('.paired-panels');
const learningSummary = document.getElementById('learning-summary');
let timer;
let figureFlight;
let galleryCue;
const methodMotion = matchMedia('(prefers-reduced-motion: reduce)');

function revealGalleryChoice(figure) {
  const gallery = figureGrid.getBoundingClientRect();
  const choice = figure.getBoundingClientRect();
  if (choice.top < gallery.top) figureGrid.scrollTop += choice.top - gallery.top - 4;
  if (choice.bottom > gallery.bottom) figureGrid.scrollTop += choice.bottom - gallery.bottom + 4;
}

function flyToSelectedFigure(thumbnail, start) {
  const end = selectedImage.getBoundingClientRect();
  if (![start, end].every(rect => rect.width > 0 && rect.height > 0) ||
      methodMotion.matches) return;
  const movingImage = document.createElement('img');
  movingImage.src = thumbnail.src;
  movingImage.alt = '';
  movingImage.className = 'figure-flight';
  document.body.append(movingImage);
  selectedImage.classList.add('figure-in-flight');
  const pageX = scrollX;
  const pageY = scrollY;
  const animation = movingImage.animate(
    [start, end].map(({ left, top, width, height }) => ({
      left: `${left + pageX}px`, top: `${top + pageY}px`,
      width: `${width}px`, height: `${height}px`,
    })),
    { duration: 820, easing: 'cubic-bezier(.24,.72,.26,1)', fill: 'both' },
  );
  figureFlight = animation;
  function finish() {
    movingImage.remove();
    if (figureFlight === animation) {
      selectedImage.classList.remove('figure-in-flight');
      figureFlight = undefined;
      if (animation.playState === 'finished' && matchMedia('(max-width: 680px)').matches &&
          selectedImage.getBoundingClientRect().bottom > innerHeight) {
        selectedImage.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }
  animation.onfinish = finish;
  animation.oncancel = finish;
}

function cueGallery(isPlaying) {
  player.removeAttribute('data-gallery-enter');
  requestAnimationFrame(() => {
    if (player.dataset.step === 'figure') player.setAttribute('data-gallery-enter', '');
  });
  if (isPlaying && !methodMotion.matches) {
    galleryCue = setTimeout(() => {
      if (player.dataset.step !== 'figure') return;
      revealGalleryChoice(pairingExample);
      pairingExample.classList.add('figure-gallery-target');
    }, 2600);
  }
}

function showStage(key, figure = pairingExample) {
  clearTimeout(galleryCue);
  player.removeAttribute('data-gallery-enter');
  const preview = figure !== pairingExample;
  const thumbnail = figure.querySelector('img');
  figureFlight?.cancel();
  const selecting = key === 'selected';
  if (selecting && !preview) revealGalleryChoice(figure);
  const origin = selecting ? thumbnail.getBoundingClientRect() : null;
  pairingExample.classList.remove('figure-gallery-target');
  player.dataset.step = key;
  player.toggleAttribute('data-show-sibling', key === 'related' || key === 'learning');
  learningSummary.hidden = key !== 'learning';
  if (key === 'figure') {
    figureGrid.scrollTop = 0;
    cueGallery(player.classList.contains('is-playing'));
  }
  player.toggleAttribute('data-preview', preview);
  figureContext.hidden = key === 'figure';
  pairedPanels.hidden = key === 'figure' || key === 'selected';
  if (selectedImage.getAttribute('src') !== thumbnail.getAttribute('src')) {
    selectedImage.src = thumbnail.getAttribute('src');
    selectedImage.alt = thumbnail.alt;
  }
  for (const button of figureButtons) {
    button.setAttribute('aria-pressed', key !== 'figure' && button === figure);
  }
  if (selecting) {
    revealGalleryChoice(figure);
    flyToSelectedFigure(thumbnail, origin);
  }
  if (key === 'learning') {
    const bounds = player.getBoundingClientRect();
    if (bounds.top < innerHeight && bounds.bottom > 0) {
      learningSummary.scrollIntoView({ block: 'nearest', behavior: methodMotion.matches ? 'instant' : 'smooth' });
    }
  }
  stageAnnouncement.textContent = preview ? `Example figure. ${thumbnail.alt}` : stages[key];
  requestAnimationFrame(drawMethodConnections);
  for (const button of stageButtons) {
    button.setAttribute('aria-pressed', button.dataset.stepButton === key);
  }
}

function stopAnimation() {
  window.clearInterval(timer);
  clearTimeout(galleryCue);
  pairingExample.classList.remove('figure-gallery-target');
  timer = undefined;
  player.classList.remove('is-playing');
  playButton.textContent = 'Play animation';
  playButton.setAttribute('aria-pressed', 'false');
}

for (const button of stageButtons.concat([...player.querySelectorAll('[data-crop-step]')])) {
  button.addEventListener('click', () => {
    stopAnimation();
    showStage(button.dataset.stepButton ?? button.dataset.cropStep);
  });
}

for (const button of figureButtons) {
  button.addEventListener('click', () => {
    stopAnimation();
    showStage('selected', button);
  });
}

playButton.addEventListener('click', () => {
  if (timer !== undefined) {
    stopAnimation();
    return;
  }
  let index = 0;
  player.classList.add('is-playing');
  showStage(stageOrder[index]);
  playButton.textContent = 'Pause animation';
  playButton.setAttribute('aria-pressed', 'true');
  timer = window.setInterval(() => {
    index += 1;
    if (index === stageOrder.length) {
      stopAnimation();
      return;
    }
    showStage(stageOrder[index]);
  }, 3400);
});

const galleryObserver = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;
  if (player.dataset.step === 'figure' && !player.classList.contains('is-playing')) cueGallery(false);
  galleryObserver.disconnect();
}, { threshold: .1 });
galleryObserver.observe(figureGrid);

const resultButtons = [...document.querySelectorAll('.tables-nav button')];
function showTable(id) {
  for (const button of resultButtons) {
    const target = button.getAttribute('aria-controls');
    const active = target === id;
    button.setAttribute('aria-pressed', active);
    document.getElementById(target).hidden = !active;
  }
}
for (const button of resultButtons) {
  button.addEventListener('click', () => showTable(button.getAttribute('aria-controls')));
}

function useResultHash() {
  const id = window.location.hash.slice(1);
  if (resultButtons.some(button => button.getAttribute('aria-controls') === id)) {
    showTable(id);
    document.getElementById(id).scrollIntoView();
  }
}
showTable('classification-results');
useResultHash();
window.addEventListener('hashchange', useResultHash);

const copyButton = document.querySelector('[data-copy]');
const bibtex = document.querySelector('#bibtex code');
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(bibtex.textContent);
    copyButton.textContent = 'Copied';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(bibtex);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyButton.textContent = 'BibTeX selected';
  }
});

const methodStage = player.querySelector('.player-stage');
const methodConnections = player.querySelector('.method-connections');
const exactLink = methodConnections.querySelector('.link-exact');
const relatedLink = methodConnections.querySelector('.link-related');
const contextLink = methodConnections.querySelector('.link-context');
const contextArrow = methodConnections.querySelector('.link-context-arrow');
const contextLabel = methodConnections.querySelector('.link-context-label');
const sourceImage = player.querySelector('.source-image');
const microFrame = player.querySelector('.frame-micro');
const chartFrame = player.querySelector('.frame-chart');
const microscopyCard = player.querySelector('.microscopy');
const chartCard = player.querySelector('.chart');
const chartCaption = chartCard.querySelector('.panel-text');
const anchorImage = microscopyCard.querySelector('.micro-image');

function drawMethodConnections() {
  const area = methodStage.getBoundingClientRect();
  methodConnections.setAttribute('viewBox', `0 0 ${area.width} ${area.height}`);
  if (pairedPanels.hidden) return;
  for (const [path, frame, card] of [[exactLink, microFrame, microscopyCard], [relatedLink, chartFrame, chartCard]]) {
    const origin = frame.getBoundingClientRect();
    const target = card.getBoundingClientRect();
    const x1 = origin.left + origin.width / 2 - area.left;
    const y1 = origin.bottom - area.top;
    const x2 = target.left + target.width / 2 - area.left;
    const y2 = target.top - area.top;
    const bend = y1 + (y2 - y1) * .62;
    path.setAttribute('d', `M${x1} ${y1} C${x1} ${bend} ${x2} ${bend} ${x2} ${y2}`);
  }
  const caption = chartCaption.getBoundingClientRect();
  const image = anchorImage.getBoundingClientRect();
  const fromX = caption.left + caption.width / 2 - area.left;
  const fromY = caption.bottom - area.top;
  const toX = image.left + image.width / 2 - area.left;
  const toY = image.top - area.top;
  const midY = (fromY + toY) / 2;
  const turn = 7;
  contextLink.setAttribute('d', `M${fromX} ${fromY} V${midY - turn} Q${fromX} ${midY} ${fromX - turn} ${midY} H${toX + turn} Q${toX} ${midY} ${toX} ${midY + turn} V${toY}`);
  contextArrow.setAttribute('d', `M${toX - 4} ${toY - 6} L${toX} ${toY} L${toX + 4} ${toY - 6}`);
  contextLabel.setAttribute('x', (fromX + toX) / 2);
  contextLabel.setAttribute('y', midY - 5);
}
const methodObserver = new ResizeObserver(drawMethodConnections);
for (const element of [methodStage, sourceImage, microscopyCard, chartCard]) {
  methodObserver.observe(element);
}

function animateDatasetCount(card) {
  const number = card.querySelector('[data-count]');
  if (!number || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const goal = Number(number.dataset.count);
  const decimalPlaces = number.dataset.count.split('.')[1]?.length ?? 0;
  const format = new Intl.NumberFormat('en-US', { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces });
  const started = performance.now();
  function update(now) {
    const progress = Math.min(Math.max((now - started) / 740, 0), 1);
    number.textContent = format.format(goal * (1 - (1 - progress) ** 3));
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const revealObserver = new IntersectionObserver((entries, observer) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      if (entry.target.matches('.dataset-item')) animateDatasetCount(entry.target);
      observer.unobserve(entry.target);
    }
  }
}, { threshold: .3 });
for (const card of document.querySelectorAll('.metric-card, .method-points article, .dataset-item')) revealObserver.observe(card);

const demo = document.querySelector('.retrieval-demo');
try {
  initRetrievalDemo(demo, retrievalData);
} catch (error) {
  demo.querySelector('[data-search-play]').textContent = 'Search unavailable';
  demo.querySelector('[data-search-feedback]').textContent = 'The demo could not load. Reload the page to try again.';
  console.error('Retrieval demo initialization failed', error);
}

function initRetrievalDemo(demo, data) {
  const { rows, models, examples } = data;
  const datasetPicker = demo.querySelector('#search-dataset');
  const casePicker = demo.querySelector('#search-case');
  const captionField = demo.querySelector('[data-search-caption-field]');
  const captionPicker = captionField.querySelector('select');
  const query = demo.querySelector('[data-search-query]');
  const expandQuery = demo.querySelector('[data-search-expand]');
  const playSearch = demo.querySelector('[data-search-play]');
  const scope = demo.querySelector('[data-search-scope]');
  const stage = demo.querySelector('.search-stage');
  const grid = demo.querySelector('.search-grid');
  const modelName = demo.querySelector('[data-search-model]');
  const modelStep = demo.querySelector('[data-search-step]');
  const resultImage = demo.querySelector('[data-search-image]');
  const feedback = demo.querySelector('[data-search-feedback]');
  const sourceLink = demo.querySelector('[data-search-source]');
  const verdict = demo.querySelector('[data-search-verdict]');
  const searchStatus = demo.querySelector('[data-search-status]');
  const modelNav = demo.querySelector('.search-models');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const scanDuration = 1260;
  let currentCase;
  let availableExamples;
  let searchTimer;
  let scrollFrame;
  let playback;

  scope.textContent = 'BioLoomBench + BioMedFlickr · Demo subset';
  for (const dataset of Object.keys(examples)) {
    datasetPicker.add(new Option(dataset, dataset));
  }

  grid.replaceChildren(...rows.map((_, index) => {
    const tile = document.createElement('div');
    tile.className = 'search-tile';
    tile.setAttribute('aria-hidden', 'true');
    tile.style.setProperty('--sprite-x', `${index % 25 / 24 * 100}%`);
    tile.style.setProperty('--sprite-y', `${Math.floor(index / 25) / 39 * 100}%`);
    return tile;
  }));
  modelNav.replaceChildren(...models.map((model, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = model.replace(' (DFN-2B)', '');
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => runSearch(index, false));
    return button;
  }));

  function cancelPlaybackTick() {
    clearTimeout(searchTimer);
    cancelAnimationFrame(scrollFrame);
  }

  function resetPlayback() {
    cancelPlaybackTick();
    playback = undefined;
    stage.classList.remove('is-paused');
    playSearch.textContent = '↻ Run search';
  }

  function startPhase(duration, onComplete, tile) {
    playback = { duration, onComplete, tile, elapsed: 0 };
    resumePlayback();
  }

  function resumePlayback() {
    const phase = playback;
    phase.startedAt = performance.now();
    phase.paused = false;
    stage.classList.remove('is-paused');
    playSearch.textContent = 'Ⅱ Pause';
    if (phase.tile && phase.duration) scanGallery(phase);
    searchTimer = setTimeout(phase.onComplete, phase.duration - phase.elapsed);
  }

  function pausePlayback() {
    playback.elapsed = Math.min(playback.duration, playback.elapsed + performance.now() - playback.startedAt);
    playback.paused = true;
    cancelPlaybackTick();
    stage.classList.add('is-paused');
    playSearch.textContent = '▶ Resume search';
    searchStatus.textContent = 'Search paused.';
  }

  function clearResult() {
    stage.dataset.phase = 'ready';
    resultImage.hidden = true;
    feedback.hidden = false;
    feedback.textContent = 'Run search to compare the models.';
    verdict.hidden = true;
    sourceLink.hidden = true;
    grid.querySelector('.search-hit')?.classList.remove('search-hit');
  }

  function selectCase(position) {
    resetPlayback();
    currentCase = availableExamples[position];
    const { index, caption } = currentCase;
    const text = rows[index][caption];
    query.textContent = text;
    expandQuery.hidden = text.length <= 95;
    query.classList.toggle('is-excerpt', !expandQuery.hidden);
    expandQuery.setAttribute('aria-expanded', 'false');
    expandQuery.textContent = 'Full text';
    modelName.textContent = 'Rank 1';
    modelStep.textContent = '';
    searchStatus.textContent = '';
    clearResult();
    for (const button of modelNav.children) {
      button.setAttribute('aria-pressed', 'false');
    }
    grid.scrollTop = 0;
  }

  function setExamples() {
    const dataset = datasetPicker.value;
    captionField.hidden = dataset !== 'BioLoomBench';
    availableExamples = captionField.hidden
      ? examples[dataset]
      : examples[dataset].filter(({ caption }) => caption === captionPicker.value);
    const options = availableExamples.map(({ label }, position) => new Option(`${position + 1}. ${label}`, position));
    casePicker.replaceChildren(...options);
    selectCase(0);
  }

  function galleryScrollTarget(tile) {
    const centered = tile.offsetTop + tile.offsetHeight / 2 - grid.clientHeight / 2;
    return Math.min(grid.scrollHeight - grid.clientHeight, Math.max(0, centered));
  }

  function scanGallery(phase) {
    const end = grid.scrollHeight - grid.clientHeight;
    const target = galleryScrollTarget(phase.tile);
    function scroll(now) {
      const progress = Math.min((phase.elapsed + now - phase.startedAt) / phase.duration, 1);
      if (progress < .73) {
        const sweep = progress / .73;
        grid.scrollTop = end * sweep ** 2 * (3 - 2 * sweep);
      } else {
        const pullback = (progress - .73) / .27;
        grid.scrollTop = target + (end - target) * (1 - pullback) ** 2;
      }
      if (progress < 1) scrollFrame = requestAnimationFrame(scroll);
    }
    scrollFrame = requestAnimationFrame(scroll);
  }

  function runSearch(index, sequence) {
    resetPlayback();
    clearResult();
    for (const [buttonIndex, button] of [...modelNav.children].entries()) {
      button.setAttribute('aria-pressed', buttonIndex === index);
    }
    const model = models[index];
    const [tile, rank] = data[currentCase.caption][currentCase.index][index];
    const card = grid.children[tile];
    modelName.textContent = model;
    modelStep.textContent = `${index + 1} / ${models.length}`;
    resultImage.src = demoFigurePath(tile);
    resultImage.alt = `Rank 1 result from ${model}`;
    grid.scrollTop = 0;
    grid.getBoundingClientRect();
    stage.dataset.phase = 'scanning';
    feedback.textContent = `Searching with ${model}…`;
    searchStatus.textContent = `Searching with ${model}.`;
    startPhase(reducedMotion.matches ? 0 : scanDuration, () => {
      const match = rank === 1;
      cancelAnimationFrame(scrollFrame);
      grid.scrollTop = galleryScrollTarget(card);
      card.classList.add('search-hit');
      stage.dataset.phase = match ? 'match' : 'miss';
      resultImage.hidden = false;
      feedback.hidden = true;
      if (resultImage.complete && !resultImage.naturalWidth) showImageError();
      if (rows[tile].source) {
        sourceLink.href = rows[tile].source;
        sourceLink.hidden = false;
      }
      verdict.textContent = match ? '✓ Match at rank 1' : `× Paired figure at rank ${rank}`;
      verdict.hidden = false;
      searchStatus.textContent = `${model}: ${verdict.textContent}.`;
      if (sequence && index + 1 < models.length) {
        startPhase(980, () => runSearch(index + 1, true));
      } else {
        resetPlayback();
      }
    }, card);
  }

  function showImageError() {
    resultImage.hidden = true;
    feedback.hidden = false;
    feedback.textContent = 'The result image could not load.';
  }
  resultImage.addEventListener('error', () => {
    if (!resultImage.hidden) showImageError();
  });

  datasetPicker.addEventListener('change', setExamples);
  captionPicker.addEventListener('change', setExamples);
  casePicker.addEventListener('change', () => {
    selectCase(Number(casePicker.value));
    runSearch(0, true);
  });
  expandQuery.addEventListener('click', () => {
    const expanded = expandQuery.getAttribute('aria-expanded') === 'true';
    query.classList.toggle('is-excerpt', expanded);
    expandQuery.setAttribute('aria-expanded', String(!expanded));
    expandQuery.textContent = expanded ? 'Full text' : 'Show less';
  });
  playSearch.addEventListener('click', () => {
    if (!playback) {
      runSearch(0, true);
    } else if (playback.paused) {
      resumePlayback();
    } else {
      pausePlayback();
    }
  });
  setExamples();
  playSearch.textContent = '▶ Run search';
  playSearch.disabled = false;
}
