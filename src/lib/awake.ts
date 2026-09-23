/** How long a roommate stays marked as awake after pressing the button. */
export const AWAKE_DURATION_MS = 60 * 60 * 1000;

/** When the roommate pressed the button, derived from the end of their awake window. */
export function awakeSince(awakeUntil: number) {
  return awakeUntil - AWAKE_DURATION_MS;
}

export function formatElapsed(ms: number) {
  const totalMinutes = Math.floor(ms / 60_000);
  if (totalMinutes < 1) return "à l'instant";
  if (totalMinutes >= 60) return "il y a 1 h";
  return `il y a ${totalMinutes} min`;
}
