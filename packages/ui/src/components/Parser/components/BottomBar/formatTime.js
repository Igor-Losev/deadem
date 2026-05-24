export function formatTime(seconds) {
  if (seconds == null || !isFinite(seconds) || seconds < 0) {
    return '—';
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);

  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
}
