/* Valoria London theme — vanilla JavaScript, no dependencies. */
(function () {
  'use strict';

  var V = window.Valoria || { routes: {}, strings: {} };
  var root = (V.routes.root || '/').replace(/\/?$/, '/');

  /* ---------- Helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait);
    };
  }
  function parseHTML(html) { return new DOMParser().parseFromString(html, 'text/html'); }
  function announce(msg) {
    var region = $('[data-live-region]');
    if (!region) return;
    region.textContent = '';
    setTimeout(function () { region.textContent = msg; }, 50);
  }
  function fetchJSON(url, opts) {
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) {
          var err = new Error(data.description || data.message || V.strings.cartError);
          err.data = data;
          throw err;
        }
        return data;
      });
    });
  }
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /* ---------- Overlay panels (drawers, search, filters) ---------- */
  var overlay = $('[data-overlay]');
  var openPanel = null;
  var lastTrigger = null;

  function trapFocus(e) {
    if (!openPanel || e.key !== 'Tab') return;
    var items = $$(FOCUSABLE, openPanel).filter(function (el) { return el.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(panel, trigger) {
    if (!panel) return;
    if (openPanel && openPanel !== panel) close(false);
    openPanel = panel;
    lastTrigger = trigger || document.activeElement;
    panel.classList.add('is-open');
    if (panel.closest('.shopify-section-header')) document.body.classList.add('header-panel-open');
    if (overlay) overlay.hidden = false;
    document.body.classList.add('is-locked');
    $$('[aria-controls="' + panel.id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    setTimeout(function () {
      var focusTarget = $('[data-predictive-input]', panel) || $('.search-form__input', panel) || panel;
      focusTarget.focus({ preventScroll: true });
    }, 60);
    document.addEventListener('keydown', trapFocus);
  }

  function close(restoreFocus) {
    if (!openPanel) return;
    var panel = openPanel;
    panel.classList.remove('is-open');
    document.body.classList.remove('header-panel-open');
    $$('[aria-controls="' + panel.id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (overlay) overlay.hidden = true;
    document.body.classList.remove('is-locked');
    document.removeEventListener('keydown', trapFocus);
    openPanel = null;
    if (restoreFocus !== false && lastTrigger && lastTrigger.focus) lastTrigger.focus({ preventScroll: true });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (openPanel) close();
      $$('[data-nav-details][open]').forEach(function (d) { d.removeAttribute('open'); });
    }
  });
  if (overlay) overlay.addEventListener('click', function () { close(); });

  document.addEventListener('click', function (e) {
    var t = e.target;
    var opener = t.closest('[data-drawer-open]');
    if (opener) { e.preventDefault(); open(document.getElementById(opener.getAttribute('data-drawer-open')), opener); return; }
    if (t.closest('[data-drawer-close], [data-search-close], [data-facets-close]')) {
      if (t.closest('[data-facets-close]') && t.closest('form') && t.type === 'submit') { e.preventDefault(); }
      close();
      return;
    }
    var searchOpen = t.closest('[data-search-open]');
    if (searchOpen) { e.preventDefault(); open($('[data-search-modal]'), searchOpen); return; }
    var facetsOpen = t.closest('[data-facets-open]');
    if (facetsOpen) { e.preventDefault(); open($('[data-facets-panel]'), facetsOpen); return; }
    var cartOpen = t.closest('[data-cart-open]');
    if (cartOpen && $('[data-cart-drawer]')) { e.preventDefault(); open($('[data-cart-drawer]'), cartOpen); return; }
    // Close desktop dropdowns when clicking elsewhere
    $$('[data-nav-details][open]').forEach(function (d) { if (!d.contains(t)) d.removeAttribute('open'); });
  });

  // Only one dropdown open at a time
  $$('[data-nav-details]').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) $$('[data-nav-details][open]').forEach(function (o) { if (o !== d) o.removeAttribute('open'); });
    });
  });

  /* ---------- Announcement bar ---------- */
  $$('[data-announcement]').forEach(function (bar) {
    var msgs = $$('.announcement__message', bar);
    if (msgs.length < 2 || bar.dataset.rotate !== 'true') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var i = 0, speed = (parseInt(bar.dataset.speed, 10) || 6) * 1000, paused = false;
    bar.addEventListener('mouseenter', function () { paused = true; });
    bar.addEventListener('mouseleave', function () { paused = false; });
    bar.addEventListener('focusin', function () { paused = true; });
    bar.addEventListener('focusout', function () { paused = false; });
    setInterval(function () {
      if (paused) return;
      msgs[i].classList.remove('is-active');
      i = (i + 1) % msgs.length;
      msgs[i].classList.add('is-active');
    }, speed);
  });

  /* ---------- Quantity steppers ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-qty-change]');
    if (!btn) return;
    var wrap = btn.closest('[data-quantity]');
    var input = wrap && $('input', wrap);
    if (!input) return;
    var step = parseInt(input.step, 10) || 1;
    var min = input.min !== '' ? parseInt(input.min, 10) : 0;
    var max = input.max ? parseInt(input.max, 10) : Infinity;
    var val = (parseInt(input.value, 10) || 0) + step * parseInt(btn.dataset.qtyChange, 10);
    val = Math.max(min, Math.min(max, val));
    if (String(val) === input.value) return;
    input.value = val;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /* ---------- Cart ---------- */
  function cartSectionIds() {
    var ids = ['cart-icon-bubble'];
    if ($('[data-cart-drawer]')) ids.push('cart-drawer');
    var page = $('[data-cart-page]');
    if (page) ids.push(page.dataset.sectionId);
    return ids;
  }

  function renderCartSections(sections) {
    if (!sections) return;
    if (sections['cart-icon-bubble']) {
      var bubbleDoc = parseHTML(sections['cart-icon-bubble']);
      var src = bubbleDoc.querySelector('.shopify-section') || bubbleDoc.body;
      $$('#cart-icon-bubble').forEach(function (el) { el.innerHTML = src.innerHTML; });
    }
    if (sections['cart-drawer']) {
      var d = parseHTML(sections['cart-drawer']);
      var fresh = d.querySelector('[data-cart-drawer]');
      var current = $('[data-cart-drawer]');
      if (fresh && current) {
        current.innerHTML = fresh.innerHTML;
      }
    }
    var page = $('[data-cart-page]');
    if (page && sections[page.dataset.sectionId]) {
      var p = parseHTML(sections[page.dataset.sectionId]);
      var freshPage = p.querySelector('[data-cart-page]');
      if (freshPage) page.innerHTML = freshPage.innerHTML;
    }
    document.dispatchEvent(new CustomEvent('valoria:cart-updated'));
  }

  function addToCart(form, submitter) {
    var btn = submitter || $('[type="submit"]', form);
    var errorEl = $('[data-form-error]', form.closest('[data-product]') || form);
    var fd = new FormData(form);
    if (submitter && submitter.name === 'id' && submitter.value) fd.set('id', submitter.value);
    fd.append('sections', cartSectionIds().join(','));
    fd.append('sections_url', window.location.pathname);
    if (btn) { btn.classList.add('is-loading'); btn.setAttribute('aria-disabled', 'true'); }
    if (errorEl) { errorEl.hidden = true; errorEl.textContent = ''; }

    return fetchJSON(V.routes.cartAdd + '.js', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: fd
    }).then(function (data) {
      if (V.cartType === 'page' || !$('[data-cart-drawer]')) {
        window.location.href = V.routes.cart;
        return;
      }
      renderCartSections(data.sections);
      announce(V.strings.added);
      open($('[data-cart-drawer]'), btn);
    }).catch(function (err) {
      var msg = (err && err.message) || V.strings.cartError;
      if (errorEl) { errorEl.textContent = msg; errorEl.hidden = false; }
      else { announce(msg); window.alert(msg); }
    }).finally(function () {
      if (btn) { btn.classList.remove('is-loading'); btn.removeAttribute('aria-disabled'); }
    });
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form.matches('[data-product-form], [data-quick-add]')) {
      e.preventDefault();
      var submitter = e.submitter || (document.activeElement && document.activeElement.form === form ? document.activeElement : null);
      if (submitter && submitter.hasAttribute('data-sticky-button')) submitter = $('[data-add-button]', form) || submitter;
      addToCart(form, submitter);
    }
  });

  function changeLine(line, quantity, itemEl) {
    var container = itemEl ? itemEl.closest('[data-cart-items]') : null;
    if (itemEl) itemEl.classList.add('is-updating');
    return fetchJSON(V.routes.cartChange + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ line: line, quantity: quantity, sections: cartSectionIds(), sections_url: window.location.pathname })
    }).then(function (data) {
      var requested = quantity;
      renderCartSections(data.sections);
      if (itemEl && data.items) {
        var match = data.items.filter(function (i) { return i.key === itemEl.dataset.key; })[0];
        if (match && match.quantity < requested) {
          var fresh = document.querySelector('[data-key="' + itemEl.dataset.key + '"] [data-line-error]');
          if (fresh) { fresh.textContent = V.strings.quantityError; fresh.hidden = false; }
        }
      }
    }).catch(function (err) {
      if (itemEl) {
        itemEl.classList.remove('is-updating');
        var el = $('[data-line-error]', itemEl);
        if (el) { el.textContent = err.message; el.hidden = false; }
      }
    });
  }

  document.addEventListener('change', debounce(function (e) {
    var input = e.target;
    if (!input.matches || !input.matches('[data-line-quantity]')) return;
    changeLine(parseInt(input.dataset.lineQuantity, 10), parseInt(input.value, 10) || 0, input.closest('.cart-item'));
  }, 350));

  document.addEventListener('click', function (e) {
    var rm = e.target.closest('[data-line-remove]');
    if (!rm) return;
    e.preventDefault();
    changeLine(parseInt(rm.dataset.lineRemove, 10), 0, rm.closest('.cart-item'));
  });

  document.addEventListener('change', debounce(function (e) {
    if (!e.target.matches || !e.target.matches('[data-cart-note]')) return;
    fetch(V.routes.cartUpdate + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ note: e.target.value })
    });
  }, 400));

  /* ---------- Variant picker ---------- */
  $$('[data-variant-picker]').forEach(function (picker) {
    var productEl = picker.closest('[data-product]');
    var sectionId = productEl.dataset.sectionId;
    var productUrl = productEl.dataset.productUrl;
    var jsonEl = $('[data-variants]', picker);
    var variants = jsonEl ? JSON.parse(jsonEl.textContent) : [];
    var form = $('[data-product-form]', productEl);
    var abort;

    function selectedOptions() {
      var positions = {};
      $$('[data-option-position]', picker).forEach(function (el) {
        var pos = el.dataset.optionPosition;
        if (el.type === 'radio') { if (el.checked) positions[pos] = el.value; }
        else positions[pos] = el.value;
      });
      return Object.keys(positions).sort().map(function (k) { return positions[k]; });
    }

    function findVariant(opts) {
      return variants.filter(function (v) {
        return v.options.every(function (o, i) { return o === opts[i]; });
      })[0];
    }

    function setButtonState(available, label) {
      $$('[data-add-button], [data-sticky-button]', document).forEach(function (b) {
        if (!productEl.contains(b) && !b.hasAttribute('data-sticky-button')) return;
        b.disabled = !available;
        b.textContent = label;
      });
    }

    function onChange() {
      var opts = selectedOptions();
      opts.forEach(function (val, i) {
        var label = $('[data-selected-value="' + i + '"]', picker);
        if (label) label.textContent = val;
      });
      var variant = findVariant(opts);
      if (!variant) {
        setButtonState(false, V.strings.unavailable);
        return;
      }
      var idInput = form && $('[data-variant-id]', form);
      if (idInput) { idInput.value = variant.id; idInput.dispatchEvent(new Event('change', { bubbles: true })); }
      var url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());

      if (variant.featured_media) scrollGalleryTo(productEl, variant.featured_media.id);

      if (abort) abort.abort();
      abort = typeof AbortController !== 'undefined' ? new AbortController() : null;
      fetch(productUrl + (productUrl.indexOf('?') > -1 ? '&' : '?') + 'variant=' + variant.id + '&section_id=' + sectionId, abort ? { signal: abort.signal } : {})
        .then(function (r) { return r.text(); })
        .then(function (html) {
          var doc = parseHTML(html);
          $$('[data-update]', productEl).forEach(function (el) {
            var fresh = doc.getElementById(el.id);
            if (!fresh) return;
            if (el.dataset.update === 'buy') {
              // keep the shopper's quantity
              var qty = $('input[name="quantity"]', el);
              var keep = qty ? qty.value : null;
              el.innerHTML = fresh.innerHTML;
              var newQty = $('input[name="quantity"]', el);
              if (newQty && keep) newQty.value = keep;
            } else {
              el.innerHTML = fresh.innerHTML;
            }
          });
          // availability marks on option buttons
          $$('input[data-option-position]', picker).forEach(function (input) {
            var freshInput = doc.getElementById(input.id);
            if (freshInput) input.className = freshInput.className;
          });
          var sku = $('[data-sku]', productEl), freshSku = doc.querySelector('[data-sku]');
          if (sku && freshSku) sku.textContent = freshSku.textContent;
          var stickyPrice = $('[data-sticky-price]'), freshSticky = doc.querySelector('[data-sticky-price]');
          if (stickyPrice && freshSticky) stickyPrice.textContent = freshSticky.textContent;
          var stickyBtn = $('[data-sticky-button]');
          if (stickyBtn) {
            stickyBtn.disabled = !variant.available;
            stickyBtn.textContent = variant.available ? V.strings.addToCart : V.strings.soldOut;
          }
        })
        .catch(function () { /* aborted or offline: leave current state */ });
    }

    picker.addEventListener('change', function (e) {
      if (e.target.matches('[data-option-position]')) onChange();
    });
  });

  /* ---------- Gallery ---------- */
  function scrollGalleryTo(productEl, mediaId) {
    var item = $('[data-media-id="' + mediaId + '"]', productEl);
    var viewport = item && item.closest('[data-gallery-viewport]');
    if (!item || !viewport) return;
    var gallery = viewport.closest('[data-gallery]');
    var isGrid = gallery && gallery.classList.contains('gallery--grid');
    if (isGrid && window.matchMedia('(min-width: 990px)').matches) {
      // Stacked grid on desktop: move the variant image to the front
      if (viewport.firstElementChild !== item) viewport.insertBefore(item, viewport.firstElementChild);
    } else {
      viewport.scrollTo({ left: item.offsetLeft - viewport.offsetLeft, behavior: 'smooth' });
    }
  }

  function initGallery(gallery) {
    if (gallery.dataset.ready) return;
    gallery.dataset.ready = '1';
    var viewport = $('[data-gallery-viewport]', gallery);
    if (!viewport) return;
    var dots = $$('[data-gallery-dot]', gallery);
    var thumbs = $$('[data-gallery-thumb]', gallery);
    function goTo(i) {
      var item = viewport.children[i];
      if (item) viewport.scrollTo({ left: item.offsetLeft - viewport.offsetLeft, behavior: 'smooth' });
    }
    function current() { return Math.round(viewport.scrollLeft / (viewport.clientWidth || 1)); }
    viewport.addEventListener('scroll', debounce(function () {
      var idx = current();
      dots.forEach(function (d, i) { d.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
      thumbs.forEach(function (t, i) {
        t.setAttribute('aria-current', i === idx ? 'true' : 'false');
        if (i === idx && t.parentNode && t.parentNode.parentNode && t.parentNode.parentNode.scrollTo) {
          var list = t.parentNode.parentNode;
          list.scrollTo({ top: t.parentNode.offsetTop - list.clientHeight / 3, behavior: 'smooth' });
        }
      });
    }, 60));
    dots.forEach(function (dot, i) { dot.addEventListener('click', function () { goTo(i); }); });
    thumbs.forEach(function (t, i) { t.addEventListener('click', function () { goTo(i); }); });
    var prev = $('[data-gallery-prev]', gallery), next = $('[data-gallery-next]', gallery);
    var count = viewport.children.length;
    if (prev) prev.addEventListener('click', function () { goTo((current() - 1 + count) % count); });
    if (next) next.addEventListener('click', function () { goTo((current() + 1) % count); });
    viewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(Math.min(count - 1, current() + 1)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(Math.max(0, current() - 1)); }
    });
  }

  var zoomDialog = $('[data-zoom-dialog]');
  if (zoomDialog && typeof zoomDialog.showModal === 'function') {
    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-zoom-open]');
      if (opener) {
        zoomDialog.showModal();
        document.body.classList.add('is-locked');
        var target = $('[data-zoom-index="' + opener.dataset.zoomOpen + '"]', zoomDialog);
        if (target) setTimeout(function () { target.scrollIntoView({ block: 'start' }); }, 30);
      }
      if (e.target.closest('[data-zoom-close]')) zoomDialog.close();
    });
    zoomDialog.addEventListener('close', function () { document.body.classList.remove('is-locked'); });
    zoomDialog.addEventListener('click', function (e) { if (e.target === zoomDialog) zoomDialog.close(); });
  } else {
    $$('[data-zoom-open]').forEach(function (b) { b.hidden = true; });
  }

  /* ---------- Sticky add to bag (mobile) ---------- */
  var sticky = $('[data-sticky-atc]');
  var mainButton = $('[data-add-button]');
  if (sticky && mainButton && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var entry = entries[0];
      var past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      sticky.classList.toggle('is-visible', past);
      sticky.setAttribute('aria-hidden', past ? 'false' : 'true');
      var b = $('[data-sticky-button]', sticky);
      if (b) b.tabIndex = past ? 0 : -1;
    }).observe(mainButton.closest('.buy') || mainButton);
  }

  /* ---------- Predictive search ---------- */
  var pInput = $('[data-predictive-input]');
  var pResults = $('[data-predictive-results]');
  if (pInput && pResults && V.routes.predictiveSearch) {
    var pAbort;
    var activeIndex = -1;
    var search = debounce(function () {
      var q = pInput.value.trim();
      if (q.length < 2) { pResults.innerHTML = ''; pInput.setAttribute('aria-expanded', 'false'); return; }
      if (pAbort) pAbort.abort();
      pAbort = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var url = V.routes.predictiveSearch + '?q=' + encodeURIComponent(q) +
        '&resources[type]=product,collection,page,article,query&resources[limit]=6&resources[options][fields]=title,product_type,variants.title,vendor,tag' +
        '&section_id=predictive-search';
      fetch(url, pAbort ? { signal: pAbort.signal } : {})
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (html) {
          var doc = parseHTML(html);
          var res = doc.getElementById('predictive-search-results');
          pResults.innerHTML = res ? res.outerHTML : '';
          pInput.setAttribute('aria-expanded', res ? 'true' : 'false');
          activeIndex = -1;
        })
        .catch(function () {});
    }, 250);
    pInput.addEventListener('input', search);
    pInput.addEventListener('keydown', function (e) {
      var items = $$('.predictive__item', pResults);
      if (!items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = e.key === 'ArrowDown' ? (activeIndex + 1) % items.length : (activeIndex - 1 + items.length) % items.length;
        items.forEach(function (it, i) { it.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false'); });
        var li = items[activeIndex].closest('[role="option"]');
        if (li) pInput.setAttribute('aria-activedescendant', li.id);
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && activeIndex > -1) {
        e.preventDefault();
        window.location.href = items[activeIndex].href;
      }
    });
  }

  /* ---------- Collection & search filtering ---------- */
  function initFacets() {
    var container = $('[data-collection-container]');
    if (!container) return;
    var sectionId = container.dataset.sectionId;

    function render(url, push) {
      var results = $('[data-collection-results]', container);
      if (results) results.classList.add('is-loading');
      var wasOpen = !!($('[data-facets-panel]') && $('[data-facets-panel]').classList.contains('is-open'));
      var fetchUrl = url + (url.indexOf('?') > -1 ? '&' : '?') + 'section_id=' + sectionId;
      fetch(fetchUrl)
        .then(function (r) { return r.text(); })
        .then(function (html) {
          var doc = parseHTML(html);
          var fresh = doc.querySelector('[data-collection-container]');
          if (!fresh) { window.location.href = url; return; }
          var openDetails = $$('.facet details', container).map(function (d) { return d.open; });
          container.innerHTML = fresh.innerHTML;
          $$('.facet details', container).forEach(function (d, i) { if (typeof openDetails[i] === 'boolean') d.open = openDetails[i]; });
          var panel = $('[data-facets-panel]');
          if (wasOpen && panel) { openPanel = null; open(panel); }
          if (push) window.history.pushState({ facets: true }, '', url);
          var count = $('.toolbar__count', container);
          if (count) announce(count.textContent);
          bindFacets();
        })
        .catch(function () { window.location.href = url; });
    }

    function urlFromForm(form) {
      var fd = new FormData(form);
      var params = new URLSearchParams();
      fd.forEach(function (value, key) { if (value !== '') params.append(key, value); });
      var base = form.getAttribute('action') || window.location.pathname;
      return base + '?' + params.toString();
    }

    function bindFacets() {
      var form = $('[data-facets-form]', container);
      var sort = $('[data-sort-select]', container);
      if (form) {
        var onFormChange = debounce(function () { render(urlFromForm(form), true); }, 450);
        form.addEventListener('change', onFormChange);
        form.addEventListener('submit', function (e) { e.preventDefault(); render(urlFromForm(form), true); });
      }
      if (sort) {
        sort.addEventListener('change', function () {
          if (form) {
            var hidden = $('[data-sort-hidden]', form);
            if (hidden) hidden.value = sort.value;
            render(urlFromForm(form), true);
          } else {
            var u = new URL(window.location.href);
            u.searchParams.set('sort_by', sort.value);
            u.searchParams.delete('page');
            render(u.pathname + u.search, true);
          }
        });
      }
    }

    container.addEventListener('click', function (e) {
      var link = e.target.closest('[data-facet-link], [data-facets-clear]');
      if (!link || !link.href) return;
      e.preventDefault();
      render(link.getAttribute('href'), true);
      if (link.closest('.pagination')) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    window.addEventListener('popstate', function (e) {
      if (e.state && e.state.facets) render(window.location.pathname + window.location.search, false);
    });

    bindFacets();
  }
  initFacets();

  /* ---------- Product recommendations ---------- */
  $$('[data-recommendations]').forEach(function (el) {
    var url = el.dataset.url;
    if (!url) return;
    var load = function () {
      fetch(url).then(function (r) { return r.text(); }).then(function (html) {
        var doc = parseHTML(html);
        var fresh = doc.querySelector('[data-recommendations]');
        if (fresh && fresh.innerHTML.trim()) el.innerHTML = fresh.innerHTML;
        else el.hidden = true;
      }).catch(function () {});
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { io.disconnect(); load(); }
      }, { rootMargin: '400px 0px' });
      io.observe(el);
    } else load();
  });

  /* ---------- Recently viewed ---------- */
  var RV_KEY = 'valoria:recently-viewed';
  function readRecent() {
    try { return JSON.parse(window.localStorage.getItem(RV_KEY)) || []; } catch (e) { return []; }
  }
  var productEl = $('[data-product]');
  var currentHandle = productEl ? productEl.dataset.productHandle : null;
  if (currentHandle) {
    try {
      var list = readRecent().filter(function (h) { return h !== currentHandle; });
      list.unshift(currentHandle);
      window.localStorage.setItem(RV_KEY, JSON.stringify(list.slice(0, 12)));
    } catch (e) { /* storage unavailable */ }
  }
  $$('[data-recently-viewed]').forEach(function (section) {
    var limit = parseInt(section.dataset.limit, 10) || 6;
    var handles = readRecent().filter(function (h) { return h !== currentHandle; }).slice(0, limit);
    var listEl = $('[data-recently-viewed-list]', section);
    if (!handles.length || !listEl) return;
    Promise.all(handles.map(function (h) {
      return fetch(root + 'products/' + encodeURIComponent(h) + '?section_id=product-card-render')
        .then(function (r) { return r.ok ? r.text() : ''; })
        .catch(function () { return ''; });
    })).then(function (htmls) {
      var count = 0;
      htmls.forEach(function (html) {
        if (!html) return;
        var card = parseHTML(html).querySelector('.product-card');
        if (!card) return;
        var li = document.createElement('li');
        li.appendChild(card);
        listEl.appendChild(li);
        count++;
      });
      if (count) section.hidden = false;
    });
  });

  /* ---------- Shop by category tabs ---------- */
  function initTabs(wrap) {
    if (wrap.dataset.ready) return;
    wrap.dataset.ready = '1';
    var tabs = $$('[role="tab"]', wrap);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      if (tab.scrollIntoView) {
        var bar = tab.parentNode;
        if (bar && bar.scrollTo) bar.scrollTo({ left: tab.offsetLeft - bar.clientWidth / 2 + tab.clientWidth / 2, behavior: 'smooth' });
      }
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  }

  /* ---------- Carousels ---------- */
  function initCarousel(wrap) {
    if (wrap.dataset.ready) return;
    var track = $('[data-carousel-track]', wrap);
    var prev = $('[data-carousel-prev]', wrap), next = $('[data-carousel-next]', wrap);
    if (!track) return;
    wrap.dataset.ready = '1';
    function gap() { return parseFloat(getComputedStyle(track).columnGap) || 16; }
    function step() { var item = track.firstElementChild; return item ? item.getBoundingClientRect().width + gap() : track.clientWidth; }
    function update() {
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', debounce(update, 60));
    window.addEventListener('resize', debounce(update, 150));
    update();
  }

  /* ---------- Reveal on scroll ---------- */
  var revealObserver = null;
  function initReveal(scope) {
    var items = $$('.reveal:not(.is-visible)', scope);
    if (!items.length) return;
    var animate = document.body.classList.contains('has-animations') && !document.body.classList.contains('reveal-none') && 'IntersectionObserver' in window;
    if (!animate) { items.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-visible'); revealObserver.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px' });
    }
    items.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Scent finder ---------- */
  function initFinder(section) {
    if (section.dataset.ready) return;
    section.dataset.ready = '1';
    var form = $('[data-finder-form]', section);
    var result = $('[data-finder-result]', section);
    if (!form || !result) return;
    var list = $('[data-finder-products]', result);
    var title = $('[data-finder-title]', result);
    var note = $('[data-finder-note]', result);
    var link = $('[data-finder-link]', result);
    var errorEl = $('[data-finder-error]', section);
    var cache = {};

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var family = $('[data-finder-family]:checked', form);
      var audience = $('[data-finder-audience]:checked', form);
      if (!family) { if (errorEl) errorEl.hidden = false; var first = $('[data-finder-family]', form); if (first) first.focus(); return; }
      if (errorEl) errorEl.hidden = true;
      var btn = $('[type="submit"]', form);
      if (btn) btn.classList.add('is-loading');
      var url = family.dataset.url;
      var load = cache[url] ? Promise.resolve(cache[url]) : fetch(url + (url.indexOf('?') > -1 ? '&' : '?') + 'section_id=finder-results')
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (html) { cache[url] = html; return html; });
      load.then(function (html) {
        var doc = parseHTML(html);
        var items = $$('[data-finder-items] > li', doc);
        var aud = audience ? audience.value : '';
        var matches = aud ? items.filter(function (li) { return (li.getAttribute('data-collections') || '').indexOf(' ' + aud + ' ') > -1; }) : items;
        var broadened = false;
        if (aud && !matches.length) { matches = items; broadened = true; }
        list.innerHTML = '';
        matches.slice(0, 4).forEach(function (li) { list.appendChild(document.importNode(li, true)); });
        var familyTitle = family.dataset.title || '';
        var audLabel = audience && audience.value ? (audience.dataset.label || '') : '';
        title.textContent = audLabel && !broadened ? familyTitle + ', ' + audLabel.charAt(0).toLowerCase() + audLabel.slice(1) : familyTitle;
        if (!matches.length) { note.textContent = V.strings.finderEmpty; note.hidden = false; }
        else if (broadened) { note.textContent = V.strings.finderBroadened; note.hidden = false; }
        else { note.hidden = true; }
        if (link) {
          link.href = url;
          var span = $('span', link);
          if (span) span.textContent = (V.strings.finderExplore || '').replace('__TITLE__', familyTitle);
        }
        result.hidden = false;
        result.focus({ preventScroll: true });
        result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        announce(title.textContent);
      }).catch(function () {
        window.location.href = url;
      }).finally(function () { if (btn) btn.classList.remove('is-loading'); });
    });
    section.addEventListener('click', function (e) {
      if (!e.target.closest('[data-finder-reset]')) return;
      result.hidden = true;
      form.reset();
      var first = $('[data-finder-audience], [data-finder-family]', form);
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (first) first.focus({ preventScroll: true });
    });
  }

  /* ---------- Component boot (also re-run inside the theme editor) ---------- */
  function initComponents(scope) {
    scope = scope || document;
    $$('[data-shop-tabs]', scope).forEach(initTabs);
    $$('[data-carousel]', scope).forEach(initCarousel);
    $$('[data-gallery]', scope).forEach(initGallery);
    $$('[data-finder]', scope).forEach(initFinder);
    initReveal(scope);
  }
  initComponents(document);

  /* ---------- Customer pages ---------- */
  var recover = $('[data-recover-panel]'), login = $('[data-login-panel]');
  if (recover && login) {
    var showRecover = function (on) { recover.hidden = !on; login.hidden = on; };
    if (window.location.hash === '#recover' || $('.form-message', recover)) showRecover(true);
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-toggle-recover]');
      if (!t) return;
      e.preventDefault();
      showRecover(recover.hidden);
    });
  }
  $$('select[data-default]').forEach(function (sel) {
    if (sel.dataset.default) sel.value = sel.dataset.default;
  });

  /* ---------- Header: solid on scroll, hover menus ---------- */
  var headerWrap = $('[data-header]');
  if (headerWrap) {
    var onScroll = function () { headerWrap.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  var hoverQuery = window.matchMedia('(hover: hover) and (min-width: 990px)');
  $$('[data-nav-details]').forEach(function (d) {
    var li = d.parentNode, t;
    li.addEventListener('mouseenter', function () {
      if (!hoverQuery.matches) return;
      clearTimeout(t);
      t = setTimeout(function () { if (!d.open) { d.setAttribute('open', ''); d.dataset.hoverOpened = String(Date.now()); } }, 90);
    });
    var summary = $('summary', d);
    if (summary) summary.addEventListener('click', function (e) {
      // A click straight after hover-opening should not close the menu again
      if (hoverQuery.matches && d.open && Date.now() - Number(d.dataset.hoverOpened || 0) < 700) e.preventDefault();
    });
    li.addEventListener('mouseleave', function () {
      if (!hoverQuery.matches) return;
      clearTimeout(t);
      t = setTimeout(function () { d.removeAttribute('open'); }, 160);
    });
  });

  /* ---------- Hero scroll cue ---------- */
  document.addEventListener('click', function (e) {
    var cue = e.target.closest('[data-scroll-cue]');
    if (!cue) return;
    var hero = cue.closest('[data-hero]');
    var section = hero && hero.closest('.shopify-section');
    var next = section && section.nextElementSibling;
    var header = $('.shopify-section-header');
    var offset = header && getComputedStyle(header).position === 'sticky' ? header.offsetHeight : 0;
    var top = next ? next.getBoundingClientRect().top + window.scrollY - offset : hero.offsetHeight;
    window.scrollTo({ top: top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  /* ---------- Collection grid size ---------- */
  var GRID_KEY = 'valoria:grid';
  function readGrid() { try { return JSON.parse(window.localStorage.getItem(GRID_KEY)) || {}; } catch (e) { return {}; } }
  function applyGrid() {
    var prefs = readGrid();
    $$('[data-product-grid]').forEach(function (grid) {
      var d = prefs.d || grid.dataset.defaultCols || '4';
      var m = prefs.m || '2';
      grid.setAttribute('data-cols', d);
      grid.setAttribute('data-cols-m', m);
    });
    $$('[data-grid-cols]').forEach(function (b) {
      var c = b.dataset.gridCols;
      var isMobile = b.classList.contains('grid-toggle__btn--mobile');
      var grid = $('[data-product-grid]');
      var active = isMobile ? (prefs.m || '2') : (prefs.d || (grid && grid.dataset.defaultCols) || '4');
      b.setAttribute('aria-pressed', c === active ? 'true' : 'false');
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-grid-cols]');
    if (!b) return;
    var prefs = readGrid();
    if (b.classList.contains('grid-toggle__btn--mobile')) prefs.m = b.dataset.gridCols; else prefs.d = b.dataset.gridCols;
    try { window.localStorage.setItem(GRID_KEY, JSON.stringify(prefs)); } catch (err) { /* storage unavailable */ }
    applyGrid();
  });
  applyGrid();

  /* ---------- Discount codes (cart drawer and cart page) ---------- */
  function currentCodes() {
    return $$('[data-discount-remove]').map(function (b) { return b.dataset.discountRemove; })
      .filter(function (c, i, arr) { return c && arr.indexOf(c) === i; });
  }
  function updateDiscounts(codes, added, wrap) {
    var errorEl = wrap && $('[data-discount-error]', wrap);
    if (wrap) wrap.classList.add('is-updating');
    return fetchJSON(V.routes.cartUpdate + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ discount: codes.join(','), sections: cartSectionIds(), sections_url: window.location.pathname })
    }).then(function (data) {
      renderCartSections(data.sections);
      if (added) {
        var found = (data.discount_codes || []).filter(function (d) { return d.code.toLowerCase() === added.toLowerCase(); })[0];
        if (!found || !found.applicable) {
          $$('[data-discount-error]').forEach(function (el) { el.textContent = V.strings.discountInvalid; el.hidden = false; });
          announce(V.strings.discountInvalid);
        }
      }
    }).catch(function () {
      if (wrap) wrap.classList.remove('is-updating');
      if (errorEl) { errorEl.textContent = V.strings.discountError; errorEl.hidden = false; }
    });
  }
  function applyDiscountFrom(wrap) {
    var input = $('[data-discount-input]', wrap);
    var code = input ? input.value.trim() : '';
    if (!code) { if (input) input.focus(); return; }
    var codes = currentCodes();
    if (codes.map(function (c) { return c.toLowerCase(); }).indexOf(code.toLowerCase()) === -1) codes.push(code);
    updateDiscounts(codes, code, wrap);
  }
  document.addEventListener('click', function (e) {
    var apply = e.target.closest('[data-discount-apply]');
    if (apply) { e.preventDefault(); applyDiscountFrom(apply.closest('[data-cart-discount]')); return; }
    var rm = e.target.closest('[data-discount-remove]');
    if (rm) {
      e.preventDefault();
      var code = rm.dataset.discountRemove;
      updateDiscounts(currentCodes().filter(function (c) { return c !== code; }), null, rm.closest('[data-cart-discount]'));
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || !e.target.matches || !e.target.matches('[data-discount-input]')) return;
    e.preventDefault();
    applyDiscountFrom(e.target.closest('[data-cart-discount]'));
  });

  /* ---------- Cart drawer recommendations ---------- */
  function initCartExtras() {
    var recs = $('[data-cart-recs]');
    if (!recs || recs.dataset.loaded) return;
    recs.dataset.loaded = '1';
    var inCart = $$('[data-cart-items] [data-product-id]').map(function (el) { return el.dataset.productId; });
    fetch(recs.dataset.url).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
      if (!html) return;
      var doc = parseHTML(html);
      var cards = $$('.mini-card', doc).filter(function (c) { return inCart.indexOf(c.dataset.productId) === -1; }).slice(0, 3);
      if (!cards.length) return;
      var listWrap = $('[data-cart-recs-list]', recs);
      var ul = document.createElement('ul');
      ul.className = 'mini-cards';
      ul.setAttribute('role', 'list');
      cards.forEach(function (c) { ul.appendChild(document.importNode(c, true)); });
      listWrap.innerHTML = '';
      listWrap.appendChild(ul);
      recs.hidden = false;
    }).catch(function () {});
  }
  initCartExtras();
  document.addEventListener('valoria:cart-updated', initCartExtras);

  /* ---------- Country / language selectors ---------- */
  document.addEventListener('change', function (e) {
    if (e.target.matches && e.target.matches('[data-localization-select]')) e.target.form.submit();
  });

  /* ---------- Newsletter email check ---------- */
  document.addEventListener('submit', function (e) {
    var input = e.target.querySelector && e.target.querySelector('[data-email-input]');
    if (!input) return;
    var errorEl = e.target.querySelector('[data-email-error]');
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    if (!ok) {
      e.preventDefault();
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) { input.setAttribute('aria-describedby', errorEl.id); errorEl.hidden = false; }
      input.focus();
    } else if (errorEl) { errorEl.hidden = true; input.removeAttribute('aria-invalid'); }
  }, true);

  /* ---------- Theme editor support ---------- */
  document.addEventListener('shopify:section:load', function (e) {
    initComponents(e.target);
    $$('.reveal', e.target).forEach(function (el) { el.classList.add('is-visible'); });
  });
  document.addEventListener('shopify:block:select', function (e) {
    var details = e.target.closest && e.target.closest('[data-nav-details]');
    if (details) details.setAttribute('open', '');
    var track = e.target.closest && e.target.closest('[data-carousel-track]');
    if (track && e.target.scrollIntoView) e.target.scrollIntoView({ block: 'nearest', inline: 'start' });
  });
})();
