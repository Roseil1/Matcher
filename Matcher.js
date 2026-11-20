document.addEventListener('DOMContentLoaded', () => {
  const pairs = [
    ['🦊', '🦊'],
    ['🐙', '🐙'],
    ['🐝', '🐝'],
    ['🐸', '🐸'],
    ['🪼', '🪼'],
    ['6️⃣', '7️⃣'],
  ];

  const deck = pairs.flat();

  const sound67 = new Audio('./sounds/6-7_Sound.mp3');
  const jumpscareSounds = [
    new Audio('./sounds/jumpscare1_Sound.m4a'),
    new Audio('./sounds/jumpscare2_Sound.m4a'),
  ];
  const backgroundMusic = new Audio('./sounds/background music.m4a');

  backgroundMusic.volume = 0.5;
  jumpscareSounds[0].volume = 0.5;
  jumpscareSounds[1].volume = 1.0;
  backgroundMusic.loop = true;

  const soundEffects = [sound67, ...jumpscareSounds];

  const gameBoard = document.getElementById('gameBoard');
  const attemptsDisplay = document.getElementById('attempts');
  const winMessage = document.getElementById('winMessage');

  let attempts = 0;
  let matchedPairs = 0;
  let firstCard = null;
  let lockBoard = false;

  attemptsDisplay.textContent = attempts;
  winMessage.style.display = 'none';

  backgroundMusic.play().catch(() => {
    gameBoard.addEventListener('click', resumeBackgroundMusic, { once: true });
  });

  soundEffects.forEach(sound => {
    sound.addEventListener('ended', resumeBackgroundMusic);
    sound.addEventListener('error', resumeBackgroundMusic);
  });

  function resumeBackgroundMusic() {
    const allEffectsFinished = soundEffects.every(sound =>
      sound.paused || sound.ended || sound.error
    );

    if (allEffectsFinished) {
      backgroundMusic.play().catch(error => console.warn(error));
    }
  }

  function playSoundEffect(sound) {
    backgroundMusic.pause();
    sound.currentTime = 0;

    sound.play().catch(error => {
      console.warn(error);
      resumeBackgroundMusic();
    });
  }

  // Shuffle the cards.
  for (let i = deck.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[randomIndex]] = [deck[randomIndex], deck[i]];
  }

  deck.forEach(emoji => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.addEventListener('click', () => revealCard(card));
    gameBoard.appendChild(card);
  });

  function revealCard(card) {
    if (
      lockBoard ||
      card.classList.contains('revealed') ||
      card.classList.contains('matched')
    ) {
      return;
    }

    card.classList.add('revealed');
    card.textContent = card.dataset.emoji;

    if (firstCard === null) {
      firstCard = card;
      return;
    }

    attempts++;
    attemptsDisplay.textContent = attempts;

    const firstEmoji = firstCard.dataset.emoji;
    const secondEmoji = card.dataset.emoji;
    const is67Match = firstEmoji === '6️⃣' && secondEmoji === '7️⃣';
    const isMatch = firstEmoji === secondEmoji || is67Match;

    if (isMatch) {
      firstCard.classList.add('matched');
      card.classList.add('matched');
      matchedPairs++;

      if (is67Match) {
        playSoundEffect(sound67);
      }

      if (matchedPairs === pairs.length) {
        winMessage.style.display = 'block';
      }

      resetTurn();
      return;
    }

    lockBoard = true;

    if (attempts > 2 && Math.random() < 0.3) {
      const randomIndex = Math.floor(Math.random() * jumpscareSounds.length);
      playSoundEffect(jumpscareSounds[randomIndex]);
    }

    setTimeout(() => {
      firstCard.classList.remove('revealed');
      card.classList.remove('revealed');
      firstCard.textContent = '';
      card.textContent = '';
      resetTurn();
    }, 800);
  }

  function resetTurn() {
    firstCard = null;
    lockBoard = false;
  }
});