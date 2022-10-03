import { MediaState } from '../MediaState';
import { mockMatchMedia } from '../mockMatchMedia';

describe('mockMatchMedia', () => {
  const originalMatchMedia = window.matchMedia;
  let matchMedia: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    matchMedia = mockMatchMedia();
  });

  afterEach(() => {
    matchMedia.mockRestore();
  });

  it('should overwrite `window.matchMedia` and restore it on cleanup', () => {
    expect(window.matchMedia).not.toEqual(originalMatchMedia);

    matchMedia.mockRestore();
    expect(window.matchMedia).toEqual(originalMatchMedia);
  });

  it('should update MediaState values', () => {
    expect(MediaState.values).toEqual({});

    matchMedia.mockMediaValue({
      orientation: 'landscape',
      width: '800px',
      height: '600px',
      'aspect-ratio': '4/3',
      'prefers-color-scheme': 'dark',
    });
    expect(MediaState.values).toEqual({
      orientation: 'landscape',
      width: '800px',
      height: '600px',
      'aspect-ratio': '4/3',
      'prefers-color-scheme': 'dark',
    });

    // Should not unset existing values:
    matchMedia.mockMediaValue({});
    expect(MediaState.values).toEqual({
      orientation: 'landscape',
      width: '800px',
      height: '600px',
      'aspect-ratio': '4/3',
      'prefers-color-scheme': 'dark',
    });

    matchMedia.mockClear();
    expect(MediaState.values).toEqual({});
  });

  describe('window.matchMedia', () => {
    it('should be a jest function that can be spied on', () => {
      const matchMediaSpy = jest.spyOn(window, 'matchMedia');
      const media = 'print';
      window.matchMedia(media);
      expect(matchMediaSpy).toHaveBeenCalledWith(media);
      matchMediaSpy.mockRestore();
    });

    it('should create a MediaQueryList with a single query', () => {
      const media = '(prefers-color-scheme: dark)';
      const mediaQueryList = window.matchMedia(media);
      expect(mediaQueryList.media).toBe(media);
      expect(mediaQueryList.matches).toBe(false);

      matchMedia.mockMediaValue({ 'prefers-color-scheme': 'dark' });
      expect(mediaQueryList.matches).toBe(true);
    });

    it('should create a MediaQueryList with compound queries', () => {
      const media = '(min-width: 800px) and (max-width: 1200px)';
      const mediaQueryList = window.matchMedia(media);
      expect(mediaQueryList.media).toBe(media);
      expect(mediaQueryList.matches).toBe(false);

      matchMedia.mockMediaValue({ width: '800px' });
      expect(mediaQueryList.matches).toBe(true);

      matchMedia.mockMediaValue({ width: '1201px' });
      expect(mediaQueryList.matches).toBe(false);

      matchMedia.mockMediaValue({ width: '799px' });
      expect(mediaQueryList.matches).toBe(false);
    });

    it('should create a MediaQueryList with multiple features', () => {
      const media =
        '(max-width: 428px) and (max-height: 928px) and (orientation: landscape)';
      const mediaQueryList = window.matchMedia(media);
      expect(mediaQueryList.media).toBe(media);

      matchMedia.mockMediaValue({ width: '400px', height: '900px' });
      expect(mediaQueryList.matches).toBe(false);

      matchMedia.mockMediaValue({ orientation: 'landscape' });
      expect(mediaQueryList.matches).toBe(true);
    });

    it('should handle media type', () => {
      const media = 'screen';
      const mediaQueryList = window.matchMedia(media);

      matchMedia.mockMediaValue({ type: 'screen' });
      expect(mediaQueryList.matches).toBe(true);

      matchMedia.mockMediaValue({ type: 'print' });
      expect(mediaQueryList.matches).toBe(false);
    });

    it('should always satisfy the "all" media type', () => {
      const media = 'all';
      const mediaQueryList = window.matchMedia(media);
      expect(mediaQueryList.matches).toBe(true);

      matchMedia.mockMediaValue({ type: 'screen' });
      expect(mediaQueryList.matches).toBe(true);

      matchMedia.mockMediaValue({ type: 'print' });
      expect(mediaQueryList.matches).toBe(true);
    });

    it('should expose an onchange handler that can be used to respond to changes', () => {
      const media = '(min-width: 1200px)';
      const mediaQueryList = window.matchMedia(media);
      mediaQueryList.onchange = jest.fn();

      matchMedia.mockMediaValue({ width: '1600px' });
      expect(mediaQueryList.onchange).toHaveBeenCalledWith(
        expect.objectContaining({
          media,
          matches: true,
        }),
      );

      matchMedia.mockMediaValue({ width: '800px' });
      expect(mediaQueryList.onchange).toHaveBeenCalledWith(
        expect.objectContaining({
          media,
          matches: false,
        }),
      );
    });
  });

  describe('addEventListener', () => {
    it('should dispatch a callback when the value of matches changes', () => {
      const media = '(prefers-color-scheme: dark)';
      const mediaQueryList = window.matchMedia(media);
      const callback = jest.fn();
      mediaQueryList.addEventListener('change', callback);

      matchMedia.mockMediaValue({ 'prefers-color-scheme': 'dark' });
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ media, matches: true }),
      );

      matchMedia.mockMediaValue({ 'prefers-color-scheme': 'light' });
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ media, matches: false }),
      );
    });

    it('should not dispatch a callback when the value of matches does not change', () => {
      matchMedia.mockMediaValue({ width: '800px', height: '600px' });
      const media = '(max-width: 1200px) and (max-height: 800px)';
      const mediaQueryList = window.matchMedia(media);
      expect(mediaQueryList.matches).toBe(true);

      const callback = jest.fn();
      mediaQueryList.addEventListener('change', callback);

      matchMedia.mockMediaValue({ width: '1000px', height: '700px' });
      expect(mediaQueryList.matches).toBe(true);
      expect(callback).not.toHaveBeenCalled();

      matchMedia.mockMediaValue({ 'prefers-color-scheme': 'dark' });
      expect(callback).not.toHaveBeenCalled();
    });

    it('should dispatch a callback when the value of matches changes only once, if specified', () => {
      const media = '(prefers-color-scheme: dark)';
      const mediaQueryList = window.matchMedia(media);
      const callback = jest.fn();
      mediaQueryList.addEventListener('change', callback, { once: true });

      matchMedia.mockMediaValue({ 'prefers-color-scheme': 'dark' });
      expect(mediaQueryList.matches).toBe(true);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ media, matches: true }),
      );

      matchMedia.mockMediaValue({ 'prefers-color-scheme': 'light' });
      expect(mediaQueryList.matches).toBe(false);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not add the same callback multiple times', () => {
      const media = '(orientation: landscape)';
      const mediaQueryList = window.matchMedia(media);
      const callback = jest.fn();
      mediaQueryList.addEventListener('change', callback);
      mediaQueryList.addEventListener('change', callback);

      matchMedia.mockMediaValue({ orientation: 'landscape' });
      expect(callback).toHaveBeenCalledTimes(1);

      matchMedia.mockMediaValue({ orientation: 'portrait' });
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should support multiple different callbacks', () => {
      const media = 'print';
      const mediaQueryList = window.matchMedia(media);
      const callbacks = [jest.fn(), jest.fn()];
      callbacks.forEach((callback) => {
        mediaQueryList.addEventListener('change', callback);
      });

      matchMedia.mockMediaValue({ type: 'print' });
      callbacks.forEach((callback) => {
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            media,
            matches: true,
          }),
        );
      });

      matchMedia.mockMediaValue({ type: 'screen' });
      callbacks.forEach((callback) => {
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            media,
            matches: false,
          }),
        );
      });
    });

    it('should not add an event listener if the first argument is not `change`', () => {
      const media = '(orientation: portrait)';
      const mediaQueryListener = window.matchMedia(media);
      const callback = jest.fn();
      mediaQueryListener.addEventListener('click', callback);

      matchMedia.mockMediaValue({ orientation: 'portrait' });
      expect(mediaQueryListener.matches).toBe(true);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('addListener (deprecated)', () => {
    it('should dispatch a callback when the value of matches changes', () => {
      const media = '(prefers-color-scheme: dark)';
      const mediaQueryList = window.matchMedia(media);
      const callback = jest.fn();
      mediaQueryList.addListener(callback);

      matchMedia.mockMediaValue({ 'prefers-color-scheme': 'dark' });
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ media, matches: true }),
      );

      matchMedia.mockMediaValue({ 'prefers-color-scheme': 'light' });
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ media, matches: false }),
      );
    });

    it('should not dispatch a callback when the value of matches does not change', () => {
      matchMedia.mockMediaValue({ width: '800px', height: '600px' });
      const media = '(max-width: 1200px) and (max-height: 800px)';
      const mediaQueryList = window.matchMedia(media);
      expect(mediaQueryList.matches).toBe(true);

      const callback = jest.fn();
      mediaQueryList.addListener(callback);

      matchMedia.mockMediaValue({ width: '1000px', height: '700px' });
      expect(mediaQueryList.matches).toBe(true);
      expect(callback).not.toHaveBeenCalled();

      matchMedia.mockMediaValue({ 'prefers-color-scheme': 'dark' });
      expect(callback).not.toHaveBeenCalled();
    });

    it('should not add the same callback multiple times', () => {
      const media = '(orientation: landscape)';
      const mediaQueryList = window.matchMedia(media);
      const callback = jest.fn();
      mediaQueryList.addListener(callback);
      mediaQueryList.addListener(callback);

      matchMedia.mockMediaValue({ orientation: 'landscape' });
      expect(callback).toHaveBeenCalledTimes(1);

      matchMedia.mockMediaValue({ orientation: 'portrait' });
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should support multiple different callbacks', () => {
      const media = 'print';
      const mediaQueryList = window.matchMedia(media);
      const callbacks = [jest.fn(), jest.fn()];
      callbacks.forEach((callback) => {
        mediaQueryList.addListener(callback);
      });

      matchMedia.mockMediaValue({ type: 'print' });
      callbacks.forEach((callback) => {
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            media,
            matches: true,
          }),
        );
      });

      matchMedia.mockMediaValue({ type: 'screen' });
      callbacks.forEach((callback) => {
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            media,
            matches: false,
          }),
        );
      });
    });
  });

  describe('removeEventListener', () => {
    it('should stop dispatching events even when the value of matches changes', () => {
      const media = '(aspect-ratio: 1/1)';
      const mediaQueryList = window.matchMedia(media);
      const callback = jest.fn();
      mediaQueryList.addEventListener('change', callback);

      matchMedia.mockMediaValue({ 'aspect-ratio': '100/100' });
      expect(mediaQueryList.matches).toBe(true);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          media,
          matches: true,
        }),
      );

      mediaQueryList.removeEventListener('change', callback);
      matchMedia.mockMediaValue({ 'aspect-ratio': '9/5' });
      expect(mediaQueryList.matches).toBe(false);
      expect(callback).not.toHaveBeenCalledWith(
        expect.objectContaining({
          media,
          matches: false,
        }),
      );
    });

    it('should noop when removing an unregistered callback', () => {
      const media = '(min-width: 800px)';
      const mediaQueryList = window.matchMedia(media);
      const callback = jest.fn();
      mediaQueryList.removeEventListener('change', callback);

      matchMedia.mockMediaValue({ width: '900px' });
      expect(callback).not.toHaveBeenCalled();
    });

    it('should only remove the given callback', () => {
      const media = '(max-height: 600px)';
      const mediaQueryList = window.matchMedia(media);
      const [callback1, callback2] = [jest.fn(), jest.fn()];
      mediaQueryList.addEventListener('change', callback1);
      mediaQueryList.addEventListener('change', callback2);
      mediaQueryList.removeEventListener('change', callback2);

      matchMedia.mockMediaValue({ height: '400px' });
      expect(callback1).toHaveBeenCalledWith(
        expect.objectContaining({
          media,
          matches: true,
        }),
      );
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should not remove an event listener if the first argument is not `change`', () => {
      const media = '(orientation: portrait)';
      const mediaQueryListener = window.matchMedia(media);
      const callback = jest.fn();
      mediaQueryListener.addEventListener('change', callback);
      mediaQueryListener.removeEventListener('click', callback);

      matchMedia.mockMediaValue({ orientation: 'portrait' });
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          media,
          matches: true,
        }),
      );
    });
  });

  describe('removeListener (deprecated)', () => {
    it('should stop dispatching events even when the value of matches changes', () => {
      const media = '(aspect-ratio: 1/1)';
      const mediaQueryList = window.matchMedia(media);
      const callback = jest.fn();
      mediaQueryList.addListener(callback);

      matchMedia.mockMediaValue({ 'aspect-ratio': '100/100' });
      expect(mediaQueryList.matches).toBe(true);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          media,
          matches: true,
        }),
      );

      mediaQueryList.removeListener(callback);
      matchMedia.mockMediaValue({ 'aspect-ratio': '9/5' });
      expect(mediaQueryList.matches).toBe(false);
      expect(callback).not.toHaveBeenCalledWith(
        expect.objectContaining({
          media,
          matches: false,
        }),
      );
    });

    it('should noop when removing an unregistered callback', () => {
      const media = '(min-width: 800px)';
      const mediaQueryList = window.matchMedia(media);
      const callback = jest.fn();
      mediaQueryList.removeListener(callback);

      matchMedia.mockMediaValue({ width: '900px' });
      expect(callback).not.toHaveBeenCalled();
    });

    it('should only remove the given callback', () => {
      const media = '(max-height: 600px)';
      const mediaQueryList = window.matchMedia(media);
      const [callback1, callback2] = [jest.fn(), jest.fn()];
      mediaQueryList.addListener(callback1);
      mediaQueryList.addListener(callback2);
      mediaQueryList.removeListener(callback2);

      matchMedia.mockMediaValue({ height: '400px' });
      expect(callback1).toHaveBeenCalledWith(
        expect.objectContaining({
          media,
          matches: true,
        }),
      );
      expect(callback2).not.toHaveBeenCalled();
    });
  });
});
