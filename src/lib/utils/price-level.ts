export function getPriceSymbols(priceLevel: string): string {
  const normalizedLevel = priceLevel.trim().toLowerCase();

  if (normalizedLevel.includes('very_expensive') || normalizedLevel.includes('very expensive')) {
    return '$$$$';
  }
  if (normalizedLevel.includes('inexpensive')) {
    return '$';
  }
  if (normalizedLevel.includes('moderate')) {
    return '$$';
  }
  if (normalizedLevel.includes('expensive')) {
    return '$$$';
  }
  if (normalizedLevel.includes('free')) {
    return '';
  }

  return '';
}
