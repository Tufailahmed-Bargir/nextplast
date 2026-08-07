(() => {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");
  const menuToggle = document.getElementById("menuToggle");
  const searchInput = document.getElementById("docSearch");
  const sections = Array.from(document.querySelectorAll("section.doc-section"));
  const navLinks = Array.from(document.querySelectorAll(".nav-list a"));
  const searchEmpty = document.getElementById("searchEmpty");
  const printBtn = document.getElementById("printBtn");

  function closeSidebar() {
    sidebar?.classList.remove("open");
    backdrop?.classList.remove("show");
  }

  function openSidebar() {
    sidebar?.classList.add("open");
    backdrop?.classList.add("show");
  }

  menuToggle?.addEventListener("click", () => {
    if (sidebar?.classList.contains("open")) closeSidebar();
    else openSidebar();
  });

  backdrop?.addEventListener("click", closeSidebar);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => closeSidebar());
  });

  printBtn?.addEventListener("click", () => window.print());

  function setActiveNav() {
    const fromTop = window.scrollY + 120;
    let current = sections[0]?.id;
    for (const section of sections) {
      if (section.offsetTop <= fromTop && !section.classList.contains("hidden-by-search")) {
        current = section.id;
      }
    }
    navLinks.forEach((link) => {
      const href = link.getAttribute("href")?.slice(1);
      link.classList.toggle("active", href === current);
    });
  }

  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  function clearMarks(root) {
    root.querySelectorAll("mark.mark").forEach((el) => {
      const parent = el.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(el.textContent || ""), el);
      parent.normalize();
    });
  }

  function highlightText(node, query) {
    if (!query) return;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.parentElement) return NodeFilter.FILTER_REJECT;
        const tag = n.parentElement.tagName;
        if (["SCRIPT", "STYLE", "MARK"].includes(tag)) return NodeFilter.FILTER_REJECT;
        if (!n.textContent || !n.textContent.toLowerCase().includes(query)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((textNode) => {
      const text = textNode.textContent || "";
      const lower = text.toLowerCase();
      const idx = lower.indexOf(query);
      if (idx < 0) return;
      const before = text.slice(0, idx);
      const match = text.slice(idx, idx + query.length);
      const after = text.slice(idx + query.length);
      const frag = document.createDocumentFragment();
      if (before) frag.appendChild(document.createTextNode(before));
      const mark = document.createElement("mark");
      mark.className = "mark";
      mark.textContent = match;
      frag.appendChild(mark);
      if (after) frag.appendChild(document.createTextNode(after));
      textNode.parentNode?.replaceChild(frag, textNode);
    });
  }

  function runSearch() {
    const q = (searchInput?.value || "").trim().toLowerCase();
    let visible = 0;

    sections.forEach((section) => {
      clearMarks(section);
      if (!q) {
        section.classList.remove("hidden-by-search");
        visible += 1;
        return;
      }
      const hay = section.textContent?.toLowerCase() || "";
      const match = hay.includes(q);
      section.classList.toggle("hidden-by-search", !match);
      if (match) {
        visible += 1;
        highlightText(section, q);
      }
    });

    searchEmpty?.classList.toggle("visible", Boolean(q) && visible === 0);
    setActiveNav();
  }

  let debounce;
  searchInput?.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(runSearch, 160);
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchInput?.focus();
      searchInput?.select();
    }
    if (e.key === "Escape") {
      if (searchInput?.value) {
        searchInput.value = "";
        runSearch();
      }
      closeSidebar();
    }
  });
})();
