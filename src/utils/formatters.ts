/**
 * Formatting and navigation helper utilities
 */

/**
 * Formats a timestamp into a friendly relative time (e.g. "Just now", "5m ago", "2h ago", "Yesterday", "Mar 12").
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Extracts a clean domain name from a full URL (e.g., "en.wikipedia.org" -> "wikipedia.org").
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    let host = parsed.hostname.replace(/^www\./, '');
    return host || 'web';
  } catch {
    return 'web';
  }
}

/**
 * Bulletproof tab opening for Chrome extensions.
 * Strictly uses chrome.tabs.create inside Manifest V3, with window.open fallback for dev preview.
 */
export function openTab(url: string): void {
  if (!url) return;

  if (typeof chrome !== 'undefined' && chrome.tabs && typeof chrome.tabs.create === 'function') {
    chrome.tabs.create({ url });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
