// Hero name and terminal typewriter

document.addEventListener("DOMContentLoaded", () => {
  animateHeroName();
  startTerminalSequence();
  startHeroInitAndRole();
});

function animateHeroName() {
  const words = document.querySelectorAll(".hero-name-word");
  words.forEach((word, index) => {
    setTimeout(() => {
      word.style.transition = "transform 0.6s ease, opacity 0.6s ease";
      word.style.transform = "translateY(0)";
      word.style.opacity = "1";
    }, 400 + index * 200);
  });

  const underline = document.querySelector(".hero-name-underline");
  if (underline) {
    setTimeout(() => {
      underline.style.transition = "transform 0.5s ease";
      underline.style.transform = "scaleX(1)";
    }, 900);
  }
}

function startHeroInitAndRole() {
  const initEl = document.querySelector(".hero-init-label");
  const roleEl = document.querySelector(".hero-role");

  if (!initEl || !roleEl) return;

  const sequenceText = initEl.dataset.sequence || "> INITIALIZING PORTFOLIO...";
  typeText(initEl, sequenceText, 40, () => {
    setTimeout(() => {
      initEl.style.opacity = "0";
      const roleText = roleEl.dataset.text || "";
      setTimeout(() => {
        typeText(roleEl, roleText, 40);
      }, 200);
    }, 1500);
  });
}

function startTerminalSequence() {
  const el = document.getElementById("terminal-sequence");
  if (!el) return;

  const lines = [
    "$ whoami",
    "→ suraj_kumar",
    "",
    "$ cat role.txt",
    "→ AI & Data Science Engineer",
    "→ Sri Sairam Institute of Technology",
    "",
    "$ ls interests/",
    "→ machine_learning/  deep_learning/",
    "→ web_development/   devops/",
    "→ android_dev/       open_source/",
    "",
    "$ status",
    "→ Available for internships ✓",
    "→ Location: Chennai, India",
    "→ CGPA: 7.73",
    "",
  ];

  const fullText = lines.join("\n");
  typeText(el, fullText, 35);
}

function typeText(element, text, speed, callback) {
  let index = 0;
  element.textContent = "";

  function step() {
    element.textContent = text.slice(0, index);
    index++;
    if (index <= text.length) {
      setTimeout(step, speed);
    } else if (callback) {
      callback();
    }
  }

  step();
}

