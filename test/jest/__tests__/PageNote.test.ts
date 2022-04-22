import { reactive } from 'vue';
import { factory } from '../../../src/boot/static/composition-root';
import { INoteCollab, PageNote } from '../../../src/boot/app/page/notes/note';

describe('DOM width', () => {
  let note: PageNote;

  beforeEach(() => {
    note = factory.makeNote(
      null as any,
      '',
      null,
      reactive(INoteCollab.parse({}))
    );
  });

  it('returns "max-content" if not pinned', () => {
    expect(note.react.width.dom).toBe('max-content');
  });

  it('returns pixels if self pinned', () => {
    note.collab.width.expanded = '100px';

    expect(note.react.width.dom).toBe('100px');
  });

  it('returns undefined if pinned by its parent', () => {
    note.react.parent = factory.makeNote(
      null as any,
      '',
      null,
      INoteCollab.parse({
        width: { expanded: '200px' },
        container: { enabled: true },
      } as INoteCollab)
    );

    expect(note.react.width.dom).toBe(undefined);
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
        } as INoteCollab)
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
