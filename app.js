// ═══════════════════════════════════════
// STATE
// ═══════════════════════════════════════
let activeBizFilter = 'foot';
let selectedBizIdx = null;
let selectedBizData = null;
let compareSelections = [null, null, null];
let currentRating = 0;
let currentDecision = '';
let feedbackResponses = [];

// MAPS
let siteMap = null;
let siteMarkerLayer = null;
let heatmapMap = null;
let heatmapMarkerLayer = null;

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  initSiteMap();
  renderBizList();
  renderSiteMap();
  populateCompareDropdowns();
  renderCompareTable();
});

// ═══════════════════════════════════════
// PANEL SWITCHING
// ═══════════════════════════════════════
function switchPanel(panel) {
  document.querySelectorAll('.nav-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });

  const tabIdx = { site: 0, heatmap: 1, compare: 2, ai: 3, feedback: 4 };
  document.querySelectorAll('.nav-tab')[tabIdx[panel]].classList.add('active');
  document.getElementById(panel + 'Panel').classList.add('active');

  if (panel === 'heatmap') {
    setTimeout(function() { initHeatmapMap(); }, 100);
  }
  if (panel === 'site' && siteMap) {
    setTimeout(function() { siteMap.invalidateSize(); }, 100);
  }
  if (panel === 'ai') {
    initAIPanel();
  }
}

// ═══════════════════════════════════════
// SITE INTELLIGENCE
// ═══════════════════════════════════════
function initSiteMap() {
  siteMap = L.map('siteMap', { center: [-27.47, 153.025], zoom: 13, zoomControl: false });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO', subdomains: 'abcd', maxZoom: 19
  }).addTo(siteMap);
  L.control.zoom({ position: 'topright' }).addTo(siteMap);
  siteMarkerLayer = L.layerGroup().addTo(siteMap);
}

function setBizFilter(el, filter) {
  document.querySelectorAll('#bizFoot,#bizEV,#bizComm').forEach(function(c) { c.classList.remove('active'); });
  el.classList.add('active');
  activeBizFilter = filter;
  const descs = {
    foot: 'Suburbs ranked by estimated foot traffic based on parking demand and bay capacity',
    ev: 'Suburbs ranked by EV charging suitability — considers bay capacity, long-stay zones and available space',
    comm: 'Suburbs ranked by commercial development potential based on parking rates and occupancy demand'
  };
  const labels = { foot: 'Foot traffic score', ev: 'EV charging suitability', comm: 'Commercial dev score' };
  document.getElementById('bizFilterDesc').textContent = descs[filter];
  document.getElementById('bizLegendLabel').textContent = labels[filter];
  renderBizList();
  renderSiteMap();
}

function getBizScore(s) {
  if (activeBizFilter === 'foot') return s.footScore;
  if (activeBizFilter === 'ev') return s.evScore;
  return s.commScore;
}

function scoreClass(score) {
  if (score >= 60) return 'high';
  if (score >= 35) return 'med';
  return 'low-score';
}

function renderBizList() {
  const sorted = getSortedData();
  const list = document.getElementById('bizList');
  list.innerHTML = '';
  sorted.forEach(function(s, i) {
    const score = getBizScore(s);
    const cls = scoreClass(score);
    const card = document.createElement('div');
    card.className = 'biz-card ' + cls;
    card.style.animationDelay = (i * 0.04) + 's';
    card.innerHTML =
      '<div class="biz-card-top">' +
        '<div>' +
          '<div class="biz-card-name">' + s.suburb + '</div>' +
          '<div class="biz-card-meta"><span>' + s.zones + ' zones</span><span>' + s.totalBays + ' bays</span><span>$' + s.avgRate + '/hr</span></div>' +
        '</div>' +
        '<div class="biz-score-badge ' + cls + '">' + score + '/100</div>' +
      '</div>';
    card.onclick = function() { selectBizSuburb(card, i, sorted); };
    list.appendChild(card);
  });
}

function getSortedData() {
  return [...commercialData].sort(function(a, b) { return getBizScore(b) - getBizScore(a); });
}

