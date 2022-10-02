export class MockMediaQueryListEvent
  extends Event
  implements MediaQueryListEvent
{
  readonly matches: boolean;
  readonly media: string;

  constructor(type: 'change', options: Partial<MediaQueryListEvent>) {
    super(type);
    this.matches = options.matches ?? false;
    this.media = options.media ?? '';
  }
}
