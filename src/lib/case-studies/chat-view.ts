// A chat transcript that only appends new messages, so screen readers announce each reply once.
// Replies in another language get a "Show English translation" toggle.

import { esc, type Message } from './runner';

// `translationsOpen` shows English translations under replies straight away, instead of behind a button.
export function createChatView(container: HTMLElement, names: () => { user: string; assistant: string }, emptyText: string, emptyHint = '', translationsOpen = false) {
  let shown = 0;

  const bubble = (m: Message) => {
    const el = document.createElement('div');
    el.className = `message ${m.role}`;
    const who = m.role === 'user' ? names().user : names().assistant;
    el.innerHTML = `<p class="role">${esc(who)}</p><p class="bubble"${m.lang && m.lang !== 'en' && m.lang !== 'mixed' ? ` lang="${m.lang === 'zh' ? 'zh' : m.lang}"` : ''}>${esc(m.content)}</p>`;
    if (m.translation) {
      const id = `tr-${Math.random().toString(36).slice(2, 8)}`;
      el.insertAdjacentHTML('beforeend', `<button type="button" class="translate" aria-expanded="${translationsOpen}" aria-controls="${id}">${translationsOpen ? 'Hide' : 'Show'} English translation</button><p class="translation" id="${id}"${translationsOpen ? '' : ' hidden'}>${esc(m.translation)}</p>`);
      const button = el.querySelector<HTMLButtonElement>('.translate')!;
      const text = el.querySelector<HTMLElement>('.translation')!;
      button.addEventListener('click', () => {
        text.hidden = !text.hidden;
        button.setAttribute('aria-expanded', String(!text.hidden));
        button.textContent = text.hidden ? 'Show English translation' : 'Hide English translation';
      });
    }
    return el;
  };

  return {
    reset() {
      shown = 0;
      container.innerHTML = `<p class="chat-empty">${esc(emptyText)}</p>${emptyHint ? `<p class="chat-empty-hint"><span class="hint-arrow" aria-hidden="true"></span><span>${esc(emptyHint)}</span></p>` : ''}`;
    },
    sync(messages: Message[]) {
      if (!shown && messages.length) container.innerHTML = '';
      for (; shown < messages.length; shown++) container.appendChild(bubble(messages[shown]));
      container.scrollTop = container.scrollHeight;
    },
  };
}
