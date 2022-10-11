/**
 * Non-exhaustive list of media features supported (directly or indirectly) by
 * css-mediaquery. Note that the `MediaValues` export from @types/css-mediaquery
 * is even _more_ non-exhaustive, so we've handrolled a slightly better list.
 */
export type MediaFeature =
  | 'type'
  | 'any-hover'
  | 'any-pointer'
  | 'aspect-ratio'
  | 'color-index'
  | 'color'
  | 'device-aspect-ratio' // @deprecated
  | 'device-height' // @deprecated
  | 'device-width' // @deprecated
  | 'display-mode'
  | 'grid'
  | 'height'
  | 'hover'
  | 'inverted-colors'
  | 'monochrome'
  | 'orientation'
  | 'pointer'
  | 'prefers-color-scheme'
  | 'prefers-contrast'
  | 'prefers-reduced-data'
  | 'prefers-reduced-motion'
  | 'prefers-reduced-transparency'
  | 'resolution'
  | 'scan'
  | 'width';

export type MediaValues = Partial<Record<MediaFeature, unknown>>;
