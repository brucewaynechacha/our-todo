import confetti from 'canvas-confetti';

export const triggerTaskConfetti = () => {
  try {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#6366f1', '#f43f5e', '#a855f7', '#3b82f6', '#ec4899', '#f59e0b'],
      disableForReducedMotion: true,
    });
  } catch (err) {
    console.debug('Confetti error', err);
  }
};

export const triggerAllDoneCelebration = () => {
  try {
    const end = Date.now() + 1200;
    const colors = ['#4f46e5', '#e11d48', '#fb7185', '#818cf8', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (err) {
    console.debug('Celebration error', err);
  }
};
