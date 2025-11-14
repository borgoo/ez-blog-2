class ThemeManager {
  constructor() {
    this.theme = this.getInitialTheme();
    this.applyTheme(this.theme);
  }

  getInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.updateToggleButton(theme);
    localStorage.setItem('theme', theme);
    this.theme = theme;
  }

  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  updateToggleButton(theme) {
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.textContent = theme === 'light' ? '🌙' : '☀️';
      toggleButton.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
    }
  }
}

const themeManager = new ThemeManager();

document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('theme-toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      themeManager.toggleTheme();
    });
  }
});

if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      themeManager.applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

