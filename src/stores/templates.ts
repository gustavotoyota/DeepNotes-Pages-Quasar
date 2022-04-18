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
    list: [] as ITemplate[],
    defaultId: null,

    popup: {
      visible: false,
      pos: new Vec2({ x: 0, y: 0 }),
    },
  }),

  getters: {
    default(): ITemplate | undefined {
      return this.list.find((item) => item.id === this.defaultId);
    },
  },

  actions: {
    showPopup(pos: Vec2) {
      this.popup.pos = pos;
      this.popup.visible = true;
    },
  },
});
