/**
 * Tabi Tango — Quiz Mode
 * Uses safe DOM methods to avoid XSS.
 */
(function () {
  SRS.init();

  let quizQuestions = [];
  let currentQ = 0;
  let score = 0;
  let selectedCategory = 'all';
  let selectedCount = 10;
  let answered = false;

  const LETTERS = ['A', 'B', 'C', 'D'];

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

  function clearRoot() {
    const root = document.getElementById('quiz-root');
    while (root && root.firstChild) root.removeChild(root.firstChild);
    return root;
  }

  // ── Setup ─────────────────────────────────────────────────────────────────────

  function renderSetup() {
    const root = clearRoot();
    if (!root) return;

    const fab = document.getElementById('quiz-fab');
    if (fab) fab.classList.remove('visible');

    const wrap = el('div', { className: 'quiz-setup' });

    const header = el('div', { className: 'quiz-setup-header' });
    header.appendChild(el('h2', {}, 'Quiz Mode'));
    header.appendChild(el('p', {}, 'Multiple-choice questions to test your Japanese recall.'));
    wrap.appendChild(header);

    // Category
    const catField = el('div', { className: 'setup-field' });
    catField.appendChild(el('label', { className: 'setup-label', htmlFor: 'cat-select' }, 'Category'));
    const catSelect = el('select', { className: 'setup-select', id: 'cat-select' });
    [
      { value: 'all', label: 'All Categories' },
      { value: 'greetings', label: 'Greetings & Basics' },
      { value: 'food', label: 'Food & Restaurants' },
      { value: 'shopping', label: 'Shopping' },
      { value: 'directions', label: 'Directions & Transportation' },
      { value: 'emergency', label: 'Emergency & Help' }
    ].forEach(o => {
      catSelect.appendChild(el('option', { value: o.value }, o.label));
    });
    catSelect.value = selectedCategory;
    catSelect.addEventListener('change', () => { selectedCategory = catSelect.value; });
    catField.appendChild(catSelect);
    wrap.appendChild(catField);

    // Count
    const countField = el('div', { className: 'setup-field' });
    countField.appendChild(el('label', { className: 'setup-label', htmlFor: 'count-select' }, 'Questions'));
    const countSelect = el('select', { className: 'setup-select', id: 'count-select' });
    [5, 10, 15, 20].forEach(n => {
      const pool = selectedCategory === 'all'
        ? window.PHRASES.length
        : window.PHRASES.filter(p => p.category === selectedCategory).length;
      if (n <= pool) countSelect.appendChild(el('option', { value: String(n) }, `${n} questions`));
    });
    countSelect.value = String(Math.min(selectedCount, parseInt(countSelect.options[countSelect.options.length - 1].value)));
    countField.appendChild(countSelect);
    wrap.appendChild(countField);

    const startBtn = el('button', { className: 'btn btn-primary' }, 'Start Quiz');
    startBtn.style.marginTop = '0.5rem';
    startBtn.addEventListener('click', () => {
      selectedCategory = catSelect.value;
      selectedCount = parseInt(countSelect.value);
      startQuiz();
    });
    wrap.appendChild(startBtn);
    root.appendChild(wrap);
  }

  // ── Quiz logic ────────────────────────────────────────────────────────────────

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildQuiz(category, count) {
    let pool = category === 'all' ? window.PHRASES : window.PHRASES.filter(p => p.category === category);
    pool = shuffle(pool).slice(0, count);
    return pool.map(phrase => {
      const wrong = shuffle(window.PHRASES.filter(p => p.id !== phrase.id)).slice(0, 3);
      return { phrase, options: shuffle([phrase, ...wrong]) };
    });
  }

  function startQuiz() {
    quizQuestions = buildQuiz(selectedCategory, selectedCount);
    currentQ = 0;
    score = 0;
    answered = false;
    renderQuestion();
  }

  // ── Question ──────────────────────────────────────────────────────────────────

  function renderQuestion() {
    const root = clearRoot();
    if (!root) return;
    if (currentQ >= quizQuestions.length) { renderResults(); return; }

    const { phrase, options } = quizQuestions[currentQ];
    answered = false;

    // Hide FAB when rendering new question
    const fab = document.getElementById('quiz-fab');
    if (fab) fab.classList.remove('visible');

    const wrap = el('div', { className: 'quiz-active' });

    // Header with streak badge and hearts
    const header = el('div', { className: 'quiz-header' });

    const leftSide = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: '1' } });
    leftSide.appendChild(el('span', { className: 'quiz-q-label' }, `Question ${currentQ + 1} of ${quizQuestions.length}`));
    header.appendChild(leftSide);

    const rightSide = el('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' } });

    // Streak badge
    const streak = SRS.getMastery().streak || 0;
    const streakBadge = el('div', { className: 'quiz-header-streak' });
    const fireIcon = document.createElement('span');
    fireIcon.className = 'material-symbols-outlined';
    fireIcon.style.fontVariationSettings = "'FILL' 1";
    fireIcon.textContent = 'local_fire_department';
    streakBadge.appendChild(fireIcon);
    streakBadge.appendChild(el('span', {}, String(streak)));
    rightSide.appendChild(streakBadge);

    // Hearts
    const hearts = el('div', { className: 'quiz-hearts' });
    const lives = 3;
    for (let i = 0; i < 3; i++) {
      const h = document.createElement('span');
      h.className = 'material-symbols-outlined' + (i < lives ? '' : ' empty');
      h.style.fontVariationSettings = i < lives ? "'FILL' 1" : "'FILL' 0";
      h.textContent = 'favorite';
      hearts.appendChild(h);
    }
    rightSide.appendChild(hearts);

    header.appendChild(rightSide);
    wrap.appendChild(header);

    const bar = el('div', { className: 'quiz-progress-bar' });
    bar.appendChild(el('div', {
      className: 'quiz-progress-fill',
      style: { width: `${Math.round((currentQ / quizQuestions.length) * 100)}%` }
    }));
    wrap.appendChild(bar);

    const qCard = el('div', { className: 'quiz-question-card' }, [
      el('div', { className: 'quiz-prompt-label' }, 'What is the Japanese for\u2026'),
      el('div', { className: 'quiz-prompt-text' }, phrase.english)
    ]);
    wrap.appendChild(qCard);

    const optList = el('div', { className: 'quiz-options' });
    const feedbackEl = el('div', { className: 'quiz-feedback', id: 'quiz-feedback' });

    options.forEach((opt, idx) => {
      const btn = el('button', { className: 'quiz-option' });

      const letterBadge = el('div', { className: 'quiz-option-letter' }, LETTERS[idx]);
      btn.appendChild(letterBadge);

      const content = el('div', { className: 'quiz-option-content' });
      content.appendChild(el('span', { className: 'quiz-option-jp' }, opt.japanese));
      content.appendChild(el('span', { className: 'quiz-option-romaji' }, opt.romaji));
      btn.appendChild(content);

      const checkWrap = el('div', { className: 'quiz-option-check' });
      const checkIcon = document.createElement('span');
      checkIcon.className = 'material-symbols-outlined';
      checkIcon.textContent = 'check_circle';
      checkWrap.appendChild(checkIcon);
      btn.appendChild(checkWrap);

      btn.addEventListener('click', () => handleAnswer(opt.id === phrase.id, btn, optList, phrase, feedbackEl));
      optList.appendChild(btn);
    });

    wrap.appendChild(optList);
    wrap.appendChild(feedbackEl);
    root.appendChild(wrap);
  }

  function handleAnswer(isCorrect, clickedBtn, optList, phrase, feedbackEl) {
    if (answered) return;
    answered = true;
    optList.querySelectorAll('.quiz-option').forEach(b => { b.disabled = true; });

    // Mark correct answer
    optList.querySelectorAll('.quiz-option').forEach(b => {
      const jpSpan = b.querySelector('.quiz-option-jp');
      if (jpSpan && jpSpan.textContent === phrase.japanese) b.classList.add('correct');
    });

    if (isCorrect) {
      score++;
      clickedBtn.classList.add('correct');
      feedbackEl.className = 'quiz-feedback show correct';
      feedbackEl.textContent = 'Correct!';
    } else {
      clickedBtn.classList.add('wrong');
      feedbackEl.className = 'quiz-feedback show wrong';
      feedbackEl.textContent = `The answer is: ${phrase.romaji}`;
    }

    // Show FAB button
    const fab = document.getElementById('quiz-fab');
    if (fab) {
      fab.classList.add('visible');
      fab.onclick = () => {
        currentQ++;
        renderQuestion();
        fab.classList.remove('visible');
      };
    }

    // Fallback auto-advance
    setTimeout(() => {
      if (answered) {
        currentQ++;
        renderQuestion();
      }
    }, 1800);
  }

  // ── Results ───────────────────────────────────────────────────────────────────

  function renderResults() {
    const root = clearRoot();
    if (!root) return;

    const fab = document.getElementById('quiz-fab');
    if (fab) fab.classList.remove('visible');

    SRS.recordQuizResult(score, quizQuestions.length, selectedCategory);

    const pct = Math.round((score / quizQuestions.length) * 100);
    const message =
      pct === 100 ? 'Perfect score! You\'re ready for Japan.' :
      pct >= 80   ? 'Excellent work — almost perfect.' :
      pct >= 60   ? 'Good effort. Keep practicing.' :
      pct >= 40   ? 'Keep studying — you\'ll get there.' :
                    'Don\'t give up. Review the flashcards and try again.';

    const wrap = el('div', { className: 'quiz-results' });

    const ring = el('div', { className: 'score-ring' });
    const track = el('div', { className: 'score-ring-track' });
    const deg = Math.round(pct * 3.6);
    track.style.background = `conic-gradient(var(--primary) ${deg}deg, var(--surface-high) 0deg)`;
    track.style.borderRadius = '50%';
    track.style.position = 'absolute';
    track.style.inset = '0';
    ring.appendChild(track);
    ring.appendChild(el('div', { className: 'score-ring-fill' }, [
      el('div', { className: 'score-ring-value' }, `${score}/${quizQuestions.length}`),
      el('div', { className: 'score-ring-label' }, 'correct')
    ]));
    wrap.appendChild(ring);

    wrap.appendChild(el('h2', {}, `${pct}% Correct`));
    wrap.appendChild(el('p', { className: 'result-message' }, message));

    const actions = el('div', { className: 'results-actions' });

    const tryAgain = el('button', { className: 'btn btn-primary' }, 'Try Again');
    tryAgain.addEventListener('click', startQuiz);

    const change = el('button', { className: 'btn btn-secondary' }, 'Change Settings');
    change.addEventListener('click', renderSetup);

    const study = el('a', { className: 'btn btn-secondary', href: 'index.html' }, 'Back to Study');

    actions.appendChild(tryAgain);
    actions.appendChild(change);
    actions.appendChild(study);
    wrap.appendChild(actions);
    root.appendChild(wrap);
  }

  // ── Footer ────────────────────────────────────────────────────────────────────

  function updateFooter() {
    const days = SRS.getTripDaysRemaining();
    const countEl = document.getElementById('trip-countdown');
    if (!countEl) return;
    while (countEl.firstChild) countEl.removeChild(countEl.firstChild);
    const s = document.createElement('strong');
    s.textContent = `${days} day${days !== 1 ? 's' : ''}`;
    countEl.appendChild(s);
    countEl.appendChild(document.createTextNode(' until your Japan trip'));
  }

  function updateDueBadge() {
    const badge = document.getElementById('due-count');
    if (badge) badge.textContent = SRS.getDueCards().length;
  }

  renderSetup();
  updateFooter();
  updateDueBadge();
})();
