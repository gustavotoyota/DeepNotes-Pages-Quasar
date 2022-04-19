import {
  computed,
  ComputedRef,
  shallowReactive,
  ShallowReactive,
  UnwrapRef,
} from 'vue';
import { Vec2 } from '../static/vec2';
import { refProp } from '../static/vue';
import { DeepNotesApp } from './app';
import { ISerialNote } from './serialization';

export interface ITemplate {
  id: string;
  name: string;
  visible: boolean;
  data: ISerialNote;
}

export interface ITemplatesReact {
  list: ShallowReactive<ITemplate[]>;

  defaultId: string;
  default: ComputedRef<ITemplate>;

  popup: {
    visible: boolean;
    pos: Vec2;
  };
}

export class AppTemplates {
  readonly app: DeepNotesApp;

  react: UnwrapRef<ITemplatesReact>;

  constructor(app: DeepNotesApp) {
    this.app = app;

    this.react = refProp<ITemplatesReact>(this, 'react', {
      list: shallowReactive<ITemplate[]>([
        {
          id: 'default',
          name: 'Default',
          visible: true,
          data: {
            head: { value: [{ insert: '\n' }] },
            body: { value: [{ insert: '\n' }] },
          },
        },
      ]),

      defaultId: 'default',

      default: computed(
        () =>
          this.react.list.find((item) => {
            return item.id === this.react.defaultId;
          })!
      ),

      popup: {
        visible: true,
        pos: new Vec2(0, 0),
      },
    });
  }

  showPopup(pos: Vec2) {
    this.react.popup.pos = pos;
    this.react.popup.visible = true;
  }
}
