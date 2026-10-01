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

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const today = getTodayDateStr();
  const tomorrow = getTomorrowDateStr();

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';

  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    return dateStr;
  }
};
