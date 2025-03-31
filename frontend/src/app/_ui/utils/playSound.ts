const playSound = (sound: string) => {
  if (typeof window === "undefined") return; // Prevents errors in SSR
  
  const audio = new Audio(`/sounds/${sound}`);
  audio.play();

  // If page changes, stop playing sound
  if (window.addEventListener) {
    window.addEventListener("beforeunload", () => {
      audio.pause();
    });
  }
};

export const playCorrectAnswer = () => {
  playSound("correct-answer.mp3");
};

export const playWrongAnswer = () => {
  playSound("wrong-answer.mp3");
};

export const playQuizStart = () => {
  playSound("quiz-start.mp3");
};

export const playQuizEnd = () => {
  playSound("quiz-end.mp3");
};
