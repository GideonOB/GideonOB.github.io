(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ------------------
     MOBILE NAV
  ------------------ */
  const toggleBtn = $(".navbar__toggle-btn");
  const nav = $(".navbar__links");

  const setNavState = (open) => {
    if (!nav || !toggleBtn) return;
    nav.classList.toggle("is-open", open);
    toggleBtn.setAttribute("aria-expanded", String(open));
  };

  toggleBtn?.addEventListener("click", () => {
    setNavState(!nav.classList.contains("is-open"));
  });

  nav?.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    if (window.matchMedia("(max-width: 900px)").matches) setNavState(false);
  });

  const header = $(".site-header");
  const aboutHighlights = $(".about-highlights");
  const mobileAbout = window.matchMedia("(max-width: 680px)");

  const syncAboutHighlights = ({ matches }) => {
    if (!aboutHighlights) return;
    aboutHighlights.toggleAttribute("open", !matches);
  };

  syncAboutHighlights(mobileAbout);
  mobileAbout.addEventListener?.("change", syncAboutHighlights);

  const backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.type = "button";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.innerHTML = "↑";
  document.body.append(backToTop);

  const updateScrollUI = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
    backToTop.classList.toggle("is-visible", window.scrollY > 700);
  };
  window.addEventListener("scroll", updateScrollUI, { passive: true });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  updateScrollUI();

  /* ------------------
     PORTFOLIO SLIDESHOW
  ------------------ */
  const slides = $$(".mySlides");
  const dots = $$(".dot");
  const prev = $(".prev");
  const next = $(".next");
  let idx = 1;

  const show = (n) => {
    if (!slides.length) return;
    idx = n > slides.length ? 1 : n < 1 ? slides.length : n;

    slides.forEach(s => (s.style.display = "none"));
    dots.forEach(d => d.classList.remove("is-active"));

    slides[idx - 1].style.display = "block";
    dots[idx - 1]?.classList.add("is-active");
  };

  prev?.addEventListener("click", () => show(idx - 1));
  next?.addEventListener("click", () => show(idx + 1));
  dots.forEach(d => d.addEventListener("click", () => show(Number(d.dataset.slide))));

  /* ------------------
     TIMELINE TABS
  ------------------ */
  const tabButtons = $$(".timeline-tab");
  const panels = {
    academic: $("#panel-academic"),
    professional: $("#panel-professional"),
    entrepreneurial: $("#panel-entrepreneurial"),
    leadership: $("#panel-leadership"),
    awards: $("#panel-awards"),
  };

  const activateTab = (key) => {
    tabButtons.forEach(b => {
      const on = b.dataset.key === key;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", String(on));
    });
    Object.entries(panels).forEach(([k, p]) => p?.classList.toggle("is-active", k === key));
  };

  $(".timeline-tabs")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".timeline-tab");
    if (btn?.dataset.key) activateTab(btn.dataset.key);
  });

  $(".timeline-tabs")?.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const current = tabButtons.indexOf(document.activeElement);
    const direction = e.key === "ArrowRight" ? 1 : -1;
    const target = tabButtons[(current + direction + tabButtons.length) % tabButtons.length];
    target?.focus();
    if (target?.dataset.key) activateTab(target.dataset.key);
  });

  /* ------------------
     CONTACT FORMSPREE
  ------------------ */
  const form = $("#contact-form");
  const status = $("#my-form-status");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try{
      const res = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        status && (status.textContent = "Thanks for your submission!");
        form.reset();
        return;
      }

      const data = await res.json().catch(() => ({}));
      const msg = data?.errors?.map(x => x.message).join(", ")
        || "Oops! There was a problem submitting your form";
      status && (status.textContent = msg);

    } catch {
      status && (status.textContent = "Oops! There was a problem submitting your form");
    }
  });


/* ------------------
   RESUME MODAL
------------------ */
const modal = $("#resumeModal");
const resumeFrame = modal?.querySelector("#resumeFrame");

const openResume = (e) => {
  e?.preventDefault();
  if (!modal) return;

  if (resumeFrame) {
    resumeFrame.src = "theresume.pdf#page=1&zoom=page-fit";
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeResume = () => {
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

$$(".js-resume").forEach((a) => a.addEventListener("click", openResume));

modal?.addEventListener("click", (e) => {
  if (e.target.closest("[data-close]")) closeResume();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeResume();
});


  /* ------------------
     INIT
  ------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    show(idx);
    activateTab("academic");
    $("#current-year") && ($("#current-year").textContent = new Date().getFullYear());

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    $$(".reveal").forEach(element => revealObserver.observe(element));

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$(".navbar__links a[href^='#']").forEach(link => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-35% 0px -55%" });
    $$("main section[id]").forEach(section => sectionObserver.observe(section));
  });
})();
