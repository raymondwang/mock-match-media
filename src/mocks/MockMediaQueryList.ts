import { match } from 'css-mediaquery';
import { MediaState } from '../MediaState';

interface Listener extends AddEventListenerOptions {
  callback: EventListener;
}

/**
 * MediaQueryList is the name of the interface that `window.matchMedia` natively
 * returns. This class is designed to imitate it as closely as possible for use
 * within JSDOM.
 */
export class MockMediaQueryList implements MediaQueryList {
  #listeners: Listener[] = [];

  readonly media: string;

  constructor(query: string) {
    this.media = query;
  }

  get matches(): boolean {
    return match(this.media, MediaState.values);
  }

  /**
   * Can be manually modified on the instance to listen to changes.
   * When available, prefer using `addEventListener`.
   */
  onchange: MediaQueryList['onchange'] = null;

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

  /**
   * https://caniuse.com/mdn-api_mediaquerylistevent
   * @deprecated
   */
  addListener(callback: EventListener) {
    this._addListener(callback);
  }

  /**
   * https://caniuse.com/mdn-api_mediaquerylistevent
   * @deprecated
   */
  removeListener(callback: EventListener) {
    this._removeListener(callback);
  }

  /**
   * Add an event listener to respond to changes in the value of `matches`.
   * Currently, the only supported option is `once`, which, if set to true,
   * automatically removes the event listener after a single callback.
   */
  addEventListener(
    type: string,
    callback: EventListener,
    options?: AddEventListenerOptions,
  ) {
    if (type !== 'change') return;
    this._addListener(callback, options);
  }

  /**
   * Remove an event listener by function reference.
   */
  removeEventListener(type: string, callback: EventListener) {
    if (type !== 'change') return;
    this._removeListener(callback);
  }

  /**
   * Dispatches a synthetic event and executes callbacks for any listeners.
   */
  dispatchEvent(event: MediaQueryListEvent) {
    this.onchange?.(event);
    this.#listeners.forEach(({ callback, once }) => {
      callback(event);
      if (once) this._removeListener(callback);
    });
    return true;
  }
}
