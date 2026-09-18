// Utility formatters for date, time, duration, and metrics

/**
 * Formats seconds into HH:MM:SS
 */
export function formatDuration(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

/**
 * Formats ISO date string to Korean friendly format
 */
export function formatKoreanDateTime(isoString) {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const day = dayNames[d.getDay()];
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${year}.${month}.${date}(${day}) ${ampm} ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}

/**
 * Returns today's date formatted as YYYY.MM.DD
 */
export function getTodayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

/**
 * Returns status badge details
 */
export function getStatusBadge(status) {
  switch (status) {
    case 'live':
      return {
        label: '🔴 LIVE 송출중',
        className: 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse',
        dotClass: 'bg-red-500 animate-ping',
      };
    case 'ready':
      return {
        label: '🟡 방송 대기중',
        className: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
        dotClass: 'bg-amber-500',
      };
    case 'complete':
    case 'ended':
      return {
        label: '⚪ 방송 종료',
        className: 'bg-slate-500/20 text-slate-400 border border-slate-600/40',
        dotClass: 'bg-slate-500',
      };
    default:
      return {
        label: status,
        className: 'bg-slate-700/40 text-slate-300 border border-slate-600/30',
        dotClass: 'bg-slate-400',
      };
  }
}

/**
 * Formats numbers into compact K/M (e.g. 1.2K)
 */
export function formatCompactNumber(num) {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('ko-KR', { notation: 'compact' }).format(num);
}
