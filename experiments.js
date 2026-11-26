const experiments = {
  probe: {
    base: 'paper-linear-probe-base.webp',
    revealStart: '15%',
    takeaway: 'BioLoom (Scratch) reaches 84.45% mean accuracy and 72.20% mean Macro-F1.',
    summary: 'Frozen visual features · Mean across 12 MedMNIST 2D datasets',
    image: 'paper-linear-probe.webp',
    width: 1500,
    height: 1224,
    alt: 'Paper scatter plot of mean test accuracy and Macro-F1 for 15 vision encoders on MedMNIST. BioLoom Scratch scores 84.45% accuracy and 72.20% Macro-F1.',
  },
  size: {
    base: 'paper-scaling-model-size-base.webp',
    revealStart: '19%',
    takeaway: 'All three metrics peak at ViT-L/14 and dip at ViT-H/14.',
    summary: 'ViT-S/14 through ViT-H/14 · Random vision initialization',
    image: 'paper-scaling-model-size.webp?v=title-1',
    width: 1268,
    height: 1068,
    alt: 'ViT-L/14 leads model scaling on all three measures, with 52.89% zero-shot accuracy, 8.42% BioMedFlickr mean R@1, and 57.13% BioLoomBench mean R@1.',
  },
  scale: {
    base: 'paper-scaling-data-scale-base.webp',
    revealStart: '19%',
    takeaway: 'All three metrics rise as the number of training pairs increases.',
    summary: 'Training pairs · 1M to 52.4M',
    image: 'paper-scaling-data-scale.webp?v=title-1',
    width: 1252,
    height: 1068,
    alt: 'Zero-shot accuracy and mean R@1 on both retrieval benchmarks increase from 1 million to 52.4 million training pairs.',
  },
  epochs: {
    base: 'paper-scaling-training-epochs-base.webp',
    revealStart: '19%',
    takeaway: 'Zero-shot accuracy is highest at 10 epochs, and both retrieval scores are highest at 25 epochs among the runs shown.',
    summary: 'Training epochs · The 25-epoch point uses a different training setup',
    image: 'paper-scaling-training-epochs.webp?v=title-1',
    width: 1256,
    height: 1068,
    alt: 'Zero-shot accuracy is highest at 10 epochs. BioMedFlickr and BioLoomBench mean R@1 are highest at 25 epochs among the runs shown.',
  },
};

// Canonical publication links used by both the interactive linear-probing
// figure and the result tables. Keep longer names before their parent model.
const modelPapers = new Map([
  ['OpenCLIP (CommonPool)', 'https://arxiv.org/abs/2304.14108'],
  ['CLIP (DFN-2B)', 'https://proceedings.iclr.cc/paper_files/paper/2024/hash/9bf0810a4a1597a36d27ceea58667d92-Abstract-Conference.html'],
  ['ImageNet-21k', 'https://arxiv.org/abs/2010.11929'],
  ['ImageNet-1k', 'https://openaccess.thecvf.com/content_cvpr_2016/html/He_Deep_Residual_Learning_CVPR_2016_paper.html'],
  ['BMC-LongCLIP', 'https://openreview.net/forum?id=jq8Z36zalg'],
  ['BMC-CLIP-CF', 'https://openaccess.thecvf.com/content/CVPR2025/html/Lozano_BIOMEDICA_An_Open_Biomedical_Image-Caption_Archive_Dataset_and_Vision-Language_Models_CVPR_2025_paper.html'],
  ['MedPMC-CLIP', 'https://arxiv.org/abs/2607.07673'],
  ['Panel2Patch', 'https://openaccess.thecvf.com/content/CVPR2026/html/Yuan_From_Panel_to_Pixel_Zoom-In_Vision-Language_Pretraining_from_Biomedical_Scientific_CVPR_2026_paper.html'],
  ['BiomedCLIP', 'https://ai.nejm.org/doi/10.1056/AIoa2400640'],
  ['PMC-CLIP', 'https://doi.org/10.1007/978-3-031-43993-3_51'],
  ['MedSigLIP', 'https://developers.google.com/health-ai-developer-foundations/medsiglip/model-card'],
  ['OpenCLIP', 'https://openaccess.thecvf.com/content/CVPR2023/html/Cherti_Reproducible_Scaling_Laws_for_Contrastive_Language-Image_Learning_CVPR_2023_paper.html'],
  ['DINOv2', 'https://openreview.net/forum?id=a68SUt6zFt'],
  ['EVA-02', 'https://doi.org/10.1016/j.imavis.2024.105171'],
  ['MetaCLIP', 'https://proceedings.iclr.cc/paper_files/paper/2024/hash/d1450d6c10c6b6cf1b80964357f5fa08-Abstract-Conference.html'],
  ['SigLIP2', 'https://arxiv.org/abs/2502.14786'],
  ['SigLIP', 'https://openaccess.thecvf.com/content/ICCV2023/html/Zhai_Sigmoid_Loss_for_Language_Image_Pre-Training_ICCV_2023_paper.html'],
  ['Phikon-v2', 'https://arxiv.org/abs/2409.09173'],
  ['RetCCL', 'https://doi.org/10.1016/j.media.2022.102645'],
  ['EVA-CLIP', 'https://arxiv.org/abs/2303.15389'],
  ['CoCa', 'https://openreview.net/forum?id=Ee277P3AYC'],
  ['BioLoom', '#citation'],
]);

