export class StaticUtils {
  hasVertScrollbar(elem: HTMLElement) {
    return (
      elem.scrollHeight > elem.clientHeight &&
      elem.offsetWidth > elem.clientWidth
    );
  }
  hasHorizScrollbar(elem: HTMLElement) {
    return (
      elem.scrollWidth > elem.clientWidth &&
      elem.offsetHeight > elem.clientHeight
    );
  }

  hasScrollbar(elem: HTMLElement) {
    return this.hasHorizScrollbar(elem) || this.hasVertScrollbar(elem);
  }

  isTouchOverScrollbar(event: TouchEvent, zoom?: number) {
    const elem = event.target as HTMLElement;

    const clientRect = elem.getBoundingClientRect();

    zoom = zoom ?? 1;

    const offsetX = (event.targetTouches[0].clientX - clientRect.x) / zoom;
    const offsetY = (event.targetTouches[0].clientY - clientRect.y) / zoom;

    if (this.hasVertScrollbar(elem) && offsetX > elem.clientWidth) return true;

    if (this.hasHorizScrollbar(elem) && offsetY > elem.clientHeight)
      return true;

    return false;
  }

  isMouseOverScrollbar(event: PointerEvent) {
    const elem = event.target as HTMLElement;

    if (this.hasVertScrollbar(elem) && event.offsetX > elem.clientWidth)
      return true;

    if (this.hasHorizScrollbar(elem) && event.offsetY > elem.clientHeight)
      return true;

    return false;
  }

  capitalizeFirst(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  listenPointerEvents(
    downEvent: PointerEvent,
    options: {
      move?: (event: PointerEvent) => void;
      up?: (event: PointerEvent) => void;
    }
  ) {
    if (options.move) document.addEventListener('pointermove', options.move);

    document.addEventListener('pointerup', pointerUpListener);

    function pointerUpListener(upEvent: PointerEvent) {
      if (upEvent.pointerId !== downEvent.pointerId) return;

      if (options.move)
        document.removeEventListener('pointermove', options.move);

      document.removeEventListener('pointerup', pointerUpListener);

      options.up?.(upEvent);
    }
  }
}
