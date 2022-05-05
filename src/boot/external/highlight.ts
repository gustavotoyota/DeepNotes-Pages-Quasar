import 'highlight.js/styles/atom-one-dark.css';

import hljs from 'highlight.js';

declare global {
  // eslint-disable-next-line no-var
  var hljs: any;
}

globalThis.hljs = hljs;
