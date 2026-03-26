// Scroll reveal and nav handling

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");
  const revealSections = document.querySelectorAll(".reveal");
  const achievementRows = document.querySelectorAll(".achievement-row");
  const statNumbers = document.querySelectorAll(".hero-stat-number");

  // IntersectionObserver for section reveal
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          if (entry.target.id === "achievements") {
            achievementRows.forEach((row, index) => {
              setTimeout(() => {
                row.classList.add("revealed");
              }, index * 60);
            });
          }
        }
      });
    },
    { threshold: 0.1 }
  );

  revealSections.forEach((sec) => revealObserver.observe(sec));

  // IntersectionObserver for nav active state
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.dataset.target === id);
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((sec) => navObserver.observe(sec));

  // Stat counters
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statNumbers.forEach((el) => animateCounter(el));
          statsObserver.disconnect();
        }
      });
    },
    { threshold: 0.6 }
  );

  const hero = document.querySelector(".hero-section");
  if (hero) statsObserver.observe(hero);

  // Nav hamburger
  const hamburger = document.querySelector(".nav-hamburger");
  const overlay = document.querySelector(".nav-mobile-overlay");
  const mobileLinks = document.querySelectorAll(".nav-mobile-link");

  if (hamburger && overlay) {
    hamburger.addEventListener("click", () => {
      overlay.classList.toggle("open");
    });
  }

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      overlay.classList.remove("open");
    });
  });
});

function animateCounter(el) {
  const target = parseFloat(el.dataset.target || "0");
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const duration = 1500;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    el.textContent = value.toFixed(decimals);
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

