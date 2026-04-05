/**
 * Tabi Tango — Spaced Repetition System
 * Manages all learning state in localStorage under key "tabitango_v1"
 */
(function () {
  const STORAGE_KEY = 'tabitango_v1';

  function today() {
    return new Date().toISOString().split('T')[0];
  }

  function addDays(dateStr, n) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  }

  function daysBetween(a, b) {
    const msPerDay = 86400000;
    return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / msPerDay);
  }

  function freshCardState() {
    return {
      interval: 1,
      nextReview: today(),
      easeFactor: 2.5,
      reps: 0,
      lapses: 0,
      lastSeen: null,
      mastered: false
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return null;
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function buildFreshState() {
    const cards = {};
    window.PHRASES.forEach(p => { cards[p.id] = freshCardState(); });
    return {
      tripStartDate: today(),
      cards,
      quizHistory: [],
      dailyReviews: {},   // { "2026-04-05": { reviewed: 5, correct: 3 } }
      dailyStreak: 0,
      lastStudyDate: null
    };
  }

  function init() {
    let state = loadState();
    if (!state) {
      state = buildFreshState();
      saveState(state);
    } else {
      // Ensure any new phrases added to data.js get a card entry
      window.PHRASES.forEach(p => {
        if (!state.cards[p.id]) state.cards[p.id] = freshCardState();
      });
      saveState(state);
    }
    return state;
  }

  function getDueCards() {
    const state = loadState();
    const t = today();
    const due = window.PHRASES
      .filter(p => {
        const c = state.cards[p.id];
        return !c.lastSeen || c.nextReview <= t;
      })
      .map(p => p.id);

    // Sort: never seen first, then overdue oldest first, then due today
    due.sort((a, b) => {
      const ca = state.cards[a];
      const cb = state.cards[b];
      if (!ca.lastSeen && !cb.lastSeen) return 0;
      if (!ca.lastSeen) return -1;
      if (!cb.lastSeen) return 1;
      return ca.nextReview < cb.nextReview ? -1 : 1;
    });

    return due;
  }

  function gradeCard(id, remembered) {
    const state = loadState();
    const card = state.cards[id];
    const t = today();

    if (remembered) {
      card.reps += 1;
      card.interval = Math.min(Math.round(card.interval * card.easeFactor), 30);
      card.easeFactor = Math.min(card.easeFactor + 0.1, 3.0);
      card.mastered = card.interval >= 21;
    } else {
      card.lapses += 1;
      card.interval = 1;
      card.easeFactor = Math.max(card.easeFactor - 0.2, 1.3);
      card.mastered = false;
    }

    card.nextReview = addDays(t, card.interval);
    card.lastSeen = t;

    // Track daily reviews
    if (!state.dailyReviews[t]) state.dailyReviews[t] = { reviewed: 0, correct: 0 };
    state.dailyReviews[t].reviewed += 1;
    if (remembered) state.dailyReviews[t].correct += 1;

    // Update streak
    if (state.lastStudyDate !== t) {
      if (state.lastStudyDate && daysBetween(state.lastStudyDate, t) === 1) {
        state.dailyStreak += 1;
      } else if (state.lastStudyDate && daysBetween(state.lastStudyDate, t) > 1) {
        state.dailyStreak = 1;
      } else {
        state.dailyStreak = Math.max(1, state.dailyStreak);
      }
      state.lastStudyDate = t;
    }

    saveState(state);
  }

  function getMastery() {
    const state = loadState();
    const total = window.PHRASES.length;
    let mastered = 0;
    const byCategory = {};

    Object.keys(window.CATEGORIES).forEach(cat => {
      byCategory[cat] = { total: 0, mastered: 0, seen: 0 };
    });

    window.PHRASES.forEach(p => {
      const c = state.cards[p.id];
      if (c.mastered) mastered += 1;
      byCategory[p.category].total += 1;
      if (c.mastered) byCategory[p.category].mastered += 1;
      if (c.lastSeen) byCategory[p.category].seen += 1;
    });

    return { total, mastered, byCategory, streak: state.dailyStreak };
  }

  function recordQuizResult(score, total, category) {
    const state = loadState();
    state.quizHistory.push({
      date: today(),
      score,
      total,
      category
    });
    saveState(state);
  }

  function getCalendarData() {
    const state = loadState();
    const start = state.tripStartDate;
    const days = [];
    for (let i = 0; i < 30; i++) {
      const d = addDays(start, i);
      const reviews = state.dailyReviews[d];
      days.push({
        date: d,
        reviewed: reviews ? reviews.reviewed : 0,
        correct: reviews ? reviews.correct : 0
      });
    }
    return { days, tripStartDate: start, tripEndDate: addDays(start, 30) };
  }

  function getTripDaysRemaining() {
    const state = loadState();
    const tripDate = addDays(state.tripStartDate, 30);
    const remaining = daysBetween(today(), tripDate);
    return Math.max(0, remaining);
  }

  function getReadinessScore() {
    const state = loadState();
    const mastery = getMastery();
    const masteryPct = mastery.mastered / mastery.total;
    const streakPct = Math.min(state.dailyStreak / 30, 1);

    const recentQuizzes = state.quizHistory.slice(-5);
    const quizAvg = recentQuizzes.length
      ? recentQuizzes.reduce((s, q) => s + q.score / q.total, 0) / recentQuizzes.length
      : 0;

    return Math.round(masteryPct * 60 + streakPct * 20 + quizAvg * 20);
  }

  function resetProgress() {
    localStorage.removeItem(STORAGE_KEY);
    return init();
  }

  window.SRS = {
    init,
    getDueCards,
    gradeCard,
    getMastery,
    recordQuizResult,
    getCalendarData,
    getTripDaysRemaining,
    getReadinessScore,
    resetProgress,
    loadState
  };
})();
