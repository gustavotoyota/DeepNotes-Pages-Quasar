import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import 'quill/dist/quill.bubble.css'; // for bubble theme

Quill.register('modules/cursors', QuillCursors);

const Align = Quill.import('attributors/style/align');
const Icons = Quill.import('ui/icons');
Icons.align['left'] = Icons.align['']; // set icon for 'left' option, otherwise it's replaced with 'undefined' text
Align.whitelist = ['left', 'center', 'right', 'justify']; // add explicit 'left' option
Quill.register(Align, true);

const Size = Quill.import('attributors/style/size');
Size.whitelist = [
  '8px',
  '9px',
  '10px',
  '12px',
  '14px',
  '16px',
  '20px',
  '24px',
  '32px',
  '42px',
  '54px',
  '68px',
  '84px',
  '98px',
];
Quill.register(Size, true);

const AlignStyle = Quill.import('attributors/style/align');
const BackgroundStyle = Quill.import('attributors/style/background');
const ColorStyle = Quill.import('attributors/style/color');
const DirectionStyle = Quill.import('attributors/style/direction');
const FontStyle = Quill.import('attributors/style/font');
const SizeStyle = Quill.import('attributors/style/size');

Quill.register(AlignStyle, true);
Quill.register(BackgroundStyle, true);
Quill.register(ColorStyle, true);
Quill.register(DirectionStyle, true);
Quill.register(FontStyle, true);
Quill.register(SizeStyle, true);
