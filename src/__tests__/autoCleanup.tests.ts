import { matchMedia } from '../index';

describe('automatic cleanup between tests', () => {
  const callback = jest.fn();

  afterEach(() => {
    callback.mockClear();
  });

  it('should set up the media environment', () => {
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQueryList.addEventListener('change', callback);

    matchMedia.mockMediaValue({
      width: '1200px',
      height: '800px',
      'prefers-color-scheme': 'dark',
    });
    expect(callback).toHaveBeenCalled();
    expect(mediaQueryList.matches).toBe(true);
  });

  it('should ensure that the media environment has been reset', () => {
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    expect(mediaQueryList.matches).toBe(false);

    matchMedia.mockMediaValue({ 'prefers-color-scheme': 'dark' });
    expect(callback).not.toHaveBeenCalled();
  });
});
