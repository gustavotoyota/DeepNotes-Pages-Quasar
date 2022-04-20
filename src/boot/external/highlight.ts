import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

declare global {
  // eslint-disable-next-line no-var
  var hljs: any;
}

globalThis.hljs = hljs;
