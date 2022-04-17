import { reactive } from 'vue';
import { factory } from '../../../src/boot/app/composition-root';
import { PageNote } from './../../../src/boot/app/page/notes/note';

describe('targetWidth', () => {
  let note: PageNote;

  beforeEach(() => {
    note = factory.makeNote(null as any, '', null, reactive({}));
  });

  it('returns "auto" if note is not stretched', () => {
    note.react.collabWidth[note.react.sizeProp] = 'auto';

    expect(note.react.targetWidth).toBe('auto');
  });

  it('returns "0px" if note is stretched', () => {
    note.react.collabWidth[note.react.sizeProp] = '100px';

    expect(note.react.targetWidth).toBe('0px');
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
      expect(note.react.targetWidth).toBe('0px');
    });

    it('returns "auto" if has non fixed width parent', () => {
      note.react.parent.react.collabWidth.expanded = 'auto';

      expect(note.react.targetWidth).toBe('auto');
    });

    it('returns "auto" if has parent with non stretched children', () => {
      note.react.parent.react.container.stretchChildren = false;

      expect(note.react.targetWidth).toBe('auto');
    });
  });
});
