export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 10) return "agora mesmo";
  if (sec < 60) return `há ${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `há ${min}min`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `há ${hr}h`;
  const day = Math.round(hr / 24);
  if (day < 7) return `há ${day}d`;
  const week = Math.round(day / 7);
  if (week < 5) return `há ${week}sem`;
  const month = Math.round(day / 30);
  if (month < 12) return `há ${month}mês`;
  const year = Math.round(day / 365);
  return `há ${year}a`;
}