function renderSiteMap() {
  if (!siteMarkerLayer) return;
  siteMarkerLayer.clearLayers();
  commercialData.forEach(function(s) {
    const score = getBizScore(s);
    const colour = score >= 60 ? '#4af0a0' : score >= 35 ? '#f5c842' : '#f05a5a';
    const size = 18 + Math.round((score / 100) * 20);
    const icon = L.divIcon({
      className: '',
      html: '<div style="display:flex;flex-direction:column;align-items:center">' +
        '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + colour + '22;border:2px solid ' + colour + ';display:flex;align-items:center;justify-content:center;font-family:Syne,sans-serif;font-weight:800;font-size:9px;color:' + colour + '">' + score + '</div>' +
        '<div style="margin-top:2px;background:rgba(19,22,29,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:2px 6px;font-size:9px;font-family:DM Mono,monospace;color:' + colour + ';white-space:nowrap">' + s.suburb + '</div>' +
      '</div>',
      iconSize: [size, size + 18],
      iconAnchor: [size / 2, size / 2]
    });
    const marker = L.marker([s.lat, s.lng], { icon: icon });
    marker.bindTooltip(s.suburb + ' · Score: ' + score + '/100', { direction: 'top', className: 'map-tooltip' });
    marker.on('click', function() {
      const sorted = getSortedData();
      const idx = sorted.findIndex(function(x) { return x.suburb === s.suburb; });
      const cards = document.querySelectorAll('.biz-card');
      if (cards[idx]) { selectBizSuburb(cards[idx], idx, sorted); cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    });
    siteMarkerLayer.addLayer(marker);
  });
}

function selectBizSuburb(card, idx, sorted) {
  document.querySelectorAll('.biz-card').forEach(function(c) { c.classList.remove('selected'); });
  card.classList.add('selected');
  selectedBizIdx = idx;
  selectedBizData = sorted[idx];
  updateSiteDetail(sorted[idx]);
  if (siteMap) siteMap.flyTo([sorted[idx].lat, sorted[idx].lng], 15, { duration: 0.7 });
}

function updateSiteDetail(s) {
  document.getElementById('siteDetailName').textContent = s.suburb;
  document.getElementById('sDetailFoot').textContent = s.footScore + '/100';
  document.getElementById('sDetailEV').textContent = s.evScore + '/100';
  document.getElementById('sDetailComm').textContent = s.commScore + '/100';
  document.getElementById('sDetailDemand').textContent = s.demandScore + '/100';
  document.getElementById('sDetailZones').textContent = s.zones;
  document.getElementById('sDetailBays').textContent = s.totalBays;
  document.getElementById('sDetailRate').textContent = '$' + s.avgRate + '/hr';
  document.getElementById('sDetailOcc').textContent = s.avgOcc + '/5';

  // Hourly activity chart — build from commercialData hourly avg
  buildSuburbOccChart(s);

  // Score bars
  const bars = document.getElementById('siteScoreBars');
  const metrics = [
    { label: 'Foot Traffic', value: s.footScore, colour: '#f5c842' },
    { label: 'EV Suitability', value: s.evScore, colour: '#4af0a0' },
    { label: 'Commercial Dev', value: s.commScore, colour: '#4a9eff' },
    { label: 'Parking Demand', value: s.demandScore, colour: '#f05a5a' }
  ];
  bars.innerHTML = metrics.map(function(m) {
    return '<div class="score-bar-wrap">' +
      '<div class="score-bar-label"><span>' + m.label + '</span><span>' + m.value + '/100</span></div>' +
      '<div class="score-bar-track"><div class="score-bar-fill" style="width:' + m.value + '%;background:' + m.colour + '"></div></div>' +
    '</div>';
  }).join('');

  // Recommendation
  const recs = [];
  if (s.footScore >= 60) recs.push('High foot traffic — well suited for hospitality, retail, or café businesses that benefit from consistent daytime activity.');
  else if (s.footScore >= 35) recs.push('Moderate foot traffic — viable for businesses with a specific target audience rather than walk-in trade.');

  if (s.evScore >= 60) recs.push('Strong EV charging candidate — high bay capacity and long-stay zones provide ideal conditions for charging infrastructure.');
  else if (s.evScore >= 35) recs.push('Moderate EV potential — consider pilot installation in longer-stay zones.');

  if (s.commScore >= 60) recs.push('Premium commercial corridor — high demand and pricing signal strong investment viability.');
  else if (s.commScore >= 35) recs.push('Moderate commercial viability — suitable for mixed-use or emerging retail concepts.');

  if (s.footScore < 35 && s.evScore < 35 && s.commScore < 35) recs.push('Limited commercial signal from parking data alone. Supplement with zoning and transport data before making site decisions.');

  document.getElementById('siteRecommendation').textContent = recs.join(' ');
}

function buildSuburbOccChart(s) {
  // Find all parking zones in this suburb and average their hourly occupancy
  const suburbZones = parkingData.filter(function(z) { return z.suburb === s.suburb && z.occ; });
  const hourlyAvg = new Array(24).fill(0);
  if (suburbZones.length > 0) {
    for (let h = 0; h < 24; h++) {
      const vals = suburbZones.map(function(z) { return z.occ[h] || 0; });
      hourlyAvg[h] = vals.reduce(function(a, b) { return a + b; }, 0) / vals.length;
    }
  }

  const chart = document.getElementById('siteOccChart');
  chart.innerHTML = '';
  const hours = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
  hours.forEach(function(h) {
    const val = hourlyAvg[h] || 0;
    const pct = (val / 5) * 100;
    const cls = val <= 1.5 ? 'low' : val <= 3 ? 'med' : 'high';
    const wrap = document.createElement('div');
    wrap.className = 'occ-bar-wrap';
    wrap.innerHTML = '<div class="occ-bar ' + cls + '" style="height:' + Math.max(pct, 6) + '%"></div><div class="occ-hour">' + h + '</div>';
    chart.appendChild(wrap);
  });
}

function closeSiteDetail() {
  document.querySelectorAll('.biz-card').forEach(function(c) { c.classList.remove('selected'); });
  selectedBizIdx = null;
  selectedBizData = null;
}

function exportReport() {
  if (!selectedBizData) { alert('Please select a suburb first.'); return; }
  const s = selectedBizData;
  const content = [
    'ParkBNE Intelligence — Commercial Site Analysis Report',
    'Suburb: ' + s.suburb,
    'Generated: ' + new Date().toLocaleDateString(),
    'Analysis Focus: ' + activeBizFilter.charAt(0).toUpperCase() + activeBizFilter.slice(1),
    '',
    'INSIGHT SCORES',
    'Foot Traffic Score:     ' + s.footScore + '/100',
    'EV Suitability Score:   ' + s.evScore + '/100',
    'Commercial Dev Score:   ' + s.commScore + '/100',
    'Parking Demand Score:   ' + s.demandScore + '/100',
    '',
    'PARKING INFRASTRUCTURE',
    'Meter Zones:            ' + s.zones,
    'Total Vehicle Bays:     ' + s.totalBays,
    'Average Weekday Rate:   $' + s.avgRate + '/hr',
    'Average Occ (0-5):      ' + s.avgOcc,
    '',
    'NOTE: All scores are derived from Brisbane City Council open parking data.',
    'Supplement with land use zoning, demographic, and transport data for complete analysis.',
    'Data source: data.brisbane.qld.gov.au'
  ].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  a.download = s.suburb.replace(/ /g, '_') + '_ParkBNE_Report.txt';
  a.click();
}

// ═══════════════════════════════════════
// DEMAND HEATMAP
// ═══════════════════════════════════════
function initHeatmapMap() {
  if (heatmapMap) { heatmapMap.invalidateSize(); return; }
  heatmapMap = L.map('heatmapMap', { center: [-27.47, 153.025], zoom: 14, zoomControl: false });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO', subdomains: 'abcd', maxZoom: 19
  }).addTo(heatmapMap);
  L.control.zoom({ position: 'topright' }).addTo(heatmapMap);
  heatmapMarkerLayer = L.layerGroup().addTo(heatmapMap);
  updateHeatmap(9);
}

