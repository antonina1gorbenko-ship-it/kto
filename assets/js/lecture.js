/* =========================================================
   Інтерактив сторінки лекції: тести, завдання-чеклісти,
   смуга прогресу, підсвічування змісту, демо промпту.
   Прогрес зберігається в браузері здобувача освіти (localStorage).
   ========================================================= */
(function(){
  "use strict";
  var LECTURE = parseInt(document.body.getAttribute('data-lecture') || '0', 10);
  var STORE_KEY = document.body.getAttribute('data-store') || ('posibnyk-lecture-' + LECTURE);

  function loadState(){
    try{
      var raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    }catch(e){ return {}; }
  }
  function saveState(state){
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }catch(e){}
  }

  var state = loadState(); // { "task-1": [true,false,...], "test-1": 0 (номер обраної відповіді) }

  /* ---------- завдання-чеклісти ---------- */
  var taskBoxes = Array.prototype.slice.call(document.querySelectorAll('.box.task'));

  function renderTaskBox(box){
    var id = box.id;
    var items = state[id] || [];
    var lis = box.querySelectorAll('ol > li');
    var doneCount = 0;
    lis.forEach(function(li, i){
      var checked = !!items[i];
      if (checked) doneCount++;
      var chk = li.querySelector('.chk');
      if (chk){
        chk.checked = checked;
        li.querySelector('.step').classList.toggle('checked', checked);
      }
    });
    var pill = box.querySelector('[data-progress]');
    if (pill) pill.textContent = doneCount + ' / ' + lis.length + ' виконано';
    box.classList.toggle('done', lis.length > 0 && doneCount === lis.length);
    return { done: doneCount, total: lis.length };
  }

  taskBoxes.forEach(function(box){
    var id = box.id;
    var lis = Array.prototype.slice.call(box.querySelectorAll('ol > li'));
    lis.forEach(function(li, i){
      var step = document.createElement('label');
      step.className = 'step';
      var num = document.createElement('span');
      num.className = 'num';
      num.textContent = (i + 1);
      var chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.className = 'chk';
      chk.setAttribute('aria-label', 'Крок ' + (i + 1) + ' виконано');
      var textSpan = document.createElement('span');
      textSpan.className = 'step-text';
      while (li.firstChild) textSpan.appendChild(li.firstChild);
      step.appendChild(chk);
      step.appendChild(num);
      step.appendChild(textSpan);
      li.appendChild(step);
      chk.addEventListener('change', function(){
        if (!state[id]) state[id] = [];
        state[id][i] = chk.checked;
        saveState(state);
        renderTaskBox(box);
        updateOverall();
      });
    });
    renderTaskBox(box);
  });

  /* ---------- тести ---------- */
  var quizzes = Array.prototype.slice.call(document.querySelectorAll('.quiz'));
  quizzes.forEach(function(quiz){
    var box = quiz.closest('.box');
    var boxId = box.id;
    var correct = parseInt(quiz.getAttribute('data-correct'), 10);
    var buttons = Array.prototype.slice.call(quiz.querySelectorAll('.test-opt'));
    var feedback = quiz.querySelector('.test-feedback');

    function applyAnswer(chosenIdx){
      buttons.forEach(function(btn, i){
        btn.disabled = true;
        if (i === correct) btn.classList.add('is-correct');
        if (i === chosenIdx && chosenIdx !== correct) btn.classList.add('is-wrong');
      });
      feedback.classList.add('show');
      if (chosenIdx === correct){
        feedback.textContent = '✓ Правильно!';
        feedback.classList.add('correct');
      } else {
        feedback.textContent = '✗ Неправильно. Правильну відповідь виділено.';
        feedback.classList.add('wrong');
      }
      var pill = box.querySelector('[data-progress]');
      if (pill) pill.textContent = 'пройдено';
      box.classList.add('done');
    }

    buttons.forEach(function(btn, i){
      btn.addEventListener('click', function(){
        state[boxId] = i;
        saveState(state);
        applyAnswer(i);
        updateOverall();
      });
    });

    if (typeof state[boxId] === 'number'){
      applyAnswer(state[boxId]);
    }
  });

  /* ---------- загальний прогрес ---------- */
  function updateOverall(){
    var totalSteps = 0, doneSteps = 0;
    taskBoxes.forEach(function(box){
      var r = renderTaskBox(box);
      totalSteps += r.total;
      doneSteps += r.done;
    });
    quizzes.forEach(function(quiz){
      totalSteps += 1;
      var box = quiz.closest('.box');
      if (box.classList.contains('done')) doneSteps += 1;
    });
    var pct = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;
    var fill = document.getElementById('progressFill');
    var label = document.getElementById('tocProgress');
    if (fill) fill.style.width = pct + '%';
    if (label) label.innerHTML = 'прогрес: <b>' + pct + '%</b>';
    if (LECTURE && window.CourseProgress) window.CourseProgress.set(LECTURE, pct);
  }
  updateOverall();

  /* ---------- скидання прогресу ---------- */
  var resetBtn = document.getElementById('resetBtn');
  if (resetBtn){
    resetBtn.addEventListener('click', function(){
      try{ localStorage.removeItem(STORE_KEY); }catch(e){}
      if (LECTURE && window.CourseProgress) window.CourseProgress.set(LECTURE, 0);
      location.reload();
    });
  }

  /* ---------- підсвічування пункту змісту ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('section.topic[id], section.lit[id]'));
  var tocLinks = {};
  Array.prototype.slice.call(document.querySelectorAll('.toc-inner a[data-toc]')).forEach(function(a){
    tocLinks[a.getAttribute('data-toc')] = a;
  });
  if ('IntersectionObserver' in window && sections.length){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var link = tocLinks[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting){
          Object.keys(tocLinks).forEach(function(k){ tocLinks[k].classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function(s){ observer.observe(s); });
  }
})();

/* ---------- демо «анатомія промпту» (лекція 8) ---------- */
(function(){
  var demo = document.getElementById('promptDemo');
  if (!demo) return;
  var btns = demo.querySelectorAll('.legend button');
  var segs = demo.querySelectorAll('.seg');
  function show(k){
    btns.forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-k') === k); });
    segs.forEach(function(s){ s.classList.toggle('on', s.getAttribute('data-k') === k); });
  }
  btns.forEach(function(b){
    b.addEventListener('click', function(){
      show(b.classList.contains('on') ? null : b.getAttribute('data-k'));
    });
  });
  segs.forEach(function(s){
    s.addEventListener('click', function(){
      show(s.classList.contains('on') ? null : s.getAttribute('data-k'));
    });
  });
})();
