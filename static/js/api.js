// API integration: projects, skills, contact, copy-to-clipboard, admin actions

document.addEventListener("DOMContentLoaded", () => {
  initProjects();
  initSkills();
  initContactForm();
  initCopyToClipboard();
  initAdminActions();
});

function initProjects() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  const buttons = document.querySelectorAll(".filter-btn");

  async function load(tag = "ALL") {
    try {
      const res = await fetch(`/api/projects?tag=${encodeURIComponent(tag)}`);
      const data = await res.json();
      renderProjects(grid, data, tag);
    } catch (e) {
      console.error("Failed to load projects", e);
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tag = btn.dataset.tag || "ALL";
      load(tag);
    });
  });

  load("ALL");
}

function renderProjects(container, projects, activeTag) {
  container.innerHTML = "";
  projects.forEach((p) => {
    const card = document.createElement("article");
    card.className = "project-card highlighted";

    const dotClass = p.dot || "green";

    card.innerHTML = `
      <div class="project-top">
        <span class="project-dot ${dotClass}"></span>
        <span class="project-date">${p.date}</span>
      </div>
      <div class="project-name">${p.name}</div>
      <div class="project-desc">${p.description}</div>
      <div class="project-divider"></div>
      <div class="project-tags">
        ${(p.tags || [])
          .map((t) => `<span class="tag-pill">${t}</span>`)
          .join("")}
      </div>
      <div class="project-bottom">
        ${p.view_url ? `<a href="${p.view_url}" target="_blank" rel="noreferrer" class="project-link">→ VIEW PROJECT</a>` : ''}
        ${p.github_url ? `<a href="${p.github_url}" target="_blank" rel="noreferrer" class="project-link">GITHUB ↗</a>` : ''}
      </div>
    `;

    // Apply dimming/highlight effect relative to filter selection
    if (activeTag && activeTag !== "ALL") {
      const tagsUpper = (p.tags || []).map((t) => t.toUpperCase());
      const match =
        activeTag === p.category ||
        tagsUpper.includes(activeTag.toUpperCase());
      if (!match) {
        card.classList.remove("highlighted");
        card.classList.add("dimmed");
      }
    }

    container.appendChild(card);
  });
}

function initSkills() {
  const groups = document.querySelectorAll(".skill-group");
  if (!groups.length) return;

  fetch("/api/skills")
    .then((res) => res.json())
    .then((data) => {
      groups.forEach((group) => {
        const key = group.dataset.group;
        const body = group.querySelector(".skill-group-body");
        const skills = data[key] || [];
        body.innerHTML = skills
          .map(
            (s) => `
          <div class="skill-row" data-level="${s.level}">
            <div class="skill-row-header">
              <span>${s.name}</span>
              <span>${s.level}%</span>
            </div>
            <div class="skill-bar-track">
              <div class="skill-bar-fill"></div>
            </div>
          </div>
        `
          )
          .join("");

        // Set initial height for smooth collapse
        const bodyHeight = body.scrollHeight;
        body.style.height = bodyHeight + "px";
      });

      setupSkillAnimations();
    })
    .catch((e) => console.error("Failed to load skills", e));

  groups.forEach((group) => {
    const header = group.querySelector(".skill-group-header");
    const body = group.querySelector(".skill-group-body");
    const toggle = group.querySelector(".skill-toggle");
    header.addEventListener("click", () => {
      const isOpen = body.style.height && body.style.height !== "0px";
      if (isOpen) {
        body.style.height = "0px";
        toggle.textContent = "+";
      } else {
        body.style.height = body.scrollHeight + "px";
        toggle.textContent = "−";
      }
    });
  });
}

function setupSkillAnimations() {
  const rows = document.querySelectorAll(".skill-row");
  if (!rows.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const row = entry.target;
          const level = parseInt(row.dataset.level || "0", 10);
          const fill = row.querySelector(".skill-bar-fill");
          if (fill) {
            fill.style.transition = "width 1s ease-out";
            fill.style.width = level + "%";
          }
          observer.unobserve(row);
        }
      });
    },
    { threshold: 0.4 }
  );

  rows.forEach((row) => observer.observe(row));
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const errorEl = document.getElementById("contact-error");
  const successEl = document.getElementById("contact-success");
  if (!errorEl || !successEl) return;
  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    // Reset previous errors
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(el => {
      el.style.borderColor = "";
      const errEl = el.parentNode.querySelector('.err-msg');
      if (errEl) errEl.remove();
    });

    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => payload[key] = value.trim());

    // Validation
    let isValid = true;
    const showError = (name, msg) => {
      isValid = false;
      const el = form.querySelector(`[name="${name}"]`);
      if (el) {
        el.style.borderColor = "var(--error)";
        let errDiv = document.createElement('div');
        errDiv.className = 'err-msg';
        errDiv.style.color = 'var(--error)';
        errDiv.style.fontSize = '12px';
        errDiv.style.marginTop = '4px';
        errDiv.textContent = msg;
        el.parentNode.appendChild(errDiv);
      }
    };

    if (!payload.name) showError('name', 'Name is required');
    if (!payload.email) showError('email', 'Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) showError('email', 'Invalid email format');
    if (!payload.subject) showError('subject', 'Subject is required');
    if (!payload.message || payload.message.length < 10) showError('message', 'Message must be at least 10 characters');

    if (!isValid) return;

    if (btn) {
        const origText = btn.textContent;
        btn.textContent = "SENDING...";
        btn.disabled = true;
    }

    try {
      const res = await fetch("/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (btn) {
          btn.textContent = "SEND MESSAGE";
          btn.disabled = false;
      }

      if (!data.success) {
        errorEl.textContent = data.error || "Something went wrong.";
        return;
      }

      form.reset();
      form.style.opacity = "0";
      form.style.pointerEvents = "none";
      successEl.classList.add("visible");

      if (window.notifyContactSent) {
        try { window.notifyContactSent(); } catch (e) { console.error(e); }
      }
    } catch (err) {
      console.error(err);
      if (btn) {
          btn.textContent = "SEND MESSAGE";
          btn.disabled = false;
      }
      errorEl.textContent = "Failed to send message.";
    }
  });
}

function initCopyToClipboard() {
  const items = document.querySelectorAll(".contact-item");
  items.forEach((item) => {
    const value = item.dataset.copy;
    const tooltip = item.querySelector(".copy-tooltip");
    item.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(value);
        if (tooltip) {
          tooltip.classList.add("visible");
          setTimeout(() => tooltip.classList.remove("visible"), 1500);
        }
      } catch (e) {
        console.error("Clipboard error", e);
      }
    });
  });
}

function initAdminActions() {
  const table = document.querySelector(".admin-table");
  if (!table) return;

  table.addEventListener("click", async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const row = target.closest("tr[data-id]");
    if (!row) return;
    const id = row.getAttribute("data-id");

    if (target.classList.contains("mark-read")) {
      await adminPost(`/admin/message/${id}/read`, () => {
        const statusCell = row.querySelector(".message-status");
        if (statusCell) {
          statusCell.innerHTML = '<span class="badge-read">READ</span>';
        }
        target.remove();
      });
    }
  });
}

async function adminPost(url, onSuccess) {
  try {
    const res = await fetch(url, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      onSuccess();
    } else {
      console.error("Admin action failed", data);
    }
  } catch (e) {
    console.error("Admin action error", e);
  }
}

