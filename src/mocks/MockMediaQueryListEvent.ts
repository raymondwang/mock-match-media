/**
 * MediaQueryListEvent technically has a constructor, but it's not available
 * in JSDOM, so we have to create this simulacrum.
 */
export class MockMediaQueryListEvent
  extends Event
  implements MediaQueryListEvent
{
  readonly matches: boolean;
  readonly media: string;

  constructor(
    type: 'change',
    options: Pick<MediaQueryListEvent, 'matches' | 'media'>,
  ) {
    super(type);
    this.matches = options.matches;
    this.media = options.media;
  }
}
