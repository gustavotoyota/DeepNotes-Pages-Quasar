import { reactive } from 'vue';
import { factory } from '../../../src/boot/static/composition-root';
import { INoteCollab, PageNote } from '../../../src/boot/app/page/notes/note';
import { z } from 'zod';

let note: PageNote;

beforeEach(() => {
  note = factory.makeNote(
    null as any,
    '',
    null,
    reactive(INoteCollab.parse({}))
  );
});

describe('DOM height', () => {
  it('returns expanded version if collapsed and height.collapsed is "auto"', () => {
    note.collab.head.height.collapsed = 'auto';
    note.collab.head.height.expanded = '100px';

    note.collab.collapsing.enabled = true;
    note.collab.collapsing.collapsed = true;

    expect(note.react.head.height).toBe('100px');
  });
});

describe('DOM width', () => {
  it('returns "max-content" if not pinned', () => {
    expect(note.react.width.final).toBe('max-content');
  });

  it('returns pixels if self pinned', () => {
    note.collab.width.expanded = '100px';

    expect(note.react.width.final).toBe('100px');
  });

  it('returns undefined if pinned by its parent', () => {
    note.react.parent = factory.makeNote(
      null as any,
      '',
      null,
      INoteCollab.parse({
        width: { expanded: '200px' },
        container: { enabled: true },
      } as z.input<typeof INoteCollab>)
    );

    expect(note.react.width.final).toBe(undefined);
  });

  it('returns expanded version if collapsed and width.collapsed is "auto"', () => {
    note.collab.width.expanded = '100px';

    note.collab.collapsing.enabled = true;
    note.collab.collapsing.collapsed = true;

    expect(note.react.width.final).toBe('100px');
  });
});

describe('Target width', () => {
  let note: PageNote;

  beforeEach(() => {
    note = factory.makeNote(
      null as any,
      '',
      null,
      reactive(INoteCollab.parse({}))
    );
  });

  it('returns undefined if note width is not pinned', () => {
    note.collab.width[note.react.sizeProp] = 'auto';

    expect(note.react.width.target).toBe(undefined);
  });

  it('returns "0px" if note width is pinned', () => {
    note.collab.width[note.react.sizeProp] = '100px';

    expect(note.react.width.target).toBe('0px');
  });

  describe('Parent interactions', () => {
    beforeEach(() => {
      note.react.parent = factory.makeNote(
        null as any,
        '',
        null,
        INoteCollab.parse({
          container: { enabled: true },
        } as z.input<typeof INoteCollab>)
      );
    });

    it('returns "0px" if has pinned width parent with stretched vertical children', () => {
      note.react.parent.collab.width.expanded = '100px';

      expect(note.react.width.target).toBe('0px');
    });

    it('returns undefined if has parent without pinned width', () => {
      note.react.parent.collab.width.expanded = 'auto';

      expect(note.react.width.target).toBe(undefined);
    });

    it('returns undefined if has parent with non stretched children', () => {
      note.react.parent.collab.container.stretchChildren = false;

      expect(note.react.width.target).toBe(undefined);
    });
  });
});
