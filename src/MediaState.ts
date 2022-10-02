import { match, parse } from 'css-mediaquery';
import type { MediaValues } from 'css-mediaquery';
import { MockMediaQueryListEvent } from './mocks';

type MediaFeature = keyof MediaValues | 'type';
type ExpandedMediaValues = Partial<Record<MediaFeature, unknown>>;

interface MediaQueryObserver extends Pick<MediaQueryList, 'media'> {
  features: Set<MediaFeature>;
  matches: boolean;
  mediaQueryList: MediaQueryList;
}

/** */
export class MediaState {
  static #observers: MediaQueryObserver[] = [];
  static #values: ExpandedMediaValues = {};

  public static get values() {
    return MediaState.#values;
  }

  public static observe = (mediaQueryList: MediaQueryList) => {
    const { matches, media } = mediaQueryList;
    const parsedMediaQuery = parse(media);
    const features = new Set<MediaFeature>();
    parsedMediaQuery.forEach(({ expressions, type }) => {
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

  public static setValues = (values: ExpandedMediaValues) => {
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
      if (matches === observer.matches) {
        return;
      }
      observer.matches = matches;
      const event = new MockMediaQueryListEvent('change', { matches, media });
      mediaQueryList.dispatchEvent(event);
    });
  };

  public static reset = () => {
    this.#values = {};
    this.#observers = [];
  };
}
