/**
 * Context Vault - Background Service Worker (Manifest V3)
 * Ready for Context Menus & Event Dispatching in Part 2.
 */

console.log('[Context Vault] Background Service Worker initialized.');

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Context Vault] Installed reason:', details.reason);
});
