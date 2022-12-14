import { mockMatchMedia } from './mockMatchMedia';

const { mockMedia, clearMedia, restoreMedia } = mockMatchMedia();
export { mockMedia, clearMedia, restoreMedia };

/**
 * If we're being run by Jest (https://jestjs.io/docs/environment-variables),
 * then automatically clean up after each test. This ensures that tests run in
 * isolation from each other, and prevents issues caused by dirty state.
 */
if (process.env.JEST_WORKER_ID || process.env.NODE_ENV === 'test') {
  if (typeof afterEach === 'function') {
    afterEach(() => {
      clearMedia();
    });
  }
  if (typeof afterAll === 'function') {
    afterAll(() => {
      restoreMedia();
    });
  }
}
