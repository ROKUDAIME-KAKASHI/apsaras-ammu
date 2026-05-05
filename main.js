const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000' 
  : '';

document.addEventListener('DOMContentLoaded', () => {
  // Page entry animation
  document.body.classList.add('page-visible');

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Set active nav link based on current path
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath === linkPath || (currentPath === '/' && linkPath === '/index.html')) {
      link.classList.add('active');
    }
  });

  // Smooth Page Transitions for internal links
  const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="index.html"], a[href^="services.html"], a[href^="book.html"], a[href^="admin.html"]');
  
  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Ignore hash links and target="_blank"
      if (href.startsWith('#') || link.getAttribute('target') === '_blank') return;
      
      e.preventDefault();
      document.body.classList.add('page-exit');
      
      setTimeout(() => {
        window.location.href = href;
      }, 400); // Matches the 0.5s transition slightly early for snappiness
    });
  });
});