function updateHeatmap(val) {
  const hour = parseInt(val);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  document.getElementById('heatmapTimeDisplay').textContent = display + ':00 ' + ampm;

  if (!heatmapMarkerLayer) return;
  heatmapMarkerLayer.clearLayers();

  parkingData.forEach(function(m) {
    if (!m.occ || !m.lat || !m.lng) return;
    const val = m.occ[hour] || 0;
    const colour = val <= 1.5 ? '#4af0a0' : val <= 3 ? '#f5c842' : '#f05a5a';
    const opacity = 0.3 + (val / 5) * 0.7;
    const size = 8 + Math.round((val / 5) * 8);

    const icon = L.divIcon({
      className: '',
      html: '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + colour + ';opacity:' + opacity + ';border:1px solid ' + colour + '"></div>',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });

    const marker = L.marker([m.lat, m.lng], { icon: icon });
    marker.bindTooltip(m.street + ', ' + m.suburb + ' · Occupancy: ' + val.toFixed(1) + '/5', {
      direction: 'top', className: 'map-tooltip'
    });
    heatmapMarkerLayer.addLayer(marker);
  });
}

// ═══════════════════════════════════════
// SUBURB COMPARATOR
// ═══════════════════════════════════════
function populateCompareDropdowns() {
  const sorted = [...commercialData].sort(function(a, b) { return a.suburb.localeCompare(b.suburb); });
  for (let i = 0; i < 3; i++) {
    const sel = document.getElementById('csel' + i);
    sorted.forEach(function(s) {
      const opt = document.createElement('option');
      opt.value = s.suburb;
      opt.textContent = s.suburb;
      sel.appendChild(opt);
    });
  }
}

function selectCompareSuburb(slotIdx, suburb) {
  if (!suburb) {
    compareSelections[slotIdx] = null;
  } else {
    compareSelections[slotIdx] = commercialData.find(function(s) { return s.suburb === suburb; }) || null;
  }
  renderCompareTable();
}

function clearComparison() {
  compareSelections = [null, null, null];
  for (let i = 0; i < 3; i++) {
    document.getElementById('csel' + i).value = '';
  }
  renderCompareTable();
}

function renderCompareTable() {
  const active = compareSelections.filter(Boolean);
  const tableEl = document.getElementById('compareTable');
  const emptyEl = document.getElementById('compareEmpty');

  if (active.length === 0) {
    tableEl.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }

  emptyEl.style.display = 'none';

  const rows = [
    { label: 'Foot Traffic Score', key: 'footScore', format: function(v) { return v + '/100'; }, colour: '#f5c842', labelColour: '#f5c842', tip: 'Estimates visitor volume from occupancy (60%) and total bay capacity (40%)' },
    { label: 'EV Suitability', key: 'evScore', format: function(v) { return v + '/100'; }, colour: '#4af0a0', labelColour: '#4af0a0', tip: 'Scores based on bays per zone, long-stay zones, and available off-peak capacity' },
    { label: 'Commercial Dev', key: 'commScore', format: function(v) { return v + '/100'; }, colour: '#4a9eff', labelColour: '#4a9eff', tip: 'Combines average occupancy (50%) and average parking rate (50%) as commercial signal' },
    { label: 'Demand Score', key: 'demandScore', format: function(v) { return v + '/100'; }, colour: '#f05a5a', labelColour: '#f05a5a', tip: 'Direct conversion of average predicted occupancy (0–5 scale) to a percentage' },
    { label: 'Meter Zones', key: 'zones', format: function(v) { return v; }, colour: null, labelColour: 'var(--text)', tip: 'Number of individual parking meter zones in this suburb' },
    { label: 'Total Bays', key: 'totalBays', format: function(v) { return v; }, colour: null, labelColour: 'var(--text)', tip: 'Total vehicle bays across all meter zones in this suburb' },
    { label: 'Avg Weekday Rate', key: 'avgRate', format: function(v) { return '$' + v + '/hr'; }, colour: null, labelColour: 'var(--text)', tip: 'Average weekday parking rate across all zones — higher rates suggest premium commercial areas' },
    { label: 'Avg Occupancy', key: 'avgOcc', format: function(v) { return v + '/5'; }, colour: null, labelColour: 'var(--text)', tip: 'Average predicted occupancy on 0–5 scale across all zones, hours and dates in the dataset' }
  ];

  let html = '<div class="compare-table" style="grid-template-columns: 180px ' + active.map(function() { return '1fr'; }).join(' ') + '">';

  // Header row
  html += '<div class="compare-row header" style="grid-column:1/-1;display:grid;grid-template-columns:inherit">';
  html += '<div class="compare-cell" style="color:var(--text);font-size:11px;font-family:DM Mono,monospace;text-transform:uppercase;letter-spacing:0.5px">Metric</div>';
  active.forEach(function(s) {
    html += '<div class="compare-cell" style="font-family:Syne,sans-serif;font-size:13px;font-weight:700;color:var(--text)">' + s.suburb + '</div>';
  });
  html += '</div>';

  // Data rows
  rows.forEach(function(row) {
    const vals = active.map(function(s) { return s[row.key]; });
    const maxVal = Math.max(...vals);
    // Colour dot for score rows
    const dotHtml = row.labelColour && row.labelColour !== 'var(--text)'
      ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + row.labelColour + ';margin-right:6px;flex-shrink:0"></span>'
      : '';

    html += '<div class="compare-row" style="grid-column:1/-1;display:grid;grid-template-columns:inherit">';
    html += '<div class="compare-cell row-label" style="color:' + row.labelColour + ';font-size:12px;font-weight:500;display:flex;align-items:center;gap:4px">' +
      dotHtml +
      '<span>' + row.label + '</span>' +
      '<span class="tip" style="margin-left:2px" onclick="showTooltip(event,\'' + row.tip + '\')">ⓘ</span>' +
    '</div>';
    active.forEach(function(s) {
      const v = s[row.key];
      const isBest = v === maxVal && active.length > 1;
      const colour = isBest && row.colour ? row.colour : 'var(--text)';
      const bgHighlight = isBest && row.colour ? 'background:' + row.colour + '11;border-radius:6px;padding:2px 6px;' : '';
      html += '<div class="compare-cell"><div class="cell-val" style="color:' + colour + ';font-size:15px;' + bgHighlight + '">' + row.format(v) + (isBest ? ' ✓' : '') + '</div></div>';
    });
    html += '</div>';
  });

  html += '</div>';
  tableEl.innerHTML = html;
}

// ═══════════════════════════════════════
// FEEDBACK
// ═══════════════════════════════════════
function selectDecision(el, decision) {
  document.querySelectorAll('#decisionChips .chip').forEach(function(c) { c.classList.remove('active'); });
  el.classList.add('active');
  currentDecision = decision;
}

function setRating(rating) {
  currentRating = rating;
  const stars = document.querySelectorAll('.star');
  stars.forEach(function(s, i) {
    s.classList.toggle('active', i < rating);
  });
}

function submitFeedback() {
  if (!currentDecision) { alert('Please select a decision type first.'); return; }
  if (currentRating === 0) { alert('Please provide a rating.'); return; }

  const panelUsed = document.getElementById('panelUsed').value;
  const missing = document.getElementById('missingInfo').value.trim();
  const comments = document.getElementById('otherComments').value.trim();

  const response = {
    decision: currentDecision,
    panel: panelUsed || 'Not specified',
    rating: currentRating,
    missing: missing || 'None provided',
    comments: comments || 'None provided',
    time: new Date().toLocaleTimeString()
  };

  feedbackResponses.push(response);
  renderFeedbackList();
  resetFeedbackForm();

  const success = document.getElementById('formSuccess');
  success.style.display = 'block';
  setTimeout(function() { success.style.display = 'none'; }, 3000);
}

function resetFeedbackForm() {
  document.querySelectorAll('#decisionChips .chip').forEach(function(c) { c.classList.remove('active'); });
  document.querySelectorAll('.star').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('panelUsed').value = '';
  document.getElementById('missingInfo').value = '';
  document.getElementById('otherComments').value = '';
  currentDecision = '';
  currentRating = 0;
}

function renderFeedbackList() {
  const list = document.getElementById('feedbackList');
  if (feedbackResponses.length === 0) {
    list.innerHTML = '<div class="compare-empty">No responses yet</div>';
    return;
  }

  list.innerHTML = feedbackResponses.map(function(r, i) {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    return '<div class="feedback-card">' +
      '<div class="feedback-card-top">' +
        '<div class="feedback-card-type">' + r.decision + '</div>' +
        '<div class="feedback-card-rating">' + stars + ' ' + r.rating + '/5</div>' +
      '</div>' +
      '<div class="feedback-card-body">' +
        (r.missing !== 'None provided' ? '<div><strong style="color:var(--text);font-size:11px">Missing:</strong> ' + r.missing + '</div>' : '') +
        (r.comments !== 'None provided' ? '<div style="margin-top:4px"><strong style="color:var(--text);font-size:11px">Comments:</strong> ' + r.comments + '</div>' : '') +
      '</div>' +
      '<div><span class="feedback-card-tag">' + r.panel + '</span> <span class="feedback-card-tag">' + r.time + '</span></div>' +
    '</div>';
  }).reverse().join('');
}

// ═══════════════════════════════════════
// TOOLTIP SYSTEM
// ═══════════════════════════════════════
function showTooltip(event, text) {
  event.stopPropagation();
  const popup = document.getElementById('tooltipPopup');
  popup.textContent = text;
  popup.classList.add('visible');

  // Position near the clicked element
  const x = event.clientX;
  const y = event.clientY;
  const popupW = 280;
  const popupH = 120;

  // Keep within viewport
  const left = x + popupW > window.innerWidth ? x - popupW - 10 : x + 12;
  const top = y + popupH > window.innerHeight ? y - popupH - 10 : y + 12;

  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
  popup.style.pointerEvents = 'auto';

  // Auto-hide after 5 seconds
  clearTimeout(window._tooltipTimer);
  window._tooltipTimer = setTimeout(hideTooltip, 5000);
}

function hideTooltip() {
  const popup = document.getElementById('tooltipPopup');
  popup.classList.remove('visible');
  popup.style.pointerEvents = 'none';
}

// Hide tooltip when clicking anywhere else
document.addEventListener('click', function(e) {
  if (!e.target.classList.contains('tip') && !e.target.classList.contains('chip-info')) {
    hideTooltip();
  }
});

// ═══════════════════════════════════════
// AI ASSISTANT
// ═══════════════════════════════════════
const AI_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const AI_API_KEY = 'sk-byjtqesdzzpzoemcjxaqhdfwgsadmiwyvbgevyaugktimoxu';
const AI_MODEL = 'Qwen/Qwen3-8B';

let aiChatHistory = [];
let aiIsLoading = false;

// Build system prompt with full data context
function buildSystemPrompt() {
  const suburbSummaries = commercialData.map(function(s) {
    return s.suburb + ': FootTraffic=' + s.footScore + '/100, EV=' + s.evScore + '/100, CommDev=' + s.commScore + '/100, Demand=' + s.demandScore + '/100, Zones=' + s.zones + ', Bays=' + s.totalBays + ', AvgRate=$' + s.avgRate + '/hr, AvgOcc=' + s.avgOcc + '/5';
  }).join('\n');

  return 'You are ParkBNE Intelligence, a commercial site analysis assistant for inner-city Brisbane. You help businesses, investors, and developers make location-based decisions using Brisbane City Council open parking data.\n\n' +
    'IMPORTANT CONTEXT:\n' +
    '- All scores are derived from parking meter and occupancy forecasting data only\n' +
    '- Foot Traffic Score (0-100): estimates visitor volume from occupancy (60%) and total bay capacity (40%)\n' +
    '- EV Suitability Score (0-100): based on bays per zone, long-stay zones (4hrs+), and available capacity\n' +
    '- Commercial Dev Score (0-100): combines occupancy (50%) and average parking rate (50%)\n' +
    '- Demand Score (0-100): direct conversion of average predicted occupancy (0-5 scale)\n' +
    '- Data covers January to March 2026, car-based activity only — public transport users not captured\n' +
    '- Scores are indicative proxies, not direct measurements\n\n' +
    'SUBURB DATA:\n' + suburbSummaries + '\n\n' +
    'Be concise, helpful, and honest about data limitations. When recommending suburbs, explain why based on the actual scores. Keep responses focused and practical for business decision-making.';
}

function initAIPanel() {
  renderAIContextList();
}

function renderAIContextList() {
  const sorted = [...commercialData].sort(function(a, b) { return b.footScore - a.footScore; }).slice(0, 6);
  const list = document.getElementById('aiContextList');
  if (!list) return;
  list.innerHTML = sorted.map(function(s) {
    return '<div class="ai-context-item">' +
      '<span class="ai-context-suburb">' + s.suburb + '</span>' +
      '<span class="ai-context-score">FT: ' + s.footScore + ' · EV: ' + s.evScore + '</span>' +
    '</div>';
  }).join('');
}

function sendSuggestion(el) {
  const text = el.textContent.trim();
  document.getElementById('aiInput').value = text;
  sendAIMessage();
}

function handleAIKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendAIMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

async function sendAIMessage() {
  if (aiIsLoading) return;
  const input = document.getElementById('aiInput');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  input.style.height = 'auto';

  // Add user message to UI
  appendMessage('user', message);

  // Add to history
  aiChatHistory.push({ role: 'user', content: message });

  // Show thinking indicator
  setAILoading(true);
  const thinkingEl = appendThinking();

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + AI_API_KEY
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          ...aiChatHistory
        ],
        max_tokens: 600,
        temperature: 0.7,
        enable_thinking: false
      })
    });

    const data = await response.json();
    thinkingEl.remove();

    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content;
      appendMessage('assistant', reply);
      aiChatHistory.push({ role: 'assistant', content: reply });
      // Keep history manageable
      if (aiChatHistory.length > 20) aiChatHistory = aiChatHistory.slice(-20);
    } else {
      appendMessage('assistant', 'Sorry, I could not get a response. Please try again.');
    }
  } catch (err) {
    thinkingEl.remove();
    appendMessage('assistant', 'Connection error — please check your internet connection and try again.');
    console.error('AI error:', err);
  }

  setAILoading(false);
}

