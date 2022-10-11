import { MediaState } from './MediaState';
import { MockMediaQueryList } from './mocks';

/**
 * Mocks the `window.matchMedia` function to use an internally held state.
 * Returns helper functions designed to help work with the mocks, with
 * API syntax heavily inspired by Jest's mock function API:
 * https://jestjs.io/docs/mock-function-api
 */
export const mockMatchMedia = (): {
  /**
   * Clears the mocked media state to default values, without removing the mock.
   * Called automatically in each afterEach block.
   */
  mockClear: typeof MediaState.reset;
  /**
   * Mocks one or many given media value(s) in the mocked environment.
   * @example
   * ```ts
   * matchMedia.mockMediaValue({
   *   width: '1200px',
   *   height: '800px',
   * });
   * ```
   */
  mockMediaValue: typeof MediaState.setValue;
  /**
   * Calls `mockClear` and restores the original value of `window.matchMedia`.
   * Called automatically in each afterAll block.
   */
  mockRestore: () => void;
} => {
  const { matchMedia } = window;

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
    mockRestore: () => {
      MediaState.reset();
      window.matchMedia = matchMedia;
    },
  };
};
