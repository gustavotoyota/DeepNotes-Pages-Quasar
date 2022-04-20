import { defineStore } from 'pinia';
import { ISerialNote } from 'src/boot/app/serialization';
import { Vec2 } from 'src/boot/static/vec2';

export interface ITemplate {
  id: string;
  name: string;
  visible: boolean;
  data: ISerialNote;
}

export const useTemplates = defineStore('templates', {
  state: () => ({
    list: [
      {
        id: 'default',
        name: 'Default',
        visible: true,
        data: {
          head: {
            enabled: false,
            value: [{ insert: '\n' }],
          },
          body: {
            enabled: true,
            value: [{ insert: '\n' }],
          },
        },
      },
    ] as ITemplate[],
    defaultId: 'default',

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
