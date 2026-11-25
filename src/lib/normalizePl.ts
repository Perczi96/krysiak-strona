const PL_MAP: Record<string, string> = {
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
  'Ą': 'a', 'Ć': 'c', 'Ę': 'e', 'Ł': 'l', 'Ń': 'n', 'Ó': 'o', 'Ś': 's', 'Ź': 'z', 'Ż': 'z',
};

export function normalizePl(value: string): string {
  return value
    .replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (ch) => PL_MAP[ch] || ch)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesQuery(haystack: string, queryNorm: string): boolean {
  if (!queryNorm) return false;
  return normalizePl(haystack).includes(queryNorm);
}

export function highlightMatch(text: string, query: string): { text: string; hit: boolean }[] {
  const q = normalizePl(query).trim();
  if (!q || !text) return [{ text, hit: false }];
  const normText = normalizePl(text);
  const idx = normText.indexOf(q);
  if (idx < 0) return [{ text, hit: false }];
  // Map normalized index back to original by walking chars
  let origStart = 0;
  let normCount = 0;
  while (origStart < text.length && normCount < idx) {
    const ch = text[origStart];
    const n = normalizePl(ch);
    normCount += n.length;
    origStart += 1;
  }
  let origEnd = origStart;
  let matchedNorm = 0;
  while (origEnd < text.length && matchedNorm < q.length) {
    const ch = text[origEnd];
    const n = normalizePl(ch);
    matchedNorm += n.length;
    origEnd += 1;
  }
  const parts: { text: string; hit: boolean }[] = [];
  if (origStart > 0) parts.push({ text: text.slice(0, origStart), hit: false });
  parts.push({ text: text.slice(origStart, origEnd), hit: true });
  if (origEnd < text.length) parts.push({ text: text.slice(origEnd), hit: false });
  return parts;
}
