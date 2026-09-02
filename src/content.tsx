import { createRoot } from 'react-dom/client';
import browser from 'webextension-polyfill';
import App from './app/App';
import styles from './widgets/layout/panel/ui/Panel.css?inline';

function mountPanel(): void {
  const host = document.createElement('div');
  host.id = 'hh-revenge-root';
  host.style.cssText = 'all: initial;';
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = styles;
  shadow.appendChild(style);

  const mountEl = document.createElement('div');
  mountEl.id = 'hh-revenge-mount';
  shadow.appendChild(mountEl);

  (document.body ?? document.documentElement).appendChild(host);

  const root = createRoot(mountEl);
  root.render(<App />);

  browser.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'TOGGLE_PANEL') {
      host.style.display = host.style.display === 'none' ? '' : 'none';
    }
  });
}

mountPanel();
