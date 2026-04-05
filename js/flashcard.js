/**
 * Tabi Tango — Flashcard UI
 * Uses safe DOM methods (textContent / createElement) to avoid XSS.
 */
(function () {
  SRS.init();

  let currentCategory = 'all';
  let deck = [];
  let currentIndex = 0;
  let isFlipped = false;
  let swipeBlocked = false;

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'className') node.className = v;
      else if (k === 'style') Object.assign(node.style, v);
      else if (k.startsWith('data-')) node.setAttribute(k, v);
      else node[k] = v;
    });
    if (children) [].concat(children).forEach(c => {
      if (typeof c === 'string') node.appendChild(document.createTextNode(c));
      else if (c) node.appendChild(c);
    });
    return node;
  }

  function getFilteredDeck(cat) {
    const due = SRS.getDueCards();
    let phrases = cat === 'all' ? window.PHRASES : window.PHRASES.filter(p => p.category === cat);
    return phrases.slice().sort((a, b) => {
      const aDue = due.includes(a.id);
      const bDue = due.includes(b.id);
      if (aDue && !bDue) return -1;
      if (!aDue && bDue) return 1;
      return 0;
    });
  }

  function updateDueBadge() {
    const badge = document.getElementById('due-count');
    if (badge) badge.textContent = SRS.getDueCards().length;
  }

  function updateMasteryBar() {
    const m = SRS.getMastery();
    const pct = Math.round((m.mastered / m.total) * 100);
    const fill = document.getElementById('mastery-fill');
    const text = document.getElementById('mastery-text');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = `${m.mastered} / ${m.total}`;
  }

  // ── Speech ───────────────────────────────────────────────────────────────────

  function speakJapanese(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.85;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }

  function updateTripCountdown() {
    const days = SRS.getTripDaysRemaining();
    const countEl = document.getElementById('trip-countdown');
    if (!countEl) return;
    while (countEl.firstChild) countEl.removeChild(countEl.firstChild);
    const s = document.createElement('strong');
    s.textContent = `${days} day${days !== 1 ? 's' : ''}`;
    countEl.appendChild(s);
    countEl.appendChild(document.createTextNode(' until your Japan trip'));
  }

  function renderSessionHero() {
    const hero = document.getElementById('session-hero');
    if (!hero) return;
    while (hero.firstChild) hero.removeChild(hero.firstChild);
    const h = new Date().getHours();
    const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const due = SRS.getDueCards().length;
    const sub = due > 0 ? `${due} card${due !== 1 ? 's' : ''} due today` : 'All caught up for today';
    hero.appendChild(el('div', { className: 'session-greeting' }, greeting));
    hero.appendChild(el('div', { className: 'session-sub' }, sub));
  }

  // ── Grade tray ────────────────────────────────────────────────────────────────

  function renderGradeTray(phrase) {
    const grid = document.getElementById('grade-grid');
    const tipEl = document.getElementById('grade-tip');
    const tipText = document.getElementById('grade-tip-text');
    if (!grid) return;

    while (grid.firstChild) grid.removeChild(grid.firstChild);

    const state = SRS.loadState();
    const card = state.cards[phrase.id];
    const ef = card.easeFactor;
    const iv = card.interval;

    function fmtInterval(n) {
      if (n <= 1) return '< 1d';
      return `${n}d`;
    }

    const grades = [
      { cls: 'btn-grade-again', icon: 'replay',                    label: 'Again', interval: fmtInterval(1),                                          grade: 0 },
      { cls: 'btn-grade-hard',  icon: 'sentiment_neutral',         label: 'Hard',  interval: fmtInterval(Math.max(1, Math.round(iv * 1.2))),           grade: 1 },
      { cls: 'btn-grade-good',  icon: 'sentiment_satisfied',       label: 'Good',  interval: fmtInterval(Math.min(Math.round(iv * ef), 30)),            grade: 2 },
      { cls: 'btn-grade-easy',  icon: 'sentiment_very_satisfied',  label: 'Easy',  interval: fmtInterval(Math.min(Math.round(iv * ef * 1.3), 30)),      grade: 3 },
    ];

    grades.forEach(({ cls, icon, label, interval, grade }) => {
      const btn = el('button', { className: `btn-grade ${cls}` });
      const iconWrap = el('div', { className: 'btn-grade-icon' });
      const iconEl = document.createElement('span');
      iconEl.className = 'material-symbols-outlined';
      iconEl.textContent = icon;
      iconWrap.appendChild(iconEl);
      btn.appendChild(iconWrap);
      btn.appendChild(el('span', { className: 'btn-grade-label' }, label));
      btn.appendChild(el('span', { className: 'btn-grade-interval' }, interval));
      btn.addEventListener('click', () => doGrade(grade));
      grid.appendChild(btn);
    });

    if (phrase.notes && tipEl && tipText) {
      while (tipText.firstChild) tipText.removeChild(tipText.firstChild);
      const strong = el('strong', {}, 'Tip: ');
      tipText.appendChild(strong);
      tipText.appendChild(document.createTextNode(phrase.notes));
      tipEl.style.display = 'flex';
    } else if (tipEl) {
      tipEl.style.display = 'none';
    }
  }

  function showGradeTray(phrase) {
    renderGradeTray(phrase);
    const tray = document.getElementById('grade-tray');
    if (tray) tray.classList.add('visible');
  }

  function hideGradeTray() {
    const tray = document.getElementById('grade-tray');
    if (tray) tray.classList.remove('visible');
  }

  // ── Card rendering ────────────────────────────────────────────────────────────

  function renderCard() {
    const root = document.getElementById('flashcard-root');
    if (!root) return;
    while (root.firstChild) root.removeChild(root.firstChild);
    hideGradeTray();

    if (deck.length === 0) {
      root.appendChild(el('div', { className: 'empty-state' }, [
        el('div', { className: 'empty-icon' }, '—'),
        el('h3', {}, 'No phrases here'),
        el('p', {}, 'Select a different category.')
      ]));
      return;
    }

    const phrase = deck[currentIndex];
    const due = SRS.getDueCards();
    const isDue = due.includes(phrase.id);
    const state = SRS.loadState();
    const cardState = state.cards[phrase.id];
    const cat = window.CATEGORIES[phrase.category];

    // Counter
    const counter = el('div', { className: 'card-counter' });
    counter.appendChild(document.createTextNode(`${currentIndex + 1} / ${deck.length}`));
    if (isDue) {
      counter.appendChild(document.createTextNode(' '));
      counter.appendChild(el('span', { className: 'due-pill' }, 'Due'));
    }

    // Difficulty dots
    const diffBar = el('div', { className: 'difficulty-bar' });
    for (let n = 1; n <= 3; n++) {
      diffBar.appendChild(el('span', { className: 'difficulty-seg' + (n <= phrase.difficulty ? ' on' : '') }));
    }

    // Front face
    const flipHint = el('div', { className: 'card-flip-hint' });
    const touchIcon = document.createElement('span');
    touchIcon.className = 'material-symbols-outlined';
    touchIcon.textContent = 'touch_app';
    flipHint.appendChild(touchIcon);
    flipHint.appendChild(document.createTextNode('Tap to reveal'));

    const front = el('div', { className: 'card-face card-front' }, [
      el('span', { className: 'card-category-label' }, cat.label),
      el('div', { className: 'card-english' }, phrase.english),
      flipHint
    ]);

    // Back face — speaker button for audio replay
    const backContent = el('div', { className: 'card-back-content' }, [
      diffBar,
      el('div', { className: 'card-japanese' }, phrase.japanese),
      el('div', { className: 'card-romaji' }, phrase.romaji),
    ]);

    const speakBtn = el('button', { className: 'btn-speak' });
    const speakIcon = document.createElement('span');
    speakIcon.className = 'material-symbols-outlined';
    speakIcon.textContent = 'volume_up';
    speakBtn.appendChild(speakIcon);
    speakBtn.addEventListener('click', e => { e.stopPropagation(); speakJapanese(phrase.japanese); });

    const back = el('div', { className: 'card-face card-back' }, [backContent, speakBtn]);

    const flipCard = el('div', { className: 'card', id: 'flip-card' }, [front, back]);
    const container = el('div', { className: 'card-container', id: 'card-container' }, flipCard);

    // Nav buttons
    const btnPrev = el('button', { className: 'btn-nav', id: 'btn-prev' });
    const prevIcon = document.createElement('span');
    prevIcon.className = 'material-symbols-outlined';
    prevIcon.textContent = 'arrow_back';
    btnPrev.appendChild(prevIcon);

    const btnNext = el('button', { className: 'btn-nav', id: 'btn-next' });
    const nextIcon = document.createElement('span');
    nextIcon.className = 'material-symbols-outlined';
    nextIcon.textContent = 'arrow_forward';
    btnNext.appendChild(nextIcon);

    if (currentIndex === 0) btnPrev.disabled = true;
    if (currentIndex === deck.length - 1) btnNext.disabled = true;

    const lastSeenText = cardState.lastSeen ? `Last seen ${cardState.lastSeen}` : 'New card';
    const nav = el('div', { className: 'card-nav' }, [
      btnPrev,
      el('span', { className: 'card-last-seen' }, lastSeenText),
      btnNext
    ]);

    root.appendChild(el('div', { className: 'card-area' }, [counter, container, nav]));

    isFlipped = false;
    attachListeners();
  }

  function attachListeners() {
    const card = document.getElementById('flip-card');
    const container = document.getElementById('card-container');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (card) card.addEventListener('click', doFlip);
    if (btnPrev) btnPrev.addEventListener('click', prevCard);
    if (btnNext) btnNext.addEventListener('click', nextCard);

    if (container) {
      let startX = 0, startY = 0, dragX = 0;
      let dragging = false;
      const THRESHOLD = 70;

      container.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        dragX = 0;
        dragging = false;
        container.style.transition = 'none';
      }, { passive: true });

      container.addEventListener('touchmove', e => {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (!dragging && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) dragging = true;
        if (dragging) {
          dragX = dx;
          const capped = Math.sign(dx) * Math.min(Math.abs(dx) * 0.55, 110);
          container.style.transform = `translateX(${capped}px)`;
          container.style.opacity = String(Math.max(0.4, 1 - Math.abs(dx) / 350));
        }
      }, { passive: true });

      container.addEventListener('touchend', () => {
        if (!dragging) return;
        dragging = false;
        const canNext = currentIndex < deck.length - 1;
        const canPrev = currentIndex > 0;
        if (dragX < -THRESHOLD && canNext) {
          swipeBlocked = true;
          container.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
          container.style.transform = 'translateX(-110%)';
          container.style.opacity = '0';
          setTimeout(() => { currentIndex++; renderCard(); }, 240);
        } else if (dragX > THRESHOLD && canPrev) {
          swipeBlocked = true;
          container.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
          container.style.transform = 'translateX(110%)';
          container.style.opacity = '0';
          setTimeout(() => { currentIndex--; renderCard(); }, 240);
        } else {
          container.style.transition = 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.35s ease';
          container.style.transform = '';
          container.style.opacity = '';
        }
      }, { passive: true });
    }
  }

  function doFlip() {
    if (swipeBlocked) { swipeBlocked = false; return; }
    const card = document.getElementById('flip-card');
    if (!card) return;
    isFlipped = !isFlipped;
    card.classList.toggle('flipped', isFlipped);
    if (isFlipped && deck.length > 0) {
      showGradeTray(deck[currentIndex]);
    } else {
      hideGradeTray();
    }
  }

  function nextCard() {
    if (currentIndex < deck.length - 1) { currentIndex++; renderCard(); }
  }

  function prevCard() {
    if (currentIndex > 0) { currentIndex--; renderCard(); }
  }

  function doGrade(grade) {
    SRS.gradeCard(deck[currentIndex].id, grade);
    updateMasteryBar();
    updateDueBadge();
    renderSessionHero();
    hideGradeTray();
    setTimeout(() => {
      if (currentIndex < deck.length - 1) {
        currentIndex++;
      } else {
        deck = getFilteredDeck(currentCategory);
        currentIndex = 0;
      }
      renderCard();
    }, 160);
  }

  function initTabs() {
    const tabs = document.getElementById('category-tabs');
    if (!tabs) return;
    tabs.addEventListener('click', e => {
      const tab = e.target.closest('.cat-tab');
      if (!tab) return;
      tabs.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.cat;
      deck = getFilteredDeck(currentCategory);
      currentIndex = 0;
      renderCard();
    });
    const allCount = document.getElementById('all-count');
    if (allCount) allCount.textContent = `(${window.PHRASES.length})`;
  }

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.key) {
      case ' ': e.preventDefault(); doFlip(); break;
      case 'ArrowRight': e.preventDefault(); nextCard(); break;
      case 'ArrowLeft': e.preventDefault(); prevCard(); break;
      case '1': if (isFlipped) doGrade(0); break;
      case '2': if (isFlipped) doGrade(1); break;
      case '3': if (isFlipped) doGrade(2); break;
      case '4': if (isFlipped) doGrade(3); break;
    }
  });

  deck = getFilteredDeck('all');
  initTabs();
  renderSessionHero();
  renderCard();
  updateMasteryBar();
  updateDueBadge();
  updateTripCountdown();
})();
