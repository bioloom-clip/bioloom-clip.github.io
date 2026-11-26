const demoTabs = [...document.querySelectorAll('[data-demo-tab]')];
const demoPanels = [...document.querySelectorAll('[data-demo-panel]')];

function activateDemo(id, updateHash = false) {
  for (const tab of demoTabs) tab.setAttribute('aria-selected', String(tab.dataset.demoTab === id));
  for (const panel of demoPanels) panel.hidden = panel.id !== id;
  if (updateHash) history.replaceState(null, '', `#${id}`);
}

for (const tab of demoTabs) tab.addEventListener('click', () => activateDemo(tab.dataset.demoTab, true));
if (location.hash === '#classification-demo') activateDemo('classification-demo');
window.addEventListener('hashchange', () => {
  if (location.hash === '#classification-demo' || location.hash === '#retrieval-demo') activateDemo(location.hash.slice(1));
});

const classificationDemo = document.querySelector('.classification-demo');
if (classificationDemo) {
  fetch('assets/classification/cases.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(cases => initClassificationDemo(classificationDemo, cases))
    .catch(() => {
      classificationDemo.querySelector('[data-classification-predictions]').innerHTML =
        '<p class="classification-load-error">The qualitative examples could not be loaded.</p>';
    });
}

function initClassificationDemo(demo, cases) {
  const image = demo.querySelector('[data-classification-image]');
  const imageFrame = image.closest('.classification-image-frame');
  const resolution = demo.querySelector('[data-classification-resolution]');
  const imagePool = demo.querySelector('[data-classification-image-pool]');
  const domain = demo.querySelector('[data-classification-domain]');
  const dataset = demo.querySelector('[data-classification-dataset]');
  const truth = demo.querySelector('[data-classification-truth]');
  const count = demo.querySelector('[data-classification-count]');
  const predictions = demo.querySelector('[data-classification-predictions]');
  const caseStrip = demo.querySelector('[data-classification-cases]');
  const domainStrip = demo.querySelector('[data-classification-domains]');
  const nextButton = demo.querySelector('[data-classification-next]');
  const replayButton = demo.querySelector('[data-classification-replay]');
  const phase = demo.querySelector('[data-classification-phase]');
  const status = demo.querySelector('[data-classification-status]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let activeDomain = cases[0].domain;
  let caseButtons = [];
  let phaseTimers = [];

  const domains = [...new Set(cases.map(item => item.domain))];
  const domainButtons = domains.map(domainName => {
    const domainCases = cases.filter(item => item.domain === domainName);
    const button = document.createElement('button');
    button.type = 'button';
    button.role = 'tab';
    button.setAttribute('aria-selected', 'false');
    button.innerHTML = `<span>${domainName}</span><small>${domainCases.length}</small>`;
    button.addEventListener('click', () => selectDomain(domainName));
    domainStrip.append(button);
    return { button, domainName };
  });

  function visibleIndices() {
    return cases.map((item, index) => item.domain === activeDomain ? index : -1).filter(index => index >= 0);
  }

  function rebuildCaseStrip() {
    caseStrip.replaceChildren();
    caseButtons = visibleIndices().map(index => {
      const item = cases[index];
      const button = document.createElement('button');
      button.type = 'button';
      button.role = 'tab';
      button.setAttribute('aria-selected', 'false');
      button.innerHTML = `
        <img src="${item.image}" alt="" loading="lazy">
        <span><small>${item.dataset}</small><strong>${item.groundTruth}</strong></span>
        <i aria-hidden="true">✓</i>`;
      button.addEventListener('click', () => render(index));
      caseStrip.append(button);
      return { button, index };
    });
  }

  function selectDomain(domainName) {
    activeDomain = domainName;
    for (const item of domainButtons) {
      item.button.setAttribute('aria-selected', String(item.domainName === domainName));
    }
    rebuildCaseStrip();
    render(visibleIndices()[0]);
  }

  function render(index) {
    active = index;
    const item = cases[index];
    image.src = item.image;
    image.alt = `${item.dataset} test image with ground-truth label ${item.groundTruth}`;
    const updateResolutionPresentation = () => {
      const width = item.nativeWidth || image.naturalWidth;
      const height = item.nativeHeight || image.naturalHeight;
      const lowResolution = Math.min(width, height) < 128;
      imageFrame.classList.toggle('is-native-low-resolution', lowResolution);
      imageFrame.style.setProperty('--preview-image', `url("${item.image}")`);
      if (lowResolution) {
        const scale = Math.min(width, height) <= 32 ? 6 : 4;
        imageFrame.style.setProperty('--native-display-width', `${Math.min(width * scale, 260)}px`);
        resolution.textContent = `NATIVE ${width} × ${height}`;
        resolution.hidden = false;
      } else {
        imageFrame.style.removeProperty('--native-display-width');
        resolution.hidden = true;
      }
    };
    if (image.complete) updateResolutionPresentation();
    else image.addEventListener('load', updateResolutionPresentation, { once: true });
    domain.textContent = item.domain;
    dataset.textContent = item.dataset;
    truth.textContent = item.groundTruth;
    count.textContent = `${item.candidateCount} candidate classes`;
    predictions.replaceChildren(...item.predictions.map((result, predictionIndex) => {
      const row = document.createElement('div');
      row.className = `classification-prediction ${result.correct ? 'is-correct' : 'is-wrong'}`;
      row.style.setProperty('--delay', `${predictionIndex * 45}ms`);
      row.style.setProperty('--reveal', `${3.25 + predictionIndex * .18}s`);
      row.innerHTML = `
        <span class="classification-verdict" aria-hidden="true">${result.correct ? '✓' : '×'}</span>
        <span class="classification-prediction-model">${result.model}</span>
        <span class="classification-prediction-label">
          <span class="classification-thinking" aria-hidden="true"><i></i><i></i><i></i><em>scoring classes</em></span>
          <span class="classification-final">${result.prediction}</span>
        </span>
        <strong>${result.correct ? 'Correct' : 'Error'}</strong>`;
      return row;
    }));
    for (const item of caseButtons) {
      item.button.setAttribute('aria-selected', String(item.index === index));
    }
    const sameDatasetCases = cases.filter((candidate, candidateIndex) => candidateIndex !== index && candidate.dataset === item.dataset);
    const sameDomainCases = cases.filter((candidate, candidateIndex) => candidateIndex !== index && candidate.domain === item.domain);
    const poolCandidates = (item.poolImages || []).map(poolImage => ({ image: poolImage }));
    for (const candidate of [...sameDatasetCases, ...sameDomainCases]) {
      if (poolCandidates.length >= 5) break;
      if (!poolCandidates.some(poolItem => poolItem.image === candidate.image)) poolCandidates.push(candidate);
    }
    while (poolCandidates.length < 5) poolCandidates.push({ image: item.image });
    const selectedPosition = index % 6;
    poolCandidates.splice(selectedPosition, 0, item);
    imagePool.innerHTML = `<span>${item.dataset.toUpperCase()} · SAME-DATASET IMAGE POOL</span>${poolCandidates.map(candidate => `
      <i class="${candidate === item ? 'is-selected' : ''}"><img src="${candidate.image}" alt=""><b>${candidate === item ? 'SELECTED' : 'TEST SAMPLE'}</b></i>`).join('')}`;
    const baselineErrors = item.predictions.slice(1).filter(result => !result.correct).length;
    status.textContent = `${item.dataset}. Ground truth: ${item.groundTruth}. BioLoom is correct; ${baselineErrors} of five displayed baselines are incorrect.`;
    runInferenceAnimation();
  }

  function runInferenceAnimation() {
    for (const timer of phaseTimers) clearTimeout(timer);
    phaseTimers = [];
    demo.classList.remove('is-animating', 'is-inference-complete');
    void demo.offsetWidth;
    if (reducedMotion.matches) {
      phase.textContent = 'Prediction complete';
      demo.classList.add('is-inference-complete');
      return;
    }
    demo.classList.add('is-animating');
    const phases = [
      [0, 'Scanning the benchmark image pool'],
      [850, 'Selected image enters the vision encoder'],
      [1550, 'Embedding candidate class prompts'],
      [2300, 'Computing image–text similarities'],
      [3100, 'Ranking predictions across six models'],
      [4400, 'BioLoom matches the ground truth'],
    ];
    for (const [delay, label] of phases) {
      phaseTimers.push(setTimeout(() => { phase.textContent = label; }, delay));
    }
    phaseTimers.push(setTimeout(() => {
      demo.classList.remove('is-animating');
      demo.classList.add('is-inference-complete');
      phase.textContent = 'Prediction complete';
    }, 5300));
  }

  replayButton.addEventListener('click', () => render(active));
  nextButton.addEventListener('click', () => {
    const visible = visibleIndices();
    render(visible[(visible.indexOf(active) + 1) % visible.length]);
  });
  selectDomain(activeDomain);
}
