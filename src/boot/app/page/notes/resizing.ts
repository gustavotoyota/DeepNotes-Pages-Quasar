import { listenPointerEvents } from 'src/boot/static/dom';
import { refProp } from 'src/boot/static/vue';
import { UnwrapRef } from 'vue';
import { AppPage } from '../page';
import { NoteSection, PageNote } from './note';

export interface IResizingReact {
  active: boolean;
}

export class PageResizing {
  page: AppPage;

  react: UnwrapRef<IResizingReact>;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp<IResizingReact>(this, 'react', {
      active: false,
    });
  }

  start(
    event: PointerEvent,
    note: PageNote,
    side: string,
    section?: NoteSection | null
  ) {
    this.react = {
      active: true,
    };

    listenPointerEvents(event, {
      move: this._update,
      up: this._finish,
    });
  }

  private _update = function (this: PageResizing, event: PointerEvent) {
    //
    console.log('Resizing');
  }.bind(this);

  private _finish = function (this: PageResizing, event: PointerEvent) {
    this.react.active = false;
  }.bind(this);
}
