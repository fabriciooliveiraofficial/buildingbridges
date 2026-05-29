/**
 * Utility to safely parse image strings from the database.
 * Supports:
 * - JSON stringified arrays: '["url1", "url2"]'
 * - Comma-separated strings: 'url1, url2'
 * - Semicolon-separated strings: 'url1; url2'
 * - Single URLs or Base64 strings.
 */
export const parseImages = (imageUrl: string | null | undefined): string[] => {
  if (!imageUrl) return [];
  const trimmed = imageUrl.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((img) => typeof img === 'string' && img.length > 0);
      }
    } catch (e) {
      // Failed to parse, fallback
    }
  }
  
  if (trimmed.includes(';') || trimmed.includes(',')) {
    const separator = trimmed.includes(';') ? ';' : ',';
    return trimmed
      .split(separator)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  
  return [trimmed];
};