function formatMarkdown(text) {
  return text
    .replace(/^### (.+)/gm, '<div style="font-family:Syne,sans-serif;font-weight:700;font-size:13px;color:var(--accent);margin:10px 0 4px">$1</div>')
    .replace(/^## (.+)/gm, '<div style="font-family:Syne,sans-serif;font-weight:700;font-size:14px;color:var(--text);margin:10px 0 4px">$1</div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:var(--bg);padding:1px 5px;border-radius:4px;font-family:DM Mono,monospace;font-size:11px">$1</code>')
    .replace(/^- (.+)/gm, '• $1')
    .replace(/\n/g, '<br>');
}

function appendMessage(role, text) {
  const messages = document.getElementById('aiMessages');
  const div = document.createElement('div');
  div.className = 'ai-message ' + role;
  const formatted = formatMarkdown(text);
  div.innerHTML = '<div class="ai-bubble">' + formatted + '</div>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function appendThinking() {
  const messages = document.getElementById('aiMessages');
  const div = document.createElement('div');
  div.className = 'ai-message assistant';
  div.innerHTML = '<div class="ai-thinking"><div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div></div>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function setAILoading(loading) {
  aiIsLoading = loading;
  const btn = document.getElementById('aiSendBtn');
  const status = document.getElementById('aiStatus');
  if (btn) btn.disabled = loading;
  if (status) {
    status.innerHTML = loading
      ? '<div class="status-dot" style="background:var(--med)"></div><span>Thinking...</span>'
      : '<div class="status-dot"></div><span>Ready</span>';
  }
}
