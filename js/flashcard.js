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
  let swipeBlocked = false; // suppress tap-to-flip after a completed swipe

  // ── DOM helper ───────────────────────────────────────────────────────────────

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

  // ── Helpers ──────────────────────────────────────────────────────────────────

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
    if (text) text.textContent = `${m.mastered} / ${m.total} phrases`;
  }

  function updateTripCountdown() {
    const days = SRS.getTripDaysRemaining();
    const el2 = document.getElementById('trip-countdown');
    if (!el2) return;
    while (el2.firstChild) el2.removeChild(el2.firstChild);
    if (days === 0) {
      const s = document.createElement('strong');
      s.textContent = 'Your Japan trip is today — がんばって!';
      el2.appendChild(s);
    } else {
      const s = document.createElement('strong');
      s.textContent = `${days} day${days !== 1 ? 's' : ''}`;
      el2.appendChild(document.createTextNode(''));
      el2.appendChild(s);
      el2.appendChild(document.createTextNode(' until your Japan trip'));
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  function renderCard() {
    const root = document.getElementById('flashcard-root');
    if (!root) return;
    while (root.firstChild) root.removeChild(root.firstChild);

    if (deck.length === 0) {
      root.appendChild(el('div', { className: 'empty-state' }, [
        el('div', { className: 'empty-icon' }, '—'),
        el('h3', {}, 'No phrases here'),
        el('p', {}, 'Select a different category to continue.')
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

    // Difficulty segments
    const diffBar = el('div', { className: 'difficulty-bar' });
    for (let n = 1; n <= 3; n++) {
      diffBar.appendChild(el('span', { className: 'difficulty-seg' + (n <= phrase.difficulty ? ' on' : '') }));
    }

    // Front face
    const front = el('div', { className: 'card-face card-front' }, [
      el('span', { className: 'card-category-label' }, cat.label),
      el('div', { className: 'card-english' }, phrase.english),
      el('div', { className: 'card-flip-hint' }, 'Tap to reveal')
    ]);

    // Back face
    const backChildren = [
      diffBar,
      el('div', { className: 'card-japanese' }, phrase.japanese),
      el('div', { className: 'card-romaji' }, phrase.romaji)
    ];
    if (phrase.notes) backChildren.push(el('div', { className: 'card-notes' }, phrase.notes));
    const back = el('div', { className: 'card-face card-back' }, backChildren);

    const flipCard = el('div', { className: 'card', id: 'flip-card' }, [front, back]);
    const container = el('div', { className: 'card-container', id: 'card-container' }, flipCard);

    // Grade buttons
    const btnForgot = el('button', { className: 'btn-forgot', id: 'btn-forgot' }, 'Forgot');
    const btnRemembered = el('button', { className: 'btn-remembered', id: 'btn-remembered' }, 'Remembered');
    const gradeButtons = el('div', { className: 'grade-buttons', id: 'grade-buttons' }, [btnForgot, btnRemembered]);

    // Nav
    const btnPrev = el('button', { className: 'btn-nav', id: 'btn-prev' }, '←');
    const btnNext = el('button', { className: 'btn-nav', id: 'btn-next' }, '→');
    if (currentIndex === 0) btnPrev.disabled = true;
    if (currentIndex === deck.length - 1) btnNext.disabled = true;
    const lastSeenText = cardState.lastSeen ? `Last seen ${cardState.lastSeen}` : 'New card';
    const nav = el('div', { className: 'card-nav' }, [
      btnPrev,
      el('span', { className: 'card-last-seen' }, lastSeenText),
      btnNext
    ]);

    const area = el('div', { className: 'card-area' }, [counter, container, gradeButtons, nav]);
    root.appendChild(area);

    isFlipped = false;
    attachListeners();
  }

  function attachListeners() {
    const card = document.getElementById('flip-card');
    const container = document.getElementById('card-container');
    const btnForgot = document.getElementById('btn-forgot');
    const btnRemembered = document.getElementById('btn-remembered');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (card) card.addEventListener('click', doFlip);
    if (btnForgot) btnForgot.addEventListener('click', e => { e.stopPropagation(); grade(false); });
    if (btnRemembered) btnRemembered.addEventListener('click', e => { e.stopPropagation(); grade(true); });
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
        // Only hijack horizontal swipes
        if (!dragging && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
          dragging = true;
        }
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
          // Swipe left → next card
          swipeBlocked = true;
          container.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
          container.style.transform = 'translateX(-110%)';
          container.style.opacity = '0';
          setTimeout(() => { currentIndex++; renderCard(); }, 240);
        } else if (dragX > THRESHOLD && canPrev) {
          // Swipe right → prev card
          swipeBlocked = true;
          container.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
          container.style.transform = 'translateX(110%)';
          container.style.opacity = '0';
          setTimeout(() => { currentIndex--; renderCard(); }, 240);
        } else {
          // Snap back
          container.style.transition = 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.35s ease';
          container.style.transform = '';
          container.style.opacity = '';
        }
      }, { passive: true });
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  function doFlip() {
    if (swipeBlocked) { swipeBlocked = false; return; }
    const card = document.getElementById('flip-card');
    const btns = document.getElementById('grade-buttons');
    if (!card) return;
    isFlipped = !isFlipped;
    card.classList.toggle('flipped', isFlipped);
    if (btns) btns.classList.toggle('visible', isFlipped);
  }

  function nextCard() {
    if (currentIndex < deck.length - 1) { currentIndex++; renderCard(); }
  }

  function prevCard() {
    if (currentIndex > 0) { currentIndex--; renderCard(); }
  }

  function grade(remembered) {
    SRS.gradeCard(deck[currentIndex].id, remembered);
    updateMasteryBar();
    updateDueBadge();
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

  // ── Category tabs ─────────────────────────────────────────────────────────────

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

  // ── Keyboard ──────────────────────────────────────────────────────────────────

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.key) {
      case ' ': e.preventDefault(); doFlip(); break;
      case 'ArrowRight': e.preventDefault(); nextCard(); break;
      case 'ArrowLeft': e.preventDefault(); prevCard(); break;
      case '1': if (isFlipped) grade(true); break;
      case '2': if (isFlipped) grade(false); break;
    }
  });

  // ── Init ──────────────────────────────────────────────────────────────────────

  deck = getFilteredDeck('all');
  initTabs();
  renderCard();
  updateMasteryBar();
  updateDueBadge();
  updateTripCountdown();
})();
