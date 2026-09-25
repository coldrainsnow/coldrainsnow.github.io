/* =============================================================================
   academic.js — document behaviours
   · builds the table of contents (inline block + floating outline)
   · tracks the section currently being read and shows its name
   · reading progress bar
   · back-to-top button
   ========================================================================== */

(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    var body = document.getElementById('doc-body');
    var headings = body
      ? Array.prototype.slice.call(body.querySelectorAll('h2, h3'))
      : [];

    var toc = document.getElementById('doc-toc');
    var tocList = document.getElementById('doc-toc-list');
    var outline = document.getElementById('doc-outline');
    var outlineList = document.getElementById('outline-list');
    var outlineToggle = document.getElementById('outline-toggle');
    var outlinePanel = document.getElementById('outline-panel');
    var outlineCurrent = document.getElementById('outline-current');
    var progress = document.getElementById('read-progress');

    /* Stable ids up front, so both lists can link to the same anchors. */
    headings.forEach(function (heading, index) {
      if (!heading.id) {
        heading.id = 'section-' + (index + 1);
      }
    });

    /* ---- build a nested <ol> (h3s grouped under the preceding h2) ---- */
    function buildList(listEl) {
      var links = [];
      var linkById = {};
      var subList = null;

      headings.forEach(function (heading) {
        var item = document.createElement('li');
        item.className = heading.tagName === 'H3' ? 'toc-h3' : 'toc-h2';

        var link = document.createElement('a');
        link.setAttribute('href', '#' + heading.id);
        link.textContent = heading.textContent.trim();
        item.appendChild(link);

        if (heading.tagName === 'H3') {
          /* nest sub-headings inside the current section */
          if (!subList) {
            subList = document.createElement('ol');
            subList.className = 'toc-sub';
            (listEl.lastElementChild || listEl).appendChild(subList);
          }
          subList.appendChild(item);
        } else {
          listEl.appendChild(item);
          subList = null;
        }

        links.push(link);
        linkById[heading.id] = link;
      });

      return { links: links, linkById: linkById };
    }

    var tocLinks = null;
    var outlineLinks = null;

    if (headings.length >= 3) {
      if (toc && tocList) {
        tocLinks = buildList(tocList);
        toc.hidden = false;
        /* long articles start collapsed so the TOC never buries the content */
        toc.open = headings.length <= 12;
      }
      if (outline && outlineList) {
        outlineLinks = buildList(outlineList);
        outline.hidden = false;
      }
    }

    /* ---- reflect the active section everywhere ---- */
    var paint = function (activeId) {
      [tocLinks, outlineLinks].forEach(function (set) {
        if (!set) {
          return;
        }
        set.links.forEach(function (link) {
          link.classList.remove('is-active');
        });
        if (activeId && set.linkById[activeId]) {
          set.linkById[activeId].classList.add('is-active');
        }
      });

      if (outlineCurrent) {
        var active = activeId ? document.getElementById(activeId) : null;
        outlineCurrent.textContent = active ? active.textContent.trim() : '正文';
      }

      /* keep the highlighted row visible inside an open outline */
      if (
        activeId &&
        outlineLinks &&
        outline &&
        outline.classList.contains('is-open') &&
        outlineLinks.linkById[activeId]
      ) {
        outlineLinks.linkById[activeId].scrollIntoView({ block: 'nearest' });
      }
    };

    /* ---- follow the heading currently being read ----
       A "reading line" 15% down the viewport decides the active section: it is
       the last heading whose top has crossed that line. An IntersectionObserver
       band looks tempting but goes blank *between* two headings, which made the
       label flip back to "正文" while you were still inside a section. */
    if (headings.length && (tocLinks || outlineLinks || outlineCurrent)) {
      var tops = [];
      var lastActive = null;
      var lastMeasure = 0;

      var measure = function () {
        tops = headings.map(function (heading) {
          return {
            id: heading.id,
            top: heading.getBoundingClientRect().top + window.pageYOffset
          };
        });
        lastMeasure = Date.now();
      };

      var sync = function () {
        /* heading positions move while the webfont swaps in and images load,
           so refresh them periodically instead of trusting a one-time measure */
        if (Date.now() - lastMeasure > 400) {
          measure();
        }

        var line = window.pageYOffset + window.innerHeight * 0.15;
        var current = null;

        for (var i = 0; i < tops.length; i += 1) {
          if (tops[i].top <= line) {
            current = tops[i].id;
          } else {
            break;
          }
        }

        /* at the very bottom the last heading may never reach the reading line,
           so the label would otherwise stay stuck on the second-to-last section */
        if (
          tops.length &&
          window.pageYOffset + window.innerHeight >=
            document.documentElement.scrollHeight - 4
        ) {
          current = tops[tops.length - 1].id;
        }

        if (current === lastActive) {
          return;
        }
        lastActive = current;
        paint(current);
      };

      /* sync() is cheap — it early-returns unless the section actually changed,
         and the expensive measure() is throttled — so no rAF indirection here.
         rAF is not serviced in every context (headless, background tabs) and
         dropping it keeps the indicator correct rather than silently stale. */
      var remeasure = function () {
        measure();
        sync();
      };

      measure();
      sync();
      window.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', remeasure);
      window.addEventListener('load', remeasure);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(remeasure);
      }
    }

    /* ---- floating outline panel ---- */
    if (outline && outlineToggle && outlinePanel) {
      var setOpen = function (open) {
        outline.classList.toggle('is-open', open);
        outlineToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      };

      outlineToggle.addEventListener('click', function () {
        setOpen(!outline.classList.contains('is-open'));
      });

      /* jumping to a section closes the panel — you want to read, not browse */
      outlinePanel.addEventListener('click', function (event) {
        if (event.target.closest('a')) {
          setOpen(false);
        }
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && outline.classList.contains('is-open')) {
          setOpen(false);
          outlineToggle.focus();
        }
      });

      document.addEventListener('click', function (event) {
        if (
          outline.classList.contains('is-open') &&
          !outline.contains(event.target)
        ) {
          setOpen(false);
        }
      });
    }

    /* ---- reading progress ---- */
    if (progress && body) {
      var updateProgress = function () {
        var rect = body.getBoundingClientRect();
        var start = rect.top + window.pageYOffset;
        var total = body.offsetHeight - window.innerHeight;
        var ratio = total > 0 ? (window.pageYOffset - start) / total : 0;

        if (ratio < 0) {
          ratio = 0;
        }
        if (ratio > 1) {
          ratio = 1;
        }

        progress.style.transform = 'scaleX(' + ratio + ')';
        progress.classList.toggle('is-visible', ratio > 0.01 && ratio < 0.995);
      };

      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress);
      updateProgress();
    }

    /* ---- back to top ---- */
    var button = document.getElementById('back-to-top');
    if (button) {
      var toggle = function () {
        button.classList.toggle('is-visible', window.pageYOffset > 320);
      };

      window.addEventListener('scroll', toggle, { passive: true });
      toggle();

      button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  });
})();