function modelPaperFor(label) {
  return [...modelPapers].find(([name]) => label.startsWith(name));
}

function externalLinkAttributes(url) {
  return url.startsWith('#') ? '' : ' target="_blank" rel="noopener noreferrer"';
}

// Vector coordinates mapped from the figures used by the website.
const plotGeometry = {
  probe: [
    {"label": "BioLoom (Scratch) · ViT-L/14", "color": "#d99442", "points": [[1251.6, 118.8]], "legend": [872.2, 520.3, 599.6, 34.0]},
    {"label": "ImageNet-21k · ViT-L/16", "color": "#71834c", "points": [[1271.9, 126.7]], "legend": [872.2, 557.3, 599.6, 34.0]},
    {"label": "DINOv2 · ViT-L/14", "color": "#4477aa", "points": [[983.5, 318.0]], "legend": [872.2, 591.9, 599.6, 34.0]},
    {"label": "PMC-CLIP · ResNet-50", "color": "#339988", "points": [[995.5, 357.9]], "legend": [872.2, 626.4, 599.6, 34.0]},
    {"label": "CLIP (DFN-2B) · ViT-L/14", "color": "#aa4499", "points": [[837.3, 476.6]], "legend": [872.2, 660.9, 599.6, 34.0]},
    {"label": "EVA-02 · ViT-L/14", "color": "#6688bb", "points": [[757.5, 532.1]], "legend": [872.2, 695.4, 599.6, 34.0]},
    {"label": "MetaCLIP · ViT-L/14", "color": "#cc6677", "points": [[666.2, 558.5]], "legend": [872.2, 729.9, 599.6, 34.0]},
    {"label": "SigLIP · ViT-L/16", "color": "#9977bb", "points": [[641.9, 577.3]], "legend": [872.2, 764.4, 599.6, 34.0]},
    {"label": "Phikon-v2 · ViT-L", "color": "#66aa99", "points": [[777.6, 599.2]], "legend": [872.2, 797.3, 599.6, 34.0]},
    {"label": "ImageNet-1k · ResNet-50", "color": "#887744", "points": [[621.2, 631.6]], "legend": [872.2, 833.5, 599.6, 34.0]},
    {"label": "OpenCLIP (CommonPool) · ViT-L/14", "color": "#44aacc", "points": [[649.7, 704.7]], "legend": [872.2, 868.1, 599.6, 34.0]},
    {"label": "SigLIP2 · ViT-L/16", "color": "#bb6677", "points": [[462.5, 766.2]], "legend": [872.2, 902.6, 599.6, 34.0]},
    {"label": "RetCCL · ResNet-50", "color": "#779955", "points": [[389.8, 825.4]], "legend": [872.2, 937.2, 599.6, 34.0]},
    {"label": "EVA-CLIP · ViT-L/14", "color": "#665599", "points": [[347.0, 873.7]], "legend": [872.2, 971.7, 599.6, 34.0]},
    {"label": "CoCa · ViT-L/14", "color": "#bb8866", "points": [[276.7, 957.9]], "legend": [872.2, 1006.1, 599.6, 34.0]},
  ],
  size: [
    {"points": [[318.7, 621.5], [544.7, 594.5], [770.8, 513.4], [996.9, 576.2]]},
    {"points": [[318.7, 757.5], [544.7, 726.5], [770.8, 277.6], [996.9, 378.1]]},
    {"points": [[318.7, 762.5], [544.7, 634.2], [770.8, 288.7], [996.9, 356.0]]},
  ],
  scale: [
    {"points": [[300.9, 538.4], [592.1, 443.2], [717.5, 397.9], [883.3, 314.5], [1017.2, 274.9]]},
    {"points": [[300.9, 845.8], [592.1, 745.4], [717.5, 678.9], [883.3, 513.8], [1017.2, 378.8]]},
    {"points": [[300.9, 845.1], [592.1, 700.3], [717.5, 530.3], [883.3, 333.7], [1017.2, 226.5]]},
  ],
  epochs: [
    {"points": [[309.8, 354.3], [549.1, 301.7], [660.3, 291.2], [811.3, 274.9], [1010.8, 307.5]]},
    {"points": [[309.8, 596.4], [549.1, 485.7], [660.3, 456.0], [811.3, 378.8], [1010.8, 317.2]]},
    {"points": [[309.8, 491.2], [549.1, 326.9], [660.3, 281.8], [811.3, 226.5], [1010.8, 215.0]]},
  ],
};

