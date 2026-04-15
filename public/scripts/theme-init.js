(function() {
  try {
    const storage = JSON.parse(localStorage.getItem('health-os-storage'));
    const theme = (storage && storage.state && storage.state.theme) || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})()
