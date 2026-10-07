import { saveMemory } from '../utils/storage';

const CONTEXT_MENU_ID = 'contextvault-save-selection';
const CONTEXT_MENU_TITLE = 'Save to Context Vault';

/**
 * Register the context menu on extension install or update.
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: CONTEXT_MENU_TITLE,
      contexts: ['selection'],
    });
    console.log(`[Context Vault] Context menu registered: "${CONTEXT_MENU_TITLE}"`);
  });
});

/**
 * Display a temporary confirmation badge on the extension icon.
 */
async function showBadgeFeedback(tabId: number | undefined, text: string, color: string) {
  try {
    const badgeDetails: chrome.action.BadgeTextDetails = { text };
    const colorDetails: chrome.action.BadgeBackgroundColorDetails = { color };

    if (tabId) {
      badgeDetails.tabId = tabId;
      colorDetails.tabId = tabId;
    }

    await chrome.action.setBadgeText(badgeDetails);
    await chrome.action.setBadgeBackgroundColor(colorDetails);

    setTimeout(async () => {
      try {
        await chrome.action.setBadgeText({ tabId, text: '' });
      } catch {
        // Tab might have been closed
      }
    }, 2500);
  } catch (err) {
    console.warn('[Context Vault] Badge update warning:', err);
  }
}

/**
 * Handles right-click context menu clicks.
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) {
    return;
  }

  const tabId = tab?.id;
  const fallbackSelectedText = info.selectionText ? info.selectionText.trim() : '';
  const fallbackTitle = tab?.title || 'Untitled Page';
  const fallbackUrl = tab?.url || info.pageUrl || '';

  let pageData = {
    selectedText: fallbackSelectedText,
    surroundingContext: fallbackSelectedText,
    pageTitle: fallbackTitle,
    url: fallbackUrl,
  };

  if (tabId) {
    try {
      // 1. Request rich DOM extraction from content script
      let response = await sendMessageToContentScript(tabId);

      if (response && response.success && response.data) {
        pageData = {
          selectedText: response.data.selectedText || fallbackSelectedText,
          surroundingContext:
            response.data.surroundingContext || response.data.selectedText || fallbackSelectedText,
          pageTitle: response.data.pageTitle || fallbackTitle,
          url: response.data.url || fallbackUrl,
        };
      }
    } catch (err) {
      console.warn('[Context Vault] Content script communication failed, using fallback:', err);
    }
  }

  if (!pageData.selectedText) {
    console.warn('[Context Vault] No text selected to save.');
    return;
  }

  try {
    // 2. Persist memory to storage
    const saved = await saveMemory({
      pageTitle: pageData.pageTitle,
      url: pageData.url,
      selectedText: pageData.selectedText,
      surroundingContext: pageData.surroundingContext,
      tags: [],
      isFavorite: false,
    });

    console.log('[Context Vault] Memory captured successfully:', saved);

    // 3. Provide visual badge feedback (Green checkmark)
    await showBadgeFeedback(tabId, '✓', '#10B981');
  } catch (err) {
    console.error('[Context Vault] Failed to save memory:', err);
    await showBadgeFeedback(tabId, 'ERR', '#EF4444');
  }
});

/**
 * Sends message to content script with dynamic injection fallback if needed.
 */
async function sendMessageToContentScript(tabId: number): Promise<any> {
  try {
    return await chrome.tabs.sendMessage(tabId, { action: 'EXTRACT_PAGE_CONTEXT' });
  } catch {
    // Content script might not be injected yet (e.g. tab opened before extension installed/updated)
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js'],
      });
      return await chrome.tabs.sendMessage(tabId, { action: 'EXTRACT_PAGE_CONTEXT' });
    } catch (injectionError) {
      console.warn('[Context Vault] Failed to inject content script:', injectionError);
      return null;
    }
  }
}
