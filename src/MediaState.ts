import { match, parse } from 'css-mediaquery';
import { MockMediaQueryList, MockMediaQueryListEvent } from './mocks';
import type { MediaFeature, MediaValues } from './types';

interface MediaQueryObserver {
  features: Set<MediaFeature>;
  matches: boolean;
  media: MockMediaQueryList['media'];
  mediaQueryList: MockMediaQueryList;
}

/**
 * Static class for working with the mocked media state.
 *
 * After calling `mockMatchMedia`, each MediaQueryList that is created via
 * `window.matchMedia` is enrolled in the static #observers array on this class.
 *
 * Values for the current media state are represented as a single object with
 * features as keys and their values, e.g. `{ width: '1000px' }`. When a value
 * is changed, those changes are evaluated to determine whether an observer
 * should be notified.
 */
export class MediaState {
  static #observers: MediaQueryObserver[] = [];
  static #values: MediaValues = {};

  /**
   * Given a media query, evaluates whether the current environment matches.
   */
  public static evaluate(query: string): boolean {
    return match(query, this.#values);
  }

  /**
   * Whenever a new MediaQueryList is created, parse its media query for
   * recognizable features, e.g. width, height, orientation, and format it
   * into the MediaQueryObserver shape in order to easily determine whether it
   * needs to be notified when a media value changes.
   */
  public static observe = (mediaQueryList: MockMediaQueryList): void => {
    const { matches, media } = mediaQueryList;
    const parsedMediaQuery = parse(media);
    const features = new Set<MediaFeature>();
    parsedMediaQuery.forEach(({ expressions, type }) => {
      // Valid types include `print` and `screen`. If the type is `all`,
      // we don't need to watch for changes.
      if (type !== 'all') {
        features.add('type');
      }
      expressions.forEach(({ feature }) => {
        features.add(feature as MediaFeature);
      });
    });

    this.#observers.push({
      matches,
      media,
      features,
      mediaQueryList,
    });
  };

  /**
   * Set media value(s) and notify all observers that are potentially subscribed
   * to changes in queried features.
   */
  public static setValue = (values: MediaValues): void => {
    const changedFeatures = Object.keys(values) as MediaFeature[];
    if (!changedFeatures.length) {
      return;
    }

    changedFeatures.forEach((feature) => {
      this.#values[feature] = values[feature];
    });

    this.#observers.forEach((observer) => {
      const { features, media, mediaQueryList } = observer;
      if (!changedFeatures.some((feature) => features.has(feature))) {
        return;
      }
      const matches = match(media, this.#values);
      // If the value of matches has not changed, do not notify observers.
      if (matches === observer.matches) {
        return;
      }
      observer.matches = matches;
      const event = new MockMediaQueryListEvent('change', { matches, media });
      mediaQueryList.dispatchEvent(event);
    });
  };

  /**
   * Ultimately exported as `mockClear`.
   */
  public static reset = (): void => {
    this.#observers.forEach(({ mediaQueryList }) => {
      mediaQueryList.removeAllListeners();
    });
    this.#observers = [];
    this.#values = {};
  };
}
