const SCRIPT_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_PATTERN = /\son\w+\s*=\s*["'][^"']*["']/gi;
const DANGEROUS_ATTR_PATTERN = /\s(?:style|srcset|formaction)\s*=\s*["'][^"']*["']/gi;
const HTML_TAG_PATTERN = /<\/?[^>]+(>|$)/g;

/**
 * Sanitize raw user input by stripping dangerous HTML content.
 * Removes script tags, event handlers, and HTML tags while preserving text content.
 */
export function sanitizeInput(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  let sanitized = raw;

  // Remove script tags and their content
  sanitized = sanitized.replace(SCRIPT_PATTERN, '');

  // Remove event handler attributes
  sanitized = sanitized.replace(EVENT_HANDLER_PATTERN, '');

  // Remove dangerous attributes
  sanitized = sanitized.replace(DANGEROUS_ATTR_PATTERN, '');

  // Remove all remaining HTML tags but keep text content
  sanitized = sanitized.replace(HTML_TAG_PATTERN, '');

  // Decode common HTML entities back to text
  sanitized = sanitized
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");

  // Re-escape after decoding to prevent rendering
  sanitized = escapeHtml(sanitized);

  return sanitized.trim();
}

/**
 * Escape HTML special characters to prevent XSS when rendering in DOM.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validate a URL - only allow http: and https: schemes.
 * Returns the sanitized URL or null if invalid/dangerous.
 */
export function validateUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
    return null;
  } catch {
    // Try prefixing with https:// for bare domains
    if (/^[a-zA-Z0-9]/.test(trimmed) && !trimmed.includes(' ') && trimmed.includes('.')) {
      try {
        const withScheme = new URL(`https://${trimmed}`);
        if (withScheme.protocol === 'https:') {
          return withScheme.href;
        }
      } catch {
        return null;
      }
    }
    return null;
  }
}

