export type Remaining = { days:number; hours:number; minutes:number; seconds:number; done:boolean };

export function format2(n:number): string { return String(Math.max(0, n)).padStart(2, '0'); }

export function getRemaining(targetMs:number): Remaining {
  const now = Date.now();
  let diff = Math.max(0, targetMs - now);
  const days = Math.floor(diff / (24*60*60*1000)); diff -= days*24*60*60*1000;
  const hours = Math.floor(diff / (60*60*1000)); diff -= hours*60*60*1000;
  const minutes = Math.floor(diff / (60*1000)); diff -= minutes*60*1000;
  const seconds = Math.floor(diff / 1000);
  return { days, hours, minutes, seconds, done: targetMs <= now };
}


