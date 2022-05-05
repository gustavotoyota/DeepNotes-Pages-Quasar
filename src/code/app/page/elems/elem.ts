import { refProp } from 'src/code/static/vue';
import { UnwrapRef } from 'vue';
import { AppPage } from '../page';

export enum ElemType {
  PAGE = 'page',
  NOTE = 'note',
  ARROW = 'arrow',
}

export interface IElemReact {
  active: boolean;
  selected: boolean;
}

export class PageElem {
  readonly page: AppPage;

  id: string;
  type: ElemType;
  parentId: string | null;

  react: UnwrapRef<IElemReact>;

  constructor(
    page: AppPage,
    id: string,
    type: ElemType,
    parentId: string | null
  ) {
    this.page = page;

    this.id = id;
    this.type = type;
    this.parentId = parentId;

    this.react = refProp<IElemReact>(this, 'react', {
      active: this.page && this.page.activeElem.is(this.id),
      selected: this.page && this.page.selection.has(this),
    });
  }
}
