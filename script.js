const typingText = document.querySelector('.typing-text p');
const input = document.querySelector('.wrapper .input-field');
const time = document.querySelector('.time span b');
const mistakes = document.querySelector('.mistake span');
const wpm = document.querySelector('.wpm span');
const cpm = document.querySelector('.cpm span');
const btn = document.querySelector('button');

// state
let timer;
let maxTime = 60;
let timeLeft = maxTime;
let charIndex = 0;
let mistake = 0;
let isTyping = false;

function loadParagraph() {
  const paragraph = [
    "She went to the king and said, O king! The swans in your river are rude and cruel. I asked for shelter, but they said they got the golden-feathered river. The king was angry at the proud swan for insulting the homeless bird. He bought his soldiers to bring proud swans to his court. Soon all the golden swans were offered in the king's court. Do you think the royal treasury depends on your gold plums? You can't decide who lives by the river.",
    "Generating random paragraphs can be an excellent way for writers to get their creative flow going at the beginning of the day. The writer has no idea what topic the random paragraph will be about when it appears. This forces the writer to use creativity to complete one of three common writing challenges. The writer can use the paragraph as the first one of a short story and build upon it.",
    "The old lighthouse keeper, Silas, squinted at the swirling fog. For fifty years, he'd kept the light burning, a beacon against the treacherous rocks. Tonight, the foghorn coughed a mournful sound, swallowed by the gray abyss. Suddenly, a small, flickering light appeared in the distance, bobbing erratically. Silas grabbed his binoculars. It was a child, alone in a rowboat, lost in the fog. His heart leaped. He focused the lighthouse beam, cutting through the dense air, a path home for the frightened little soul."
  ];

  const randomIndex = Math.floor(Math.random() * paragraph.length);
  typingText.innerHTML = '';

  for (const ch of paragraph[randomIndex]) {
    typingText.innerHTML += `<span>${ch}</span>`;
  }

  const spans = typingText.querySelectorAll('span');
  if (spans.length) spans[0].classList.add('active');

  document.addEventListener('keydown', () => input.focus());
  typingText.addEventListener('click', () => input.focus());
}

function setActive(index) {
  const spans = typingText.querySelectorAll('span');
  spans.forEach(s => s.classList.remove('active'));
  if (index >= 0 && index < spans.length) {
    spans[index].classList.add('active');
  }
}

function updateStats() {
  cpm.innerText = Math.max(0, charIndex - mistake);
  mistakes.innerText = mistake;
}

function finishTest() {
  clearInterval(timer);
  isTyping = false;
  input.disabled = true;
}

function initTime() {
  if (timeLeft > 0) {
    timeLeft--;
    time.innerText = timeLeft;

    const elapsed = maxTime - timeLeft; // seconds
    const wordsTyped = Math.max(0, (charIndex - mistake) / 5);
    const wpmVal = elapsed > 0 ? Math.round((wordsTyped / elapsed) * 60) : 0;
    wpm.innerText = wpmVal;
  } else {
    finishTest();
  }
}

// Handle normal typing via input event
function handleInput(e) {
  // Ignore deletions here; Backspace is handled in keydown for reliability
  if (e.inputType && e.inputType.startsWith('delete')) {
    input.value = ''; // keep it empty for single-keystroke model
    return;
  }

  const spans = typingText.querySelectorAll('span');
  if (charIndex >= spans.length || timeLeft <= 0) {
    input.value = '';
    return;
  }

  if (!isTyping) {
    timer = setInterval(initTime, 1000);
    isTyping = true;
  }

  const typedChar = input.value.charAt(0); // single char typed
  const targetChar = spans[charIndex].textContent; // use textContent to preserve spaces

  if (typedChar === targetChar) {
    spans[charIndex].classList.add('correct');
  } else {
    spans[charIndex].classList.add('incorrect');
    mistake++;
  }

  charIndex++;
  setActive(charIndex);
  updateStats();

  input.value = ''; // always clear

  // If finished the paragraph, freeze stats and stop timer
  if (charIndex >= spans.length) {
    // Optional: compute final WPM immediately
    const elapsed = maxTime - timeLeft;
    const wordsTyped = Math.max(0, (charIndex - mistake) / 5);
    wpm.innerText = elapsed > 0 ? Math.round((wordsTyped / elapsed) * 60) : 0;
    finishTest();
  }
}

// Robust Backspace handling via keydown
function handleKeydown(e) {
  if (e.key !== 'Backspace') return;

  e.preventDefault(); // prevent default since input is kept empty

  const spans = typingText.querySelectorAll('span');

  // If already at the start or timer over / finished, do nothing
  if (charIndex <= 0 || timeLeft <= 0) return;

  // Move back one position
  charIndex--;

  // If you want to let users "fix" a mistake (reduce mistake count when they go back over an incorrect char):
  if (spans[charIndex].classList.contains('incorrect')) {
    mistake = Math.max(0, mistake - 1);
  }

  // Clear styling on this char and set it active
  spans[charIndex].classList.remove('correct', 'incorrect');
  setActive(charIndex);
  updateStats();
}

function reset() {
  loadParagraph();
  clearInterval(timer);
  timeLeft = maxTime;
  time.innerText = timeLeft;
  input.value = '';
  input.disabled = false;
  charIndex = 0;
  mistake = 0;
  isTyping = false;
  wpm.innerText = 0;
  cpm.innerText = 0;
  mistakes.innerText = 0
}

// listeners
input.addEventListener('input', handleInput);
input.addEventListener('keydown', handleKeydown);
btn.addEventListener('click', reset);

// init
loadParagraph();
