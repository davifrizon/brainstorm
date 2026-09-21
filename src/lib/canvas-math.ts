export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export function screenToWorld(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  viewport: Viewport
) {
  return {
    x: (clientX - rect.left - viewport.x) / viewport.zoom,
    y: (clientY - rect.top - viewport.y) / viewport.zoom,
  };
}

export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 2.5;

export function clampZoom(z: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}
