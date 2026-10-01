// Helper utilities for local calendar dates without UTC timezone shift

export const getLocalDateString = (offsetDays = 0) => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateStr = () => getLocalDateString(0);
export const getTomorrowDateStr = () => getLocalDateString(1);
export const getYesterdayDateStr = () => getLocalDateString(-1);

export const addDaysToDate = (dateStr, days) => {
  if (!dateStr) return getTodayDateStr();
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  } catch (e) {
    return dateStr;
  }
};

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const today = getTodayDateStr();
  const tomorrow = getTomorrowDateStr();
  const yesterday = getYesterdayDateStr();

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  if (dateStr === yesterday) return 'Yesterday';

  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    return dateStr;
  }
};

export const formatFullDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return dateStr;
  }
};
