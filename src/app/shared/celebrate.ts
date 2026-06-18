/** True when the user has asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

/**
 * Fire a short confetti burst for the win celebration.
 *
 * `canvas-confetti` is imported lazily so it stays off the initial bundle and a
 * load failure never breaks the game. Skipped entirely under reduced-motion.
 */
export async function fireConfetti(): Promise<void> {
  if (prefersReducedMotion()) {
    return;
  }
  try {
    const { default: confetti } = await import('canvas-confetti');
    const base = { spread: 70, startVelocity: 45, origin: { y: 0.6 } };
    confetti({ ...base, particleCount: 80, angle: 60, origin: { x: 0, y: 0.7 } });
    confetti({ ...base, particleCount: 80, angle: 120, origin: { x: 1, y: 0.7 } });
    confetti({ ...base, particleCount: 60 });
  } catch {
    // Confetti is pure delight — silently ignore if the chunk fails to load.
  }
}
