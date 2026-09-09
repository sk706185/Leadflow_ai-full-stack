/**
 * Utility functions for validating and normalizing external URLs.
 */

// Known placeholder and invalid domain patterns
const PLACEHOLDER_DOMAINS = [
  'example.com',
  'example.org',
  'example.net',
  'example.edu',
  'test.com',
  'fake.com',
  'dummy.com',
  'invalid.com',
  'sample.com',
  'placeholder.com',
  'testing.com',
  'localhost',
];

// Placeholder keywords inside paths or domains
const PLACEHOLDER_KEYWORDS = ['example', 'dummy', 'fake-company', 'test-company', 'placeholder'];

/**
 * Normalizes a URL by trimming whitespace and ensuring it uses 'https://'.
 * Returns empty string if the input is falsy or blank.
 */
export function normalizeUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Upgrade http:// to https://
  if (/^http:\/\//i.test(trimmed)) {
    return `https://${trimmed.slice(7)}`;
  }

  // If already starts with https://, return as-is
  if (/^https:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // If protocol-relative '//', prepend 'https:'
  if (trimmed.startsWith('//')) {
    return `https:${trimmed.slice(2)}`;
  }

  // Prepend https://
  return `https://${trimmed}`;
}

/**
 * Validates whether a given URL string is a valid, real external HTTP(S) URL.
 * Specifically rejects placeholder domains and keywords such as example.com, test.com, dummy.
 */
export function isValidExternalUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl) return false;
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) return false;

  try {
    const parsed = new URL(normalized);

    // Protocol check - must be https:
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    // Must have a valid dot-separated hostname (e.g. domain.tld)
    if (!hostname.includes('.') || hostname.startsWith('.') || hostname.endsWith('.')) {
      return false;
    }

    // Must not be IP localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return false;
    }

    // Check placeholder domains
    for (const placeholder of PLACEHOLDER_DOMAINS) {
      if (hostname === placeholder || hostname.endsWith(`.${placeholder}`)) {
        return false;
      }
    }

    // Check for fake/placeholder keywords in hostname or path
    for (const kw of PLACEHOLDER_KEYWORDS) {
      if (hostname.includes(kw) || pathname.includes(`/${kw}`) || pathname.includes(`${kw}-`)) {
        return false;
      }
    }

    // Must have valid TLD (at least 2 characters)
    const parts = hostname.split('.');
    const tld = parts[parts.length - 1];
    if (!tld || tld.length < 2 || !/^[a-z0-9-]+$/i.test(tld)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates form input for URLs (which can be optional).
 * Returns validity, normalized URL, and a user-friendly error message if invalid.
 */
export function validateUrlInput(
  rawUrl: string | null | undefined,
  options?: { isLinkedIn?: boolean; label?: string }
): { isValid: boolean; normalized: string; error?: string } {
  const label = options?.label || (options?.isLinkedIn ? 'LinkedIn URL' : 'Website URL');

  if (!rawUrl || !rawUrl.trim()) {
    // Optional field: empty string is valid
    return { isValid: true, normalized: '' };
  }

  const normalized = normalizeUrl(rawUrl);

  try {
    const parsed = new URL(normalized);
    const hostname = parsed.hostname.toLowerCase();

    // Check for placeholder domains
    for (const placeholder of PLACEHOLDER_DOMAINS) {
      if (hostname === placeholder || hostname.endsWith(`.${placeholder}`)) {
        return {
          isValid: false,
          normalized,
          error: `Placeholder domain "${hostname}" is not allowed. Please enter a valid URL or leave blank.`,
        };
      }
    }

    if (!isValidExternalUrl(normalized)) {
      return {
        isValid: false,
        normalized,
        error: `Please enter a valid ${label} (e.g., https://company.com).`,
      };
    }

    // Additional check for LinkedIn if requested
    if (options?.isLinkedIn) {
      if (!hostname.includes('linkedin.com')) {
        return {
          isValid: false,
          normalized,
          error: 'LinkedIn URL must be from linkedin.com (e.g. https://linkedin.com/company/name)',
        };
      }
    }

    return { isValid: true, normalized };
  } catch {
    return {
      isValid: false,
      normalized,
      error: `Invalid ${label} format. Please enter a valid URL.`,
    };
  }
}
