// App Page JavaScript
// Tab functionality for App Overview section

document.addEventListener('DOMContentLoaded', function() {
  // Tab functionality
  const tabs = document.querySelectorAll('#app-tabs button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');

      // Update tab buttons
      tabs.forEach(t => {
        t.classList.remove('active', 'border-rose-600', 'text-rose-600');
        t.classList.add('border-transparent');
        t.setAttribute('aria-selected', 'false');
      });

      this.classList.add('active', 'border-rose-600', 'text-rose-600');
      this.classList.remove('border-transparent');
      this.setAttribute('aria-selected', 'true');

      // Update tab panes
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        pane.classList.add('hidden');
      });

      const activePane = document.getElementById(tabId);
      if (activePane) {
        activePane.classList.add('active');
        activePane.classList.remove('hidden');
      }
    });
  });
});
