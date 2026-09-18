// Lightweight pure helper for generating QR code image URLs
export function getQrCodeUrl(data, size = 200) {
  if (!data) return '';
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}
