export function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export function timestampFromSeconds(seconds: number): string {
  if (isNaN(seconds)) return '';
  if (seconds < 60) {
    return new Date(seconds * 1000).toISOString().slice(17, 23).replace('.', ':');
  } else {
    return new Date(seconds * 1000).toISOString().slice(14, 19);
  }
}
