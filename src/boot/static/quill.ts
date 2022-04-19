import * as QuillDelta from 'quill-delta';
import { z } from 'zod';

export type Op = QuillDelta.Op;
export type AttributeMap = QuillDelta.AttributeMap;

export const AttributeMap: z.ZodType<QuillDelta.AttributeMap> = z.record(
  z.unknown()
);
export const Op: z.ZodType<QuillDelta.Op> = z.object({
  insert: z.string().or(z.record(z.unknown())).optional(),
  delete: z.number().optional(),
  retain: z.number().or(z.record(z.unknown())).optional(),
  attributes: AttributeMap.optional(),
});

export const quillOptions = {
  theme: 'bubble',

  placeholder: '',

  formats: [
    'bold',
    'code',
    'italic',
    'link',
    'strike',
    'script',
    'underline',
    'blockquote',
    'header',
    'indent',
    'list',
    'align',
    'direction',
    'code-block',
    'formula',
    'image',
    'video',
  ],

  modules: {
    syntax: true,

    cursors: true,

    keyboard: {
      bindings: {
        'indent code-block': null,
        'outdent code-block': null,
      },
    },

    toolbar: [
      [
        'bold',
        'italic',
        'underline',
        'strike',
        { header: 1 },
        { header: 2 },
        'link',
        'image',
      ],
      [
        { align: '' },
        { align: 'center' },
        { align: 'right' },
        { align: 'justify' },
        { list: 'bullet' },
        { list: 'ordered' },
        { indent: '-1' },
        { indent: '+1' },
      ],
      [
        'code',
        'code-block',
        'blockquote',
        { script: 'sub' },
        { script: 'super' },
        'formula',
        'clean',
      ],
    ],
  },
};
