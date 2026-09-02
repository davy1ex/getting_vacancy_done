import browser from 'webextension-polyfill';

browser.action.onClicked.addListener(async (tab) => {
  if (tab?.id == null) return;
  try {
    await browser.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' });
  } catch {
    // nothing do
  }
});
