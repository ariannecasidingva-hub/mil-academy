// Quiz engine — randomization, timer, one-at-a-time, no backtracking

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

document.addEventListener('DOMContentLoaded', () => {
  const quizId = getQueryParam('id');
  if (!quizId || !QUIZZES[quizId]) {
    document.getElementById('quiz-app').innerHTML = `
      <div class="text-center py-20">
        <h2 class="text-2xl font-bold text-slate-900 mb-4">Quiz not found</h2>
        <p class="text-slate-600 mb-6">Please select a quiz from the assessments page.</p>
        <a href="quizzes.html" class="inline-flex px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700">Back to Quizzes</a>
      </div>`;
    return;
  }

  const quiz = QUIZZES[quizId];
  // Deep clone and shuffle questions + options
  let questions = shuffle(quiz.questions.map(q => {
    const indices = q.options.map((_, i) => i);
    const shuffledIndices = shuffle(indices);
    return {
      q: q.q,
      options: shuffledIndices.map(i => q.options[i]),
      correct: shuffledIndices.indexOf(q.correct)
    };
  }));

  let currentIndex = 0;
  let answers = new Array(questions.length).fill(null);
  let timeLeft = quiz.timeLimitSeconds;
  let timerInterval = null;
  let quizFinished = false;

  const app = document.getElementById('quiz-app');
  const titleEl = document.getElementById('quiz-title');
  titleEl.textContent = quiz.title;

  // Mild anti-cheat: discourage right-click and text selection during quiz
  document.body.classList.add('no-select');
  document.addEventListener('contextmenu', e => {
    if (!quizFinished) e.preventDefault();
  });
  document.addEventListener('copy', e => {
    if (!quizFinished) e.preventDefault();
  });

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function updateTimerDisplay() {
    const el = document.getElementById('timer');
    if (!el) return;
    el.textContent = formatTime(timeLeft);
    if (timeLeft <= 60) {
      el.classList.add('timer-warning', 'text-red-600');
    } else {
      el.classList.remove('timer-warning', 'text-red-600');
    }
  }

  function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        finishQuiz(true);
      }
    }, 1000);
  }

  function renderStartScreen() {
    app.innerHTML = `
      <div class="max-w-xl mx-auto text-center py-8">
        <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">${quiz.title}</h2>
        <p class="text-slate-600 mb-6">${questions.length} questions · ${Math.round(quiz.timeLimitSeconds / 60)} minutes</p>
        <ul class="text-left text-sm text-slate-600 space-y-2 mb-8 bg-slate-50 rounded-xl p-5 border border-slate-200">
          <li class="flex gap-2"><span class="text-primary-500 font-bold">•</span> Questions and answer choices are randomized</li>
          <li class="flex gap-2"><span class="text-primary-500 font-bold">•</span> One question at a time — you cannot go back</li>
          <li class="flex gap-2"><span class="text-primary-500 font-bold">•</span> Timer runs continuously; quiz auto-submits at 0:00</li>
          <li class="flex gap-2"><span class="text-primary-500 font-bold">•</span> Select an answer then click Next to proceed</li>
        </ul>
        <button id="start-btn" class="px-8 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition shadow-lg">
          Begin Quiz
        </button>
      </div>`;
    document.getElementById('start-btn').addEventListener('click', () => {
      startTimer();
      renderQuestion();
    });
  }

  function renderQuestion() {
    const q = questions[currentIndex];
    const progress = ((currentIndex) / questions.length) * 100;

    app.innerHTML = `
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <div class="text-sm font-medium text-slate-500">
            Question <span class="text-slate-900">${currentIndex + 1}</span> of ${questions.length}
          </div>
          <div class="flex items-center gap-2 text-sm font-mono font-semibold text-slate-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span id="timer">${formatTime(timeLeft)}</span>
          </div>
        </div>
        <div class="h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
          <div class="h-full bg-primary-500 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h3 class="text-lg md:text-xl font-semibold text-slate-900 mb-6 leading-relaxed">${q.q}</h3>
          <div class="space-y-3" id="options">
            ${q.options.map((opt, i) => `
              <button type="button" data-index="${i}" class="quiz-option w-full text-left px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-medium hover:border-primary-400 transition">
                <span class="inline-flex items-center gap-3">
                  <span class="w-7 h-7 rounded-full border-2 border-slate-300 flex items-center justify-center text-xs font-bold text-slate-500 option-letter">${String.fromCharCode(65 + i)}</span>
                  <span>${opt}</span>
                </span>
              </button>
            `).join('')}
          </div>
          <div class="mt-8 flex justify-end">
            <button id="next-btn" disabled class="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-700 transition">
              ${currentIndex === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>`;

    updateTimerDisplay();

    let selected = null;
    const optionBtns = app.querySelectorAll('.quiz-option');
    const nextBtn = document.getElementById('next-btn');

    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (quizFinished) return;
        optionBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selected = parseInt(btn.dataset.index, 10);
        nextBtn.disabled = false;
      });
    });

    nextBtn.addEventListener('click', () => {
      if (selected === null) return;
      answers[currentIndex] = selected;
      currentIndex++;
      if (currentIndex >= questions.length) {
        finishQuiz(false);
      } else {
        renderQuestion();
      }
    });
  }

  function finishQuiz(timedOut) {
    quizFinished = true;
    clearInterval(timerInterval);
    document.body.classList.remove('no-select');

    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) score++;
    });
    const percent = Math.round((score / questions.length) * 100);
    let message = '';
    let color = 'primary';
    if (percent >= 90) { message = 'Excellent work! Strong command of the material.'; color = 'emerald'; }
    else if (percent >= 70) { message = 'Good job. Review the topics you missed for deeper mastery.'; color = 'primary'; }
    else if (percent >= 50) { message = 'Passing, but there’s room to strengthen your understanding.'; color = 'amber'; }
    else { message = 'Keep studying. Revisit the course materials and try again.'; color = 'red'; }

    app.innerHTML = `
      <div class="max-w-xl mx-auto text-center py-8">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-${color}-100 text-${color}-600 flex items-center justify-center text-3xl font-bold">
          ${percent}%
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Quiz Complete</h2>
        ${timedOut ? '<p class="text-amber-600 font-medium mb-2">Time expired — answers submitted automatically.</p>' : ''}
        <p class="text-slate-600 mb-2">You scored <strong>${score}</strong> out of <strong>${questions.length}</strong></p>
        <p class="text-slate-500 text-sm mb-8">${message}</p>
        <div class="flex flex-wrap justify-center gap-3">
          <a href="quiz.html?id=${quizId}" class="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition">Retake Quiz</a>
          <a href="quizzes.html" class="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition">Back to Quizzes</a>
        </div>
        <div class="mt-10 text-left bg-white rounded-2xl border border-slate-200 p-6">
          <h3 class="font-bold text-slate-900 mb-4">Review</h3>
          <div class="space-y-4 text-sm">
            ${questions.map((q, i) => {
              const userAns = answers[i];
              const isCorrect = userAns === q.correct;
              return `
                <div class="border-b border-slate-100 pb-4 last:border-0">
                  <p class="font-medium text-slate-800 mb-1">${i + 1}. ${q.q}</p>
                  <p class="${isCorrect ? 'text-emerald-600' : 'text-red-600'}">
                    Your answer: ${userAns !== null ? q.options[userAns] : '(no answer)'}
                    ${isCorrect ? ' ✓' : ' ✗'}
                  </p>
                  ${!isCorrect ? `<p class="text-slate-500 mt-0.5">Correct: ${q.options[q.correct]}</p>` : ''}
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
  }

  renderStartScreen();
});
