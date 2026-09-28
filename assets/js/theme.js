(() => {
  const button = document.getElementById('theme-toggle');
  if (!button) return;
  document.documentElement.classList.add('theme-ready');

  function render() {
    const dark = document.documentElement.dataset.theme === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.textContent = dark ? 'Light mode' : 'Dark mode';
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  render();
  button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('resume-theme', next); } catch (error) { /* Still switch in-memory. */ }
    render();
  });
})();
