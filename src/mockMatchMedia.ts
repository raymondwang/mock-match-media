import { MediaState } from './MediaState';
import { MockMediaQueryList } from './mocks';

const { matchMedia } = window;
/** */
const cleanup = () => {
  MediaState.reset();
  window.matchMedia = matchMedia;
};

/**
 * Lorem ipsum dolor est
 *
 * @example
 * ```
 * const matchMedia = mockMatchMedia();
 *
 * beforeEach(() => {
 *   matchMedia.mockReset();
 * });
 *
 * afterAll(() => {
 *   matchMedia.cleanup();
 * });
 *
 * it('should respond to media changes', () => {
 *   matchMedia.mockMedia({
 *     width: '900px',
 *     orientation: 'landscape',
 *     'prefers-color-scheme': 'dark',
 *   });
 * });
 * ```
 */
export const mockMatchMedia = (): {
  mockMedia: typeof MediaState.setValues;
  mockReset: typeof MediaState.reset;
  cleanup: typeof cleanup;
} => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn((query: string) => {
      const mediaQueryList = new MockMediaQueryList(query);
      MediaState.observe(mediaQueryList);
      return mediaQueryList;
    }),
  });

  return {
    mockMedia: (values) => MediaState.setValues(values),
    mockReset: () => MediaState.reset(),
    cleanup,
  };
};
