export function formatDate(date: Date | string, fmt: string = 'YYYY-MM-DD HH:mm:ss'): string {
  let d: Date;
  if (typeof date === 'string') {
    d = new Date(date.replace(/-/g, '/'));
  } else {
    d = date;
  }

  const o: Record<string, number> = {
    'M+': d.getMonth() + 1,
    'D+': d.getDate(),
    'H+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds(),
  };

  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (d.getFullYear().toString()).substring(4 - RegExp.$1.length));
  }

  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k].toString() : ('00' + o[k].toString()).substring(('' + o[k]).length)
      );
    }
  }

  return fmt;
}

export function isExpired(expiryDate: string): boolean {
  const expiry = new Date(expiryDate.replace(/-/g, '/'));
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return now.getTime() > expiry.getTime();
}

export function daysToExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate.replace(/-/g, '/'));
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getCurrentTime(): string {
  return formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
}
