/**
 * Tabi Tango — Theme manager
 * Must load before paint (inline in <head>) to prevent FOUC.
 */
(function () {
  const STORAGE_KEY = 'tabitango_theme';

  function getPreferred() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    apply(current === 'dark' ? 'light' : 'dark');
    updateIcon();
  }

  function updateIcon() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    const sunEl = btn.querySelector('.icon-sun');
    const moonEl = btn.querySelector('.icon-moon');
    if (sunEl) sunEl.style.display = isDark ? 'block' : 'none';
    if (moonEl) moonEl.style.display = isDark ? 'none' : 'block';
  }

  // Apply immediately to prevent flash
  apply(getPreferred());

  // Expose for HTML onclick
  window.ThemeManager = { toggle, updateIcon };

  // Wire up once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', toggle);
      updateIcon();
    }
  });
})();
