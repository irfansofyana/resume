// Table of Contents Navigation and Scroll Spy
// =============================================

document.addEventListener('DOMContentLoaded', function() {
  const toc = document.getElementById('toc');
  const tocToggle = document.getElementById('toc-toggle');
  const tocList = document.getElementById('toc-list');
  const tocLinks = document.querySelectorAll('.toc-list a');
  const sections = document.querySelectorAll('.content-section[id]');
  
  if (!toc || !tocLinks.length || !sections.length) return;
  
  // Mobile toggle functionality
  if (tocToggle) {
    tocToggle.addEventListener('click', function(e) {
      e.preventDefault();
      toc.classList.toggle('expanded');
      tocToggle.classList.toggle('active');
    });
  }
  
  // Smooth scrolling for TOC links
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        // Calculate offset to account for any fixed elements
        const offset = 20; // Adjust this value as needed
        const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;
        
        // Smooth scroll to target
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Close mobile menu if expanded
        if (window.innerWidth <= 768) {
          toc.classList.remove('expanded');
          if (tocToggle) tocToggle.classList.remove('active');
        }
        
        // Update active link
        updateActiveLink(targetId);
      }
    });
  });
  
  // Scroll spy functionality
  function updateActiveLink(activeId) {
    tocLinks.forEach(link => {
      const linkSection = link.getAttribute('data-section');
      if (linkSection === activeId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  // Intersection Observer for scroll spy
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px', // Trigger when section is 20% from top
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    let currentActiveId = null;
    
    // Find the section that's most visible
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        currentActiveId = entry.target.id;
      }
    });
    
    // If we have an active section, update the TOC
    if (currentActiveId) {
      updateActiveLink(currentActiveId);
    }
  }, observerOptions);
  
  // Observe all sections
  sections.forEach(section => {
    observer.observe(section);
  });
  
  // Handle window resize
  window.addEventListener('resize', function() {
    // Close mobile menu on resize to larger screen
    if (window.innerWidth > 768) {
      toc.classList.remove('expanded');
      if (tocToggle) tocToggle.classList.remove('active');
    }
  });
  
  // Initialize with first section active
  if (sections.length > 0) {
    updateActiveLink(sections[0].id);
  }
});
