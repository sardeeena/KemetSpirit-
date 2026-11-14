export const EXPECTED_KEMETSPIRIT_SUPABASE_PROJECT_REF = 'mktrtoctcjyokclpdeui';

export interface KemetSpiritSupabaseUrlResolution {
  url: string | null;
  error?: string;
  warning?: string;
}

/**
 * Resolve the server URL without allowing a malformed SUPABASE_URL to mask a
 * valid VITE_SUPABASE_URL. A syntactically valid but wrong-project primary URL
 * is rejected outright; it must never silently fall through to another project.
 */
export function resolveKemetSpiritSupabaseUrl(
  serverUrl: string | null | undefined,
  viteUrl: string | null | undefined,
  allowNonProductionProject = false
): KemetSpiritSupabaseUrlResolution {
  const hasServerUrl = typeof serverUrl === 'string' && serverUrl.trim().length > 0;
  const hasViteUrl = typeof viteUrl === 'string' && viteUrl.trim().length > 0;

  const parseHttpUrl = (candidate: string | null | undefined): string | null => {
    if (!candidate || typeof candidate !== 'string') return null;
    try {
      const parsed = new URL(candidate.trim());
      return parsed.protocol === 'https:' || parsed.protocol === 'http:'
        ? candidate.trim()
        : null;
    } catch {
      return null;
    }
  };

  if (hasServerUrl) {
    const primary = parseHttpUrl(serverUrl);
    if (primary) {
      if (!isExpectedKemetSpiritSupabaseUrl(primary, allowNonProductionProject)) {
        return {
          url: null,
          error: 'SUPABASE_URL points to a different or disallowed Supabase project.',
        };
      }
      return { url: primary };
    }
  }

  const fallback = parseHttpUrl(viteUrl);
  if (fallback) {
    if (!isExpectedKemetSpiritSupabaseUrl(fallback, allowNonProductionProject)) {
      return {
        url: null,
        error: 'VITE_SUPABASE_URL points to a different or disallowed Supabase project.',
      };
    }
    return {
      url: fallback,
      warning: hasServerUrl
        ? 'SUPABASE_URL is malformed; using the validated VITE_SUPABASE_URL fallback.'
        : undefined,
    };
  }

  if (hasServerUrl) {
    return {
      url: null,
      error: 'SUPABASE_URL is defined but is not a valid HTTP/HTTPS URL, and no valid VITE_SUPABASE_URL fallback is available.',
    };
  }

  if (hasViteUrl) {
    return {
      url: null,
      error: 'VITE_SUPABASE_URL is defined but is not a valid HTTP/HTTPS URL.',
    };
  }

  return { url: null };
}

/**
 * Production KemetSpirit clients must connect only to the configured production
 * Supabase project. Development may use a separate hosted Supabase
 * project or a local Supabase stack for isolated testing.
 */
export function isExpectedKemetSpiritSupabaseUrl(
  url: string | null | undefined,
  allowNonProductionProject = false
): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);

    if (allowNonProductionProject) {
      if (parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co')) {
        return true;
      }
      return parsed.protocol === 'http:' &&
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');
    }

    return parsed.protocol === 'https:' &&
      parsed.hostname === `${EXPECTED_KEMETSPIRIT_SUPABASE_PROJECT_REF}.supabase.co`;
  } catch {
    return false;
  }
}
