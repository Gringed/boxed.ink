"use client";
import { useLayoutEffect, useRef, useState } from "react";

/**
 * Measures the grid container's width ourselves and derives rowHeight from
 * it, so a w×h block with w === h always renders as a perfect square.
 *
 * Must be used with react-grid-layout's bare `Responsive` component (NOT
 * wrapped in `WidthProvider`) and `width={width}` passed through explicitly.
 * Feeding react-grid-layout a width it measured independently would let our
 * rowHeight and its own internally-computed colWidth drift apart by a few
 * pixels, which is enough to turn a "square" into a visible rectangle.
 * Requires containerPadding={[0, 0]} on the grid — colWidth = (width -
 * margin*(cols-1)) / cols only matches react-grid-layout's own formula when
 * padding is zero.
 */
export function useSquareRowHeight(
  currentCols: number,
  margin: number,
  fallbackWidth = 800
) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallbackWidth);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.offsetWidth) setWidth(el.offsetWidth);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width) setWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
    // currentCols changes whenever the caller remounts the grid subtree
    // (e.g. desktop/mobile switch via a `key` prop) — re-run so we attach
    // to the fresh DOM node instead of measuring a detached one.
  }, [currentCols]);

  const rowHeight = Math.max(
    1,
    (width - margin * (currentCols - 1)) / currentCols
  );

  return { ref, width, rowHeight };
}
