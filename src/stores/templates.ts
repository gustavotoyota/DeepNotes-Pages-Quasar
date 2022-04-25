import { defineStore } from 'pinia';
import { ISerialNoteInput } from 'src/boot/app/serialization';
import { Vec2 } from 'src/boot/static/vec2';

export interface ITemplate {
  id: string;
  name: string;
  visible: boolean;
  data: ISerialNoteInput;
}

export const useTemplates = defineStore('templates', {
  state: () => ({
    list: [
      {
        id: 'head',
        name: 'Head',
        visible: true,
        data: {},
      },
      {
        id: 'body',
        name: 'Body',
        visible: true,
        data: {
          head: { enabled: false },
          body: { enabled: true },
        },
      },
      {
        id: 'head-and-body',
        name: 'Head and body',
        visible: true,
        data: {
          body: { enabled: true },
        },
      },
      {
        id: 'headed-container',
        name: 'Headed container',
        visible: true,
        data: {
          container: { enabled: true },
        },
      },
    ] as ITemplate[],

    defaultId: 'head',

    popup: {
      visible: false,
      pos: new Vec2({ x: 0, y: 0 }),
    },
  }),

  getters: {
    default(): ITemplate {
      return this.list.find((item) => item.id === this.defaultId) as ITemplate;
    },
  },

  actions: {
    showPopup(pos: Vec2) {
      this.popup.visible = true;
      this.popup.pos = pos;
    },
  },
});
