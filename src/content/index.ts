/**
 * Context Vault / MindClip - Content Script
 * Handles text selection extraction, DOM context heuristics, and messaging.
 */

interface PageContextPayload {
  selectedText: string;
  surroundingContext: string;
  pageTitle: string;
  url: string;
}

const IGNORED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'NAV',
  'HEADER',
  'FOOTER',
  'SVG',
  'INPUT',
  'BUTTON',
  'SELECT',
  'TEXTAREA',
  'IFRAME',
]);

const SEMANTIC_CONTAINERS = new Set([
  'P',
  'ARTICLE',
  'SECTION',
  'BLOCKQUOTE',
  'MAIN',
  'LI',
  'TD',
  'DD',
  'DT',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
]);

/**
 * Extracts the current text selection cleanly.
 */
function getSelectedText(): string {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return '';
  }
  return selection.toString().trim();
}

/**
 * Normalizes text content by collapsing whitespace and line breaks.
 */
function normalizeText(text: string): string {
  return text.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Extracts visible text content from an element, ignoring noisy tags (scripts, nav, etc.)
 */
function extractCleanElementText(element: Element): string {
  const cloned = element.cloneNode(true) as Element;

  // Remove noisy elements from the clone
  const noisyElements = cloned.querySelectorAll(
    'script, style, noscript, nav, header, footer, svg, input, button, select, textarea, iframe'
  );
  noisyElements.forEach((el) => el.remove());

  return normalizeText(cloned.textContent || '');
}

/**
 * Heuristically finds the nearest meaningful parent container and extracts
 * a focused surrounding context (approx. 300–500 characters) around the selection.
 */
function getSurroundingContext(selectedText: string): string {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return selectedText;
  }

  const range = selection.getRangeAt(0);
  let currentNode: Node | null = range.commonAncestorContainer;

  // If node is a text node, start from its parent element
  if (currentNode.nodeType === Node.TEXT_NODE) {
    currentNode = currentNode.parentElement;
  }

  let bestContainer: Element | null = null;
  let currentElement: Element | null = currentNode as Element | null;

  // Traverse up the DOM to find the best semantic parent
  while (currentElement && currentElement !== document.body && currentElement !== document.documentElement) {
    const tagName = currentElement.tagName.toUpperCase();

    // Skip ignored tags
    if (IGNORED_TAGS.has(tagName)) {
      currentElement = currentElement.parentElement;
      continue;
    }

    // Direct match on semantic container
    if (SEMANTIC_CONTAINERS.has(tagName)) {
      bestContainer = currentElement;
      break;
    }

    // If it's a div, check if it has reasonable text length
    if (tagName === 'DIV') {
      const textLen = (currentElement.textContent || '').trim().length;
      if (textLen >= selectedText.length && textLen <= 2500) {
        bestContainer = currentElement;
        break;
      }
    }

    currentElement = currentElement.parentElement;
  }

  // Fallback to initial element or parent if no semantic container was found
  if (!bestContainer && currentNode && currentNode instanceof Element) {
    bestContainer = currentNode;
  }

  if (!bestContainer) {
    return selectedText;
  }

  const fullContainerText = extractCleanElementText(bestContainer);
  if (!fullContainerText) {
    return selectedText;
  }

  // If container text is already reasonably short (<= 500 chars), return it all
  if (fullContainerText.length <= 500) {
    return fullContainerText;
  }

  // Centering context window around the selectedText
  const matchIndex = fullContainerText.indexOf(selectedText);
  if (matchIndex === -1) {
    // If not found directly due to minor whitespace differences, take first 500 chars
    return fullContainerText.substring(0, 500) + '...';
  }

  const contextRadius = 180; // ~180 chars before and ~180 chars after
  const start = Math.max(0, matchIndex - contextRadius);
  const end = Math.min(fullContainerText.length, matchIndex + selectedText.length + contextRadius);

  let snippet = fullContainerText.substring(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < fullContainerText.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Extracts page title and current URL.
 */
function getPageMetadata(): { pageTitle: string; url: string } {
  const url = window.location.href;

  let pageTitle = document.title ? document.title.trim() : '';

  if (!pageTitle) {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      pageTitle = ogTitle.getAttribute('content')?.trim() || '';
    }
  }

  if (!pageTitle) {
    const h1 = document.querySelector('h1');
    if (h1 && h1.textContent) {
      pageTitle = normalizeText(h1.textContent);
    }
  }

  if (!pageTitle) {
    pageTitle = 'Untitled Page';
  }

  return { pageTitle, url };
}

/**
 * Collects full payload from active page.
 */
function capturePageContext(): PageContextPayload {
  const selectedText = getSelectedText();
  const surroundingContext = getSurroundingContext(selectedText);
  const { pageTitle, url } = getPageMetadata();

  return {
    selectedText,
    surroundingContext,
    pageTitle,
    url,
  };
}

/**
 * Listen for messages from the background service worker.
 * Returns true to indicate asynchronous response handling capability.
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (
    message?.action === 'EXTRACT_PAGE_CONTEXT' ||
    message?.type === 'GET_SELECTED_CONTEXT'
  ) {
    try {
      const payload = capturePageContext();
      sendResponse({ success: true, data: payload });
    } catch (error) {
      console.error('[Context Vault Content Script] Extraction error:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown extraction error',
      });
    }
  }

  // Return true to allow asynchronous responses
  return true;
});

console.log('[Context Vault] Content script ready for context capture.');
