/* ============================================================
   フォレスト訪問看護リハビリステーション 採用LP
   - タブ切り替え（1日の流れ／募集要項）
   - FAQ アコーディオン
   - スクロール表示
   - スマホ固定CTAの表示制御
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     タブ
     ---------------------------------------------------------- */
  function initTabs(root) {
    var buttons = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    if (!buttons.length) return;

    function activate(btn, setFocus) {
      buttons.forEach(function (b) {
        var panel = document.getElementById(b.getAttribute('aria-controls'));
        var selected = b === btn;
        b.setAttribute('aria-selected', selected ? 'true' : 'false');
        b.tabIndex = selected ? 0 : -1;
        if (panel) panel.hidden = !selected;
      });
      if (setFocus) btn.focus();
    }

    buttons.forEach(function (btn, i) {
      btn.tabIndex = btn.getAttribute('aria-selected') === 'true' ? 0 : -1;

      btn.addEventListener('click', function () {
        activate(btn, false);
      });

      btn.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = buttons[(i + 1) % buttons.length];
        if (e.key === 'ArrowLeft') next = buttons[(i - 1 + buttons.length) % buttons.length];
        if (e.key === 'Home') next = buttons[0];
        if (e.key === 'End') next = buttons[buttons.length - 1];
        if (next) {
          e.preventDefault();
          activate(next, true);
        }
      });
    });

    root.activateTabById = function (id) {
      var target = buttons.filter(function (b) { return b.id === id; })[0];
      if (target) activate(target, false);
    };
  }

  var tabRoots = Array.prototype.slice.call(document.querySelectorAll('[data-tabs]'));
  tabRoots.forEach(initTabs);

  /* 「募集要項を見る」から該当タブを開いて移動 */
  document.querySelectorAll('[data-jump-tab]').forEach(function (link) {
    link.addEventListener('click', function () {
      var id = link.getAttribute('data-jump-tab');
      tabRoots.forEach(function (root) {
        if (root.activateTabById) root.activateTabById(id);
      });
    });
  });

  /* ----------------------------------------------------------
     FAQ アコーディオン
     ---------------------------------------------------------- */
  document.querySelectorAll('[data-accordion] .faq__q').forEach(function (btn) {
    var panel = btn.parentNode.nextElementSibling;
    if (!panel) return;

    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');

      if (open) {
        panel.style.height = panel.scrollHeight + 'px';
        requestAnimationFrame(function () { panel.style.height = '0px'; });
      } else {
        panel.style.height = panel.scrollHeight + 'px';
        panel.addEventListener('transitionend', function handler() {
          panel.style.height = 'auto';
          panel.removeEventListener('transitionend', handler);
        });
      }
    });
  });

  /* 開いた状態で画面幅が変わっても高さが崩れないように */
  window.addEventListener('resize', function () {
    document.querySelectorAll('[data-accordion] .faq__q[aria-expanded="true"]').forEach(function (btn) {
      var panel = btn.parentNode.nextElementSibling;
      if (panel) panel.style.height = 'auto';
    });
  });

  /* ----------------------------------------------------------
     スクロール表示
     ---------------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------
     スマホ固定CTA
     ファーストビューを抜けたら表示、最終CTA上では隠す
     ---------------------------------------------------------- */
  var sticky = document.getElementById('stickyCta');
  var hero = document.querySelector('.hero');
  var finalCta = document.getElementById('contact');

  if (sticky) {
    sticky.hidden = false;

    var pastHero = false;
    var atFinalCta = false;

    function sync() {
      var show = pastHero && !atFinalCta && window.innerWidth < 960;
      sticky.classList.toggle('is-shown', show);
    }

    if ('IntersectionObserver' in window && hero) {
      new IntersectionObserver(function (entries) {
        pastHero = !entries[0].isIntersecting;
        sync();
      }, { threshold: 0 }).observe(hero);

      if (finalCta) {
        new IntersectionObserver(function (entries) {
          atFinalCta = entries[0].isIntersecting;
          sync();
        }, { threshold: 0.2 }).observe(finalCta);
      }
    } else {
      window.addEventListener('scroll', function () {
        pastHero = window.scrollY > window.innerHeight * 0.6;
        sync();
      }, { passive: true });
    }

    window.addEventListener('resize', sync);
    sync();
  }
})();
