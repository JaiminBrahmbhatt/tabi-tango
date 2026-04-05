/**
 * Tabi Tango — Progress Tracker
 * Uses safe DOM methods to avoid XSS.
 */
(function () {
  SRS.init();

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'className') node.className = v;
      else if (k === 'style') Object.assign(node.style, v);
      else node[k] = v;
    });
    if (children) [].concat(children).forEach(c => {
      if (typeof c === 'string') node.appendChild(document.createTextNode(c));
      else if (c) node.appendChild(c);
    });
    return node;
  }

  function today() { return new Date().toISOString().split('T')[0]; }

  // ── Readiness ring ────────────────────────────────────────────────────────────

  function renderReadiness(root) {
    const score = SRS.getReadinessScore();
    const deg = Math.round(score * 3.6);
    const section = el('div', { className: 'readiness-section' });

    const ring = el('div', { className: 'readiness-ring' });
    ring.style.background = `conic-gradient(var(--primary) ${deg}deg, var(--surface-3) 0deg)`;

    const inner = el('div', { className: 'readiness-ring-inner' }, [
      el('div', { className: 'readiness-number' }, String(score)),
      el('div', { className: 'readiness-pct' }, 'readiness')
    ]);
    ring.appendChild(inner);

    const text = el('div', { className: 'readiness-text' }, [
      el('div', { className: 'readiness-title' }, 'Trip Readiness'),
      el('div', { className: 'readiness-subtitle' }, `${score}% ready for Japan. Keep studying every day to improve your score.`)
    ]);

    section.appendChild(ring);
    section.appendChild(text);
    root.appendChild(section);
  }

  // ── Countdown ─────────────────────────────────────────────────────────────────

  function renderCountdown(root) {
    const days = SRS.getTripDaysRemaining();
    let cls = 'green';
    if (days <= 5) cls = 'red';
    else if (days <= 10) cls = 'orange';
    else if (days <= 20) cls = 'yellow';

    const banner = el('div', { className: `countdown-banner ${cls}` });
    banner.appendChild(el('div', { className: 'countdown-days' }, String(days)));

    const textBlock = el('div', { className: 'countdown-text' });
    const strong = el('strong', {}, days === 0 ? 'Trip day is here!' : `${days} day${days !== 1 ? 's' : ''} remaining`);
    const span = el('span', {}, days === 0 ? 'がんばって! Good luck!' : 'Stay consistent — daily practice makes perfect.');
    textBlock.appendChild(strong);
    textBlock.appendChild(span);

    banner.appendChild(textBlock);
    root.appendChild(banner);
  }

  // ── Stats grid ────────────────────────────────────────────────────────────────

  function renderStats(root) {
    const mastery = SRS.getMastery();
    const state = SRS.loadState();
    const calData = SRS.getCalendarData();

    const recentQuizzes = state.quizHistory.slice(-5);
    const quizAvg = recentQuizzes.length
      ? Math.round(recentQuizzes.reduce((s, q) => s + (q.score / q.total) * 100, 0) / recentQuizzes.length)
      : 0;
    const studiedDays = calData.days.filter(d => d.reviewed > 0).length;

    const grid = el('div', { className: 'stats-grid' });
    [
      { value: `${mastery.mastered}/${mastery.total}`, label: 'Mastered' },
      { value: String(mastery.streak), label: 'Day Streak' },
      { value: `${quizAvg}%`, label: 'Quiz Avg' },
      { value: String(studiedDays), label: 'Days Studied' }
    ].forEach(({ value, label }) => {
      grid.appendChild(el('div', { className: 'stat-card' }, [
        el('div', { className: 'stat-value' }, value),
        el('div', { className: 'stat-label' }, label)
      ]));
    });

    root.appendChild(grid);
  }

  // ── Category mastery bars ─────────────────────────────────────────────────────

  function renderCategoryMastery(root) {
    const mastery = SRS.getMastery();
    const section = el('div', { className: 'category-mastery' });
    section.appendChild(el('div', { className: 'section-header' }, 'Category Mastery'));

    Object.entries(window.CATEGORIES).forEach(([key, cat]) => {
      const { mastered, total } = mastery.byCategory[key];
      const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
      const shortLabel = cat.label.split(' & ')[0].split(' & ')[0];

      const row = el('div', { className: 'cat-mastery-row' });
      row.appendChild(el('div', { className: 'cat-mastery-label' }, shortLabel));

      const track = el('div', { className: 'cat-mastery-track' });
      track.appendChild(el('div', { className: 'cat-mastery-fill', style: { width: `${pct}%` } }));
      row.appendChild(track);
      row.appendChild(el('div', { className: 'cat-mastery-pct' }, `${pct}%`));
      section.appendChild(row);
    });

    root.appendChild(section);
  }

  // ── Calendar ──────────────────────────────────────────────────────────────────

  function renderCalendar(root) {
    const calData = SRS.getCalendarData();
    const t = today();
    const section = el('div', { className: 'calendar-section' });
    section.appendChild(el('div', { className: 'section-header' }, '30-Day Study Calendar'));

    const legend = el('div', { className: 'calendar-legend' });
    [
      { cls: 'future', label: 'Future' },
      { cls: 'studied', label: 'Studied' },
      { cls: 'good', label: '10+ cards' },
      { cls: 'today', label: 'Today' }
    ].forEach(({ cls, label }) => {
      const item = el('div', { className: 'legend-item' }, [
        el('span', { className: `legend-dot ${cls}` }),
        document.createTextNode(label)
      ]);
      legend.appendChild(item);
    });
    section.appendChild(legend);

    // Weekday headers
    const weekdays = el('div', { className: 'cal-weekdays' });
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
      weekdays.appendChild(el('div', { className: 'cal-weekday' }, d));
    });
    section.appendChild(weekdays);

    // Day grid
    const grid = el('div', { className: 'calendar-grid' });
    const firstDate = new Date(calData.tripStartDate + 'T00:00:00');
    for (let i = 0; i < firstDate.getDay(); i++) {
      grid.appendChild(el('div', {}));
    }

    calData.days.forEach(day => {
      const dayNum = new Date(day.date + 'T00:00:00').getDate();
      let cls = 'cal-day ';
      if (day.date === t) cls += 'today';
      else if (day.date > t) cls += 'future';
      else if (day.reviewed >= 10) cls += 'good';
      else if (day.reviewed > 0) cls += 'studied';
      else cls += 'missed';

      const cell = el('div', { className: cls }, String(dayNum));
      if (day.reviewed > 0) cell.title = `${day.reviewed} cards reviewed`;
      grid.appendChild(cell);
    });

    section.appendChild(grid);
    root.appendChild(section);
  }

  // ── Reset ─────────────────────────────────────────────────────────────────────

  function renderReset(root) {
    const wrap = el('div', { className: 'reset-wrap' });
    const btn = el('button', { className: 'btn-reset' }, 'Reset all progress');
    btn.addEventListener('click', () => {
      if (confirm('Reset all progress? This cannot be undone.')) {
        SRS.resetProgress();
        renderAll();
      }
    });
    wrap.appendChild(btn);
    root.appendChild(wrap);
  }

  // ── Footer ────────────────────────────────────────────────────────────────────

  function updateFooter() {
    const days = SRS.getTripDaysRemaining();
    const countEl = document.getElementById('trip-countdown');
    if (!countEl) return;
    while (countEl.firstChild) countEl.removeChild(countEl.firstChild);
    const s = el('strong', {}, `${days} day${days !== 1 ? 's' : ''}`);
    countEl.appendChild(s);
    countEl.appendChild(document.createTextNode(' until your Japan trip'));
  }

  function updateDueBadge() {
    const badge = document.getElementById('due-count');
    if (badge) badge.textContent = SRS.getDueCards().length;
  }

  // ── Init ──────────────────────────────────────────────────────────────────────

  function renderAll() {
    const root = document.getElementById('progress-root');
    if (!root) return;
    while (root.firstChild) root.removeChild(root.firstChild);
    renderReadiness(root);
    renderCountdown(root);
    renderStats(root);
    renderCategoryMastery(root);
    renderCalendar(root);
    renderReset(root);
    updateFooter();
    updateDueBadge();
  }

  renderAll();
})();
