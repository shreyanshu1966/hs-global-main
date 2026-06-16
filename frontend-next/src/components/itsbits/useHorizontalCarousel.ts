'use client';
import { useCallback, useEffect, useRef, useState } from "react";

export const useHorizontalCarousel = (stepRatio = 0.9) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const left = Math.max(0, el.scrollLeft);

    setCanScrollPrev(left > 2);
    setCanScrollNext(left < maxScrollLeft - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    const resizeObserver = new ResizeObserver(() => updateScrollState());
    resizeObserver.observe(el);

    // Track dynamic card loading and image sizing changes.
    const mutationObserver = new MutationObserver(() => updateScrollState());
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "src"],
    });

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [updateScrollState]);

  const scrollByDirection = useCallback((direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;

    const amount = Math.max(220, el.clientWidth * stepRatio);
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }, [stepRatio]);

  const scrollPrev = useCallback(() => scrollByDirection(-1), [scrollByDirection]);
  const scrollNext = useCallback(() => scrollByDirection(1), [scrollByDirection]);

  return {
    trackRef,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
  };
};
