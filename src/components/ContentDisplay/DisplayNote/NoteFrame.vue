<template>
  <div
    class="note-frame"
    ref="frameElem"
    :style="{
      width: note.react.width.dom,

      position: note.parentId == null ? 'absolute' : 'relative',
      transform:
        note.parentId == null
          ? `translate(` +
            `${-note.collab.anchor.x * 100}%, ${-note.collab.anchor.y * 100}%)`
          : undefined,

      opacity: note.react.dragging ? '0.7' : undefined,
      'pointer-events': note.react.dragging ? 'none' : undefined,
    }"
  >
    <slot />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/boot/app/page/notes/note';
import { Vec2 } from 'src/boot/static/vec2';
import { inject, onMounted, onUnmounted, ref } from 'vue';

const note = inject<PageNote>('note')!;

const frameElem = ref<Element>();

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    // eslint-disable-next-line vue/no-mutating-props
    note.react.worldSize = new Vec2(
      entry.contentRect.width,
      entry.contentRect.height
    );
  }
});

onMounted(() => {
  resizeObserver.observe(frameElem.value!);
});
onUnmounted(() => {
  resizeObserver.unobserve(frameElem.value!);
});
</script>
