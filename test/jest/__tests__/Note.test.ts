import { reactive } from 'vue';
import { factory } from '../../../src/boot/static/composition-root';
import { PageNote } from './../../../src/boot/app/page/notes/note';

describe('width.target', () => {
  let note: PageNote;

  beforeEach(() => {
    note = factory.makeNote(null as any, '', null, reactive({}));
  });

  it('returns "auto" if note is not stretched', () => {
    note.collab.width[note.react.sizeProp] = 'auto';

    expect(note.react.width.target).toBe('auto');
  });

  it('returns "0px" if note is stretched', () => {
    note.collab.width[note.react.sizeProp] = '100px';

    expect(note.react.width.target).toBe('0px');
  });

  describe('Parent interactions', () => {
    beforeEach(() => {
      note.react.parent = factory.makeNote(null as any, '', null, {
        width: {
          expanded: '100px',
        },
        container: {
          enabled: true,
          horizontal: false,
          stretchChildren: true,
        },
      });
    });

    it('returns "0px" if has fixed width parent with stretched vertical children', () => {
      expect(note.react.width.target).toBe('0px');
    });

    it('returns "auto" if has non fixed width parent', () => {
      note.react.parent.collab.width.expanded = 'auto';

      expect(note.react.width.target).toBe('auto');
    });

    it('returns "auto" if has parent with non stretched children', () => {
      note.react.parent.collab.container.stretchChildren = false;

      expect(note.react.width.target).toBe('auto');
    });
  });
});
