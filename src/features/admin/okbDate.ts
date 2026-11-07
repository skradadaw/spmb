export function formatOkbDate(date: string, options: Intl.DateTimeFormatOptions) {
  // Jadwal OKB is a calendar date; noon UTC keeps it on the same day in Asia/Jakarta.
  return new Intl.DateTimeFormat('id-ID', { ...options, timeZone: 'Asia/Jakarta' }).format(new Date(`${date}T12:00:00Z`));
}
