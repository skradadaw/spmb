/** Normalises an Indonesian number (08…, 8…, 62…, +62…) to the 62… form WhatsApp expects. */
export function toWhatsAppNumber(phone: string | null | undefined) {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (digits.startsWith('62')) return digits.length >= 10 ? digits : null;
  if (digits.startsWith('0')) return digits.length >= 10 ? `62${digits.slice(1)}` : null;
  if (digits.startsWith('8')) return digits.length >= 9 ? `62${digits}` : null;
  return null;
}

/** Pesan setelah Pengumuman Hasil OKB: tautan Cek Hasil OKB dan Nomor Pendaftaran untuk login. */
export function resultAnnouncementMessage(childName: string, nomorPendaftaran: string | null, resultCheckUrl: string) {
  return [
    `Assalamu'alaikum Bapak/Ibu, Hasil OKB ${childName} di SD Plus 3 Al-Muhajirin sudah diumumkan.`,
    `Silakan cek di ${resultCheckUrl} dengan Nomor Pendaftaran ${nomorPendaftaran ?? '(lihat Bukti Pendaftaran)'} dan tanggal lahir Ananda.`,
  ].join('\n');
}

export function whatsAppWebHref(phone: string | null | undefined, text?: string) {
  const number = toWhatsAppNumber(phone);
  if (!number) return null;
  return `https://web.whatsapp.com/send?phone=${number}${text ? `&text=${encodeURIComponent(text)}` : ''}`;
}
