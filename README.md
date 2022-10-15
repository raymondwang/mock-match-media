# mock-match-media

Test utility for mocking `window.matchMedia` in JSDOM environments.

JSDOM doesn't provide support for `window.matchMedia`, which means testing it in
Jest is pretty hard to do. Though the [official documentation](https://jestjs.io/docs/26.x/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom)
offers a workaround, that solution doesn't allow us to simulate changes to
resolved media query values or trigger event listeners.

This utility mocks out the unsupported `window.matchMedia` function for a fully
mocked substitution, with support for:

- Creating a `MediaQueryList` via `window.matchMedia`
- Changing the value of media states using a mocked state
- Observing changes to media states with `addEventListener`, `addListener`, and `onchange`
- Removing event listeners with `removeEventListener` and `removeListener`
- Dispatching explicit events using `dispatchEvent`
- Automatic environment cleanup between tests in Jest

## Usage

```ts
import { mockMedia } from '@raymondwang/mock-match-media';

it('should alert listeners when the user’s OS enters dark mode', () => {
  const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
  const spy = jest.fn();
  mediaQueryList.addEventListener('change', spy);
  // Mock the media state to indicate that the user prefers dark mode:
  mockMedia({ 'prefers-color-scheme': 'dark' });
  // Updating the mocked media state should call all listeners with changes:
  expect(spy).toHaveBeenCalledWith(expect.objectContaining({ matches: true }));
});
```

See MDN for more examples on [testing media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Testing_media_queries).

## API

This library exports three methods:

### mockMedia

Sets the value of a media feature in the mocked environment. For example, to
simulate a device with a width of 1200px and a height of 800px:

```ts
mockMedia({
  width: '1200px',
  height: '800px',
});
```

### clearMedia

Clears the mocked environment to its default values, without removing the mock.
In Jest, this is called automatically in each `afterEach` block by default.

### restoreMedia

Calls `clearMedia` and restores the original value of `window.matchMedia`.
In Jest, this is called automatically in each `afterAll` block by default.

## Support & caveats

This library is built against [css-mediaquery](https://github.com/ericf/css-mediaquery),
which follows the [Media Queries Level 3 spec](https://www.w3.org/TR/mediaqueries-3/).

This means it has out-of-the-box support for the following media features:

- `type` (`all` | `screen` | `print`)
- `any-hover`
- `any-pointer`
- `aspect-ratio`
- `color-index`
- `color`
- `device-aspect-ratio` (deprecated)
- `device-height` (deprecated)
- `device-width` (deprecated)
- `display-mode`
- `grid`
- `height` (`min-`, `max-`)
- `hover`
- `inverted-colors`
- `monochrome`
- `orientation`
- `pointer`
- `prefers-color-scheme`
- `prefers-contrast`
- `prefers-reduced-data`
- `prefers-reduced-motion`
- `prefers-reduced-transparency`
- `resolution`
- `scan`
- `width` (`min-`, `max-`)

It also supports compound media queries, like `'screen and (min-width: 1200px) and (max-width: 800px)'`,
or `(prefers-color-scheme: dark), (monochrome)'`.

However, it _does not_ support features proposed in the [Level 4 draft](https://www.w3.org/TR/mediaqueries-4/),
such as comparison operators (e.g. `(400px < width < 1000px)`) or combining
media features with the `or` keyword (e.g. `(pointer) or (hover)`).
