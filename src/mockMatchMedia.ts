import { MediaState } from './MediaState';
import { MockMediaQueryList } from './mocks';

const { matchMedia } = window;

/**
 * Restores the global state.
 * Exported on its own in case I ever decide to enroll it in automatic cleanup,
 * à la RTL (grok for `RTL_SKIP_AUTO_CLEANUP`).
 */
export const mockRestore = () => {
  MediaState.reset();
  window.matchMedia = matchMedia;
};

/**
 * Mocks the `window.matchMedia` function to use an internally held state.
 * Returns helper functions designed to help work with the mocks, with
 * API syntax heavily inspired by Jest's mock function API:
 * https://jestjs.io/docs/mock-function-api
 *
 * @example
 * ```
 * const matchMedia = mockMatchMedia();
 *
 * beforeEach(() => {
 *   // Clears all existing media queries and associated listeners.
 *   matchMedia.mockClear();
 * });
 *
 * afterAll(() => {
 *   // Clears media queries and restores original `window.matchMedia` value.
 *   matchMedia.mockRestore();
 * });
 *
 * it('should evaluate media query', () => {
 *   const mediaQueryList = window.matchMedia('(min-width: 800px)');
 *   // Sets mocked media values.
 *   matchMedia.mockMediaValue({
 *     width: '900px',
 *   });
 *   expect(mediaQueryList.matches).toBe(true);
 * });
 * ```
 */
export const mockMatchMedia = (): {
  mockClear: typeof MediaState.reset;
  mockMediaValue: typeof MediaState.setValue;
  mockRestore: typeof mockRestore;
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
    mockClear: () => MediaState.reset(),
    mockMediaValue: (values) => MediaState.setValue(values),
    mockRestore,
  };
};
