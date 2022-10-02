import { match } from 'css-mediaquery';
import { MediaState } from '../MediaState';

interface Listener extends AddEventListenerOptions {
  callback: EventListener;
}

/** */
export class MockMediaQueryList implements MediaQueryList {
  readonly media: string;
  #listeners: Listener[] = [];

  constructor(query: string) {
    this.media = query;
  }

  /** */
  get matches() {
    return match(this.media, MediaState.values);
  }

  onchange = null;

  private _addListener(
    callback: EventListener,
    options?: AddEventListenerOptions,
  ) {
    if (!this.#listeners.some((l) => l.callback === callback)) {
      this.#listeners.push({ callback, ...options });
    }
  }

  private _removeListener(callback: EventListener) {
    const index = this.#listeners.findIndex((l) => l.callback === callback);
    if (index !== -1) {
      this.#listeners.splice(index, 1);
    }
  }

  /** @deprecated */
  addListener(callback: EventListener) {
    this._addListener(callback);
  }

  /** @deprecated */
  removeListener(callback: EventListener) {
    this._removeListener(callback);
  }

  addEventListener(
    type: string,
    callback: EventListener,
    options?: AddEventListenerOptions,
  ) {
    if (type === 'change') {
      this._addListener(callback, options);
    }
  }

  removeEventListener(type: string, callback: EventListener) {
    if (type === 'change') {
      this._removeListener(callback);
    }
  }

  dispatchEvent(event: MediaQueryListEvent) {
    this.#listeners.forEach(({ callback, once }) => {
      callback(event);
      if (once) this._removeListener(callback);
    });
    return true;
  }
}
