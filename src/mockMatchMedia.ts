import { MediaState } from './MediaState';
import { MockMediaQueryList } from './mocks';
import type { MediaValues } from './types';

interface MockMatchMediaResult {
  /**
   * Mocks given media value(s) in the mocked environment, triggering listeners
   * on any active media queries whose feature evaluations are changed.
   *
   * @example
   * mockMedia({ type: 'screen', width: '1200px', height: '800px' });
   */
  mockMedia: (values: MediaValues) => void;
  /**
   * Clears the mocked media state to default values, without removing the mock.
   * In Jest, this is called automatically in each `afterEach` block by default.
   */
  clearMedia: () => void;
  /**
   * Calls `clearMedia` and restores the original value of `window.matchMedia`.
   * In Jest, this is called automatically in each `afterAll` block by default.
   */
  restoreMedia: () => void;
}

/**
 * Mocks the `window.matchMedia` function to use an internally held state.
 * Returns helper functions designed to help work with the mocks.
 */
export const mockMatchMedia = (): MockMatchMediaResult => {
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
    mockMedia: (values) => MediaState.setValue(values),
    clearMedia: () => MediaState.reset(),
    restoreMedia: () => {
      MediaState.reset();
      window.matchMedia = matchMedia;
    },
  };
};
