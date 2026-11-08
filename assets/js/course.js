/* =========================================================
   Е-посібник «Комп’ютерні технології в освітньому процесі»
   Дані курсу та спільна навігація для всіх сторінок.

   ЯК РЕДАГУВАТИ:
   • назва лекції змінюється тут — і оновлюється в меню,
     на титульній сторінці та в навігації «попередня / наступна»;
   • коли лекцію дописано, змініть status: 'draft' на 'ready'.
   ========================================================= */
window.COURSE = {
  title: 'Комп’ютерні технології в освітньому процесі',
  lectures: [
    { n: 1,  title: 'Інформаційно-комунікаційні технології в освітньому процесі', status: 'draft' },
    { n: 2,  title: 'Цифрова компетентність педагога',                            status: 'draft' },
    { n: 3,  title: 'Хмарні технології та спільна робота',                        status: 'draft' },
    { n: 4,  title: 'Системи управління навчанням',                               status: 'draft' },
    { n: 5,  title: 'Мультимедійні презентації та інфографіка',                   status: 'draft' },
    { n: 6,  title: 'Відеоконтент в освітньому процесі',                          status: 'draft' },
    { n: 7,  title: 'Інтерактивні сервіси оцінювання та зворотного зв’язку',      status: 'draft' },
    { n: 8,  title: 'Штучний інтелект та машинне навчання в освіті',              status: 'ready' },
    { n: 9,  title: 'Дистанційне та змішане навчання',                            status: 'draft' },
    { n: 10, title: 'Віртуальна, доповнена реальність і симулятори',              status: 'draft' },
    { n: 11, title: 'Електронні освітні ресурси та вебсайт педагога',             status: 'draft' },
    { n: 12, title: 'Гейміфікація та ігрові технології',                          status: 'draft' },
    { n: 13, title: 'Інформаційна безпека та кібергігієна',                       status: 'draft' },
    { n: 14, title: 'Авторське право та відкриті освітні ресурси',                status: 'draft' },
    { n: 15, title: 'Цифрове портфоліо та проєктна діяльність педагога',          status: 'draft' }
  ]
};

(function(){
  'use strict';
  var C = window.COURSE;
  var PROGRESS_KEY = 'posibnyk-progress-v1';   // { "8": 40, ... } — відсоток виконання
  var LAST_KEY = 'posibnyk-last-v1';           // номер останньої відкритої лекції
  var THEME_KEY = 'posibnyk-theme';

  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function fileOf(n){ return 'lecture-' + pad(n) + '.html'; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function read(key, fallback){
    try{ var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; }
  }
  function write(key, value){ try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){} }

  window.CourseProgress = {
    set: function(n, pct){ var p = read(PROGRESS_KEY, {}); p[n] = pct; write(PROGRESS_KEY, p); },
    all: function(){ return read(PROGRESS_KEY, {}); }
  };

  var current = parseInt(document.body.getAttribute('data-lecture') || '0', 10);
  if (current) write(LAST_KEY, current);

  /* ---------- меню лекцій у верхній панелі ---------- */
  var list = document.getElementById('courseMenuList');
  if (list){
    var html = '<li><a class="menu-home" href="index.html"><span class="n">⌂</span>Титульна сторінка та зміст</a></li>';
    C.lectures.forEach(function(l){
      var cls = (l.n === current ? 'current' : '') + (l.status === 'draft' ? ' is-draft' : '');
      html += '<li><a class="' + cls + '" href="' + fileOf(l.n) + '"><span class="n">' + pad(l.n) + '</span>' + esc(l.title) + '</a></li>';
    });
    list.innerHTML = html;
  }
  var menu = document.querySelector('.course-menu');
  if (menu){
    document.addEventListener('click', function(e){ if (menu.open && !menu.contains(e.target)) menu.open = false; });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') menu.open = false; });
  }

  /* ---------- попередня / наступна лекція ---------- */
  var nav = document.getElementById('lectureNav');
  if (nav && current){
    var idx = -1;
    C.lectures.forEach(function(l, i){ if (l.n === current) idx = i; });
    var prev = C.lectures[idx - 1], next = C.lectures[idx + 1];
    nav.innerHTML =
      (prev ? '<a class="ln-card prev" href="' + fileOf(prev.n) + '"><small>← Лекція ' + prev.n + '</small><span>' + esc(prev.title) + '</span></a>'
            : '<span class="ln-card prev empty"></span>') +
      '<a class="ln-home" href="index.html">Зміст<br>посібника</a>' +
      (next ? '<a class="ln-card next" href="' + fileOf(next.n) + '"><small>Лекція ' + next.n + ' →</small><span>' + esc(next.title) + '</span></a>'
            : '<span class="ln-card next empty"></span>');
  }

  /* ---------- зміст на титульній сторінці ---------- */
  var grid = document.getElementById('lectureGrid');
  if (grid){
    var progress = read(PROGRESS_KEY, {});
    var out = '';
    C.lectures.forEach(function(l){
      var pct = progress[l.n] || 0;
      var ready = l.status === 'ready';
      out += '<a class="lec-card ' + (ready ? 'ready' : 'is-draft') + '" href="' + fileOf(l.n) + '">' +
        '<span class="lec-num">' + pad(l.n) + '</span>' +
        '<h3>' + esc(l.title) + '</h3>' +
        '<span class="lec-meta">' +
          '<span class="status ' + (ready ? 'ready">готова' : 'wip">у розробці') + '</span>' +
          (pct ? '<span class="lec-progress" title="Виконано ' + pct + '%"><i style="width:' + pct + '%"></i></span><span class="lec-pct">' + pct + '%</span>' : '') +
        '</span></a>';
    });
    grid.innerHTML = out;

    var last = read(LAST_KEY, 0);
    var cont = document.getElementById('continueBtn');
    if (cont && last){
      cont.href = fileOf(last);
      cont.textContent = 'Продовжити з лекції ' + last + ' →';
      cont.hidden = false;
    }
  }

  /* ---------- світла / темна тема ---------- */
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn){
    themeBtn.addEventListener('click', function(){
      var root = document.documentElement;
      var cur = root.getAttribute('data-theme');
      if (!cur) cur = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      var nextTheme = cur === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', nextTheme);
      try{ localStorage.setItem(THEME_KEY, nextTheme); }catch(e){}
    });
  }
})();
