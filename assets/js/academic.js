/* =============================================================================
   academic.js — document behaviours
   · builds the article's table of contents
   · highlights the section currently being read
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

    /* Stable ids up front, so the TOC links have anchors to point at. */
    headings.forEach(function (heading, index) {
      if (!heading.id) {
        heading.id = 'section-' + (index + 1);
      }
    });

    /* ---- build a nested <ol> (h3s grouped under the preceding h2) ---- */
    var tocLinks = null;

    if (headings.length >= 3 && toc && tocList) {
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
            (tocList.lastElementChild || tocList).appendChild(subList);
          }
          subList.appendChild(item);
        } else {
          tocList.appendChild(item);
          subList = null;
        }

        links.push(link);
        linkById[heading.id] = link;
      });

      tocLinks = { links: links, linkById: linkById };
      toc.hidden = false;
      /* long articles start collapsed so the TOC never buries the content */
      toc.open = headings.length <= 12;
    }

    /* ---- highlight the section currently being read ----
       A "reading line" 15% down the viewport decides the active section: it is
       the last heading whose top has crossed that line. An IntersectionObserver
       band looks tempting but goes blank *between* two headings, which dropped
       the highlight while you were still inside a section. */
    if (tocLinks) {
      var tops = null;
      var lastActive = null;

      var paint = function (activeId) {
        tocLinks.links.forEach(function (link) {
          link.classList.remove('is-active');
        });
        if (activeId && tocLinks.linkById[activeId]) {
          tocLinks.linkById[activeId].classList.add('is-active');
        }
      };

      var measure = function () {
        tops = headings.map(function (heading) {
          return {
            id: heading.id,
            top: heading.getBoundingClientRect().top + window.pageYOffset
          };
        });
      };

      var sync = function () {
        if (!tops) {
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
           so the highlight would otherwise stay stuck on the second-to-last one */
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

      /* Invalidate, then re-decide. */
      var refresh = function () {
        tops = null;
        sync();
      };

      /* Scrolling never moves a heading, so the measured positions stay valid
         the whole time you read — only a *layout* change invalidates them.
         Re-measuring on every scroll event would cost one
         getBoundingClientRect() per heading per frame (85 calls here); instead
         we measure once and re-measure only when something actually reflows.
         A time-based throttle is not good enough: for the rest of the window
         the highlight points at the wrong section after a font swap, an image
         finishing, or the TOC being opened. */
      sync();
      window.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', refresh);
      window.addEventListener('load', refresh);
      if (toc) {
        /* expanding the TOC pushes the whole article down */
        toc.addEventListener('toggle', refresh);
      }
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(refresh);
      }
      if (window.ResizeObserver && body) {
        /* catches anything that reflows the article: webfont swap, images
           decoding, content changes. Observing .doc-body rather than <body>
           keeps the TOC's own highlight from feeding back into a loop. */
        new ResizeObserver(refresh).observe(body);
      }
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
