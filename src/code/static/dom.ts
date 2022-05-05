export function hasVertScrollbar(elem: HTMLElement) {
  return (
    elem.scrollHeight > elem.clientHeight && elem.offsetWidth > elem.clientWidth
  );
}
export function hasHorizScrollbar(elem: HTMLElement) {
  return (
    elem.scrollWidth > elem.clientWidth && elem.offsetHeight > elem.clientHeight
  );
}

export function hasScrollbar(elem: HTMLElement) {
  return hasHorizScrollbar(elem) || hasVertScrollbar(elem);
}

export function isTouchOverScrollbar(event: TouchEvent, zoom?: number) {
  const elem = event.target as HTMLElement;

  const clientRect = elem.getBoundingClientRect();

  zoom = zoom ?? 1;

  const offsetX = (event.targetTouches[0].clientX - clientRect.x) / zoom;
  const offsetY = (event.targetTouches[0].clientY - clientRect.y) / zoom;

  if (hasVertScrollbar(elem) && offsetX > elem.clientWidth) return true;

  if (hasHorizScrollbar(elem) && offsetY > elem.clientHeight) return true;

  return false;
}

export function isMouseOverScrollbar(event: PointerEvent) {
  const elem = event.target as HTMLElement;

  if (hasVertScrollbar(elem) && event.offsetX > elem.clientWidth) return true;

  if (hasHorizScrollbar(elem) && event.offsetY > elem.clientHeight) return true;

  return false;
}

export function listenPointerEvents(
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

    if (options.move) document.removeEventListener('pointermove', options.move);

    document.removeEventListener('pointerup', pointerUpListener);

    options.up?.(upEvent);
  }
}
