/** Normalises an Indonesian number (08…, 8…, 62…, +62…) to the 62… form WhatsApp expects. */
export function toWhatsAppNumber(phone: string | null | undefined) {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (digits.startsWith('62')) return digits.length >= 10 ? digits : null;
  if (digits.startsWith('0')) return digits.length >= 10 ? `62${digits.slice(1)}` : null;
  if (digits.startsWith('8')) return digits.length >= 9 ? `62${digits}` : null;
  return null;
}

export function whatsAppWebHref(phone: string | null | undefined, text?: string) {
  const number = toWhatsAppNumber(phone);
  if (!number) return null;
  return `https://web.whatsapp.com/send?phone=${number}${text ? `&text=${encodeURIComponent(text)}` : ''}`;
}
