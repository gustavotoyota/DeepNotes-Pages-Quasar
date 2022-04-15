import { boot } from 'quasar/wrappers';
import { onBeforeUnmount, onMounted } from 'vue';

export default boot(({ app }) => {
  app.mixin({
    setup() {
      // Release pointer down for touchscreen

      onMounted(() => {
        document.addEventListener('pointerdown', onPointerDownCapture, true);
      });

      function onPointerDownCapture(event: PointerEvent) {
        (event.target as Element).releasePointerCapture(event.pointerId);
      }

      onBeforeUnmount(() => {
        document.removeEventListener('pointerdown', onPointerDownCapture, true);
      });
    },
  });
});