const scalingMetrics = [
  { label: 'Zero-shot classification · Mean accuracy', image: 'classification', width: 1176, color: '#3388cc' },
  { label: 'BioMedFlickr · Mean R@1', image: 'flickr', width: 936, color: '#a06bc0' },
  { label: 'BioLoomBench · Mean R@1', image: 'bioloom', width: 992, color: '#e18b55' },
];

const scalingKey = `<figcaption class="paper-scaling-key">
  ${scalingMetrics.map(({ label, image, width, color }, index) => `
    <button type="button" data-plot-legend="${index}" aria-pressed="false" style="--series-color: ${color}">
      <img src="assets/paper-scaling-key-${image}.webp" width="${width}" height="120" alt="${label}">
    </button>`).join('')}
</figcaption>`;

function plotOverlay(key, width, height) {
  const series = plotGeometry[key];
  const outlines = series.map(({ points }, index) => {
    const color = series[index].color ?? scalingMetrics[index].color;
    const trace = points.length > 1 ? `<polyline points="${points.map(point => point.join(',')).join(' ')}"/>` : '';
    const markers = points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="18"/>`).join('');
    return `<g data-plot-highlight="${index}" style="--series-color: ${color}">${trace}${markers}</g>`;
  });
  const legend = key === 'probe' ? series.map(({label, color, legend: [x, y, w, h]}, index) => {
    const match = modelPaperFor(label);
    if (!match) return '';
    const [, url] = match;
    return `<a class="probe-legend-hit" data-plot-legend="${index}" href="${url}"${externalLinkAttributes(url)}
      aria-label="Open the publication for ${label}"
      style="--series-color: ${color}; left: ${x/width*100}%; top: ${(y-h/2)/height*100}%; width: ${w/width*100}%; height: ${h/height*100}%"></a>`;
  }).join('') : '';
  return `<svg class="experiment-plot-overlay" viewBox="0 0 ${width} ${height}" aria-hidden="true">${outlines.join('')}</svg>${legend}`;
}

function distanceToSegment(x, y, [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const position = Math.min(1, Math.max(0, ((x-ax)*dx + (y-ay)*dy) / (dx*dx+dy*dy)));
  return Math.hypot(x-ax-position*dx, y-ay-position*dy);
}

function nearbySeries(series, x, y, scale) {
  let nearest = -1;
  let distance = 10/scale;
  // Prefer the nearest marker when a marker and a neighboring curve overlap.
  series.forEach(({ points }, index) => {
    const test = Math.min(...points.map(([px, py]) => Math.hypot(x-px, y-py)));
    if (test < distance) {
      nearest = index;
      distance = test;
    }
  });
  if (nearest !== -1) return nearest;
  distance = 8/scale;
  series.forEach(({ points }, index) => {
    for (let i = 1; i < points.length; i += 1) {
      const test = distanceToSegment(x, y, points[i-1], points[i]);
      if (test < distance) {
        nearest = index;
        distance = test;
      }
    }
  });
  return nearest;
}

function connectPlotInteractions(key, width, height) {
  const pane = experimentView.querySelector('.experiment-pane');
  const plot = pane.querySelector('.experiment-plot');
  const legend = [...pane.querySelectorAll('[data-plot-legend]')];
  const overlays = [...plot.querySelectorAll('[data-plot-highlight]')];
  const announcement = pane.querySelector('.experiment-selection');
  let active = -1;

  function select(index) {
    active = index === active ? -1 : index;
    if (active !== -1 && pane.hasAttribute('data-plot-state')) pane.dataset.plotState = 'complete';
    legend.forEach((control, i) => {
      if (control.matches('button')) control.setAttribute('aria-pressed', i === active);
      control.classList.toggle('is-selected', i === active);
    });
    overlays.forEach((mark, i) => mark.classList.toggle('is-selected', i === active));
    const selected = plotGeometry[key][active];
    announcement.textContent = selected ? `Highlighted ${selected.label ?? scalingMetrics[active].label}.` : '';
  }

  legend.forEach((control, index) => {
    if (control.matches('button')) control.addEventListener('click', () => select(index));
  });
  const hit = event => {
    const box = plot.getBoundingClientRect();
    return nearbySeries(
      plotGeometry[key], (event.clientX-box.left)*width/box.width, (event.clientY-box.top)*height/box.height, box.width/width,
    );
  };
  plot.addEventListener('pointermove', event => plot.classList.toggle('has-hit', hit(event) !== -1));
  plot.addEventListener('click', event => {
    if (!event.target.closest('[data-plot-legend]')) select(hit(event));
  });
  pane.addEventListener('keydown', event => {
    if (event.key === 'Escape') select(-1);
  });
}

const experimentView = document.getElementById('experiment-view');
const experimentButtons = [...document.querySelectorAll('[data-experiment]')];
const plotMotion = matchMedia('(prefers-reduced-motion: reduce)');
const plotObserver = new IntersectionObserver((entries, observer) => {
  for (const { target, isIntersecting } of entries) {
    if (!isIntersecting) continue;
    observer.unobserve(target);
    const pane = target.closest('.experiment-pane');
    const images = [...target.querySelectorAll('img')];
    Promise.all(images.map(image => image.decode())).then(() => {
      if (pane.dataset.plotState === 'ready') pane.dataset.plotState = 'playing';
    }).catch(() => {
      delete pane.dataset.plotState;
    });
  }
}, { threshold: .15 });

function showExperiment(key) {
  plotObserver.disconnect();
  const { summary, image, base, width, height, alt, takeaway, revealStart } = experiments[key];
  const animated = !plotMotion.matches;
  experimentView.innerHTML = `<div class="experiment-pane" ${animated ? 'data-plot-state="ready"' : ''}>
    <p class="experiment-summary">${summary}</p>
    ${key === 'probe' ? '<p class="experiment-link-hint">Select a method name in the legend to open its publication.</p>' : ''}
    <figure class="experiment-paper-figure">
      <div class="experiment-plot" style="--plot-start: ${revealStart}">
        ${animated ? `<img class="experiment-plot-base" src="assets/${base}" width="${width}" height="${height}" alt="" aria-hidden="true">` : ''}
        <img class="experiment-paper-panel" src="assets/${image}" width="${width}" height="${height}" alt="${alt}">
        ${plotOverlay(key, width, height)}
      </div>
      ${key === 'probe' ? '' : scalingKey}
    </figure>
    <span class="sr-only experiment-selection" role="status"></span>
    <div class="experiment-reading">
      <p>${takeaway}</p>
      ${animated ? '<button class="experiment-replay" type="button">Replay animation</button>' : ''}
    </div>
  </div>`;
  for (const button of experimentButtons) {
    button.setAttribute('aria-pressed', button.dataset.experiment === key);
  }
  connectPlotInteractions(key, width, height);
  if (animated) {
    plotObserver.observe(experimentView.querySelector('.experiment-plot'));
    experimentView.querySelector('.experiment-replay').addEventListener('click', () => {
      showExperiment(key);
      experimentView.querySelector('.experiment-replay')?.focus({ preventScroll: true });
    });
  }
}

function linkResultTableModels() {
  document.querySelectorAll('.paper-results-table tbody th[scope="row"]').forEach(cell => {
    if (cell.querySelector('a')) return;
    const match = modelPaperFor(cell.textContent.trim().replace(/^◆\s*/, ''));
    if (!match) return;
    const [name, url] = match;
    const link = document.createElement('a');
    link.className = 'model-paper-link';
    link.href = url;
    link.setAttribute('aria-label', `${name}: open publication`);
    if (!url.startsWith('#')) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    while (cell.firstChild) link.appendChild(cell.firstChild);
    cell.appendChild(link);
  });
}

for (const button of experimentButtons) {
  button.addEventListener('click', () => showExperiment(button.dataset.experiment));
}
plotMotion.addEventListener('change', () => showExperiment(experimentButtons.find(
  button => button.getAttribute('aria-pressed') === 'true',
).dataset.experiment));
showExperiment('probe');
linkResultTableModels();
