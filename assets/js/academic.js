/* =============================================================================
   academic.js — document behaviours
   · builds the table of contents from the article headings
   · highlights the heading currently in view
   · shows / hides the back-to-top button
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
    var toc = document.getElementById('doc-toc');
    var tocList = document.getElementById('doc-toc-list');
    var headings = body
      ? Array.prototype.slice.call(body.querySelectorAll('h2, h3'))
      : [];

    /* ---- table of contents ---- */
    if (toc && tocList && headings.length >= 3) {
      var links = [];
      var linkById = {};
      var subList = null;

      headings.forEach(function (heading, index) {
        if (!heading.id) {
          heading.id = 'section-' + (index + 1);
        }

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

      toc.hidden = false;
      /* long articles start collapsed so the TOC never buries the content */
      toc.open = headings.length <= 12;

      /* ---- highlight the current heading ---- */
      if ('IntersectionObserver' in window) {
        var visible = {};
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              visible[entry.target.id] = entry.isIntersecting;
            });

            var current = null;
            for (var i = 0; i < headings.length; i += 1) {
              if (visible[headings[i].id]) {
                current = headings[i].id;
                break;
              }
            }

            links.forEach(function (link) {
              link.classList.remove('is-active');
            });
            if (current && linkById[current]) {
              linkById[current].classList.add('is-active');
            }
          },
          { rootMargin: '-10% 0px -75% 0px', threshold: 0 }
        );

        headings.forEach(function (heading) {
          observer.observe(heading);
        });
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
