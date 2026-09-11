'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useCurrency, DEFAULT_RATES } from "../../contexts/CurrencyContext";

interface PriceRangeFilterProps {
  /** Canonical INR lower bound, or undefined for "no minimum". */
  minPrice?: number;
  /** Canonical INR upper bound, or undefined for "no maximum". */
  maxPrice?: number;
  /** Fires once a change is finalised (drag release, blur, Enter) — never on every intermediate tick. */
  onCommit: (min?: number, max?: number) => void;
  /** Upper bound of the slider track, in canonical INR. Dragging to the far edge means "and above" (unbounded). */
  ceilingINR?: number;
}

const DEFAULT_CEILING_INR = 1_000_000;
const TEXT_COMMIT_DEBOUNCE_MS = 500;

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onCommit,
  ceilingINR = DEFAULT_CEILING_INR,
}: PriceRangeFilterProps) {
  const { currency, exchangeRates, getCurrencySymbol } = useCurrency();

  const inrRate = exchangeRates.INR || DEFAULT_RATES.INR;
  const targetRate = currency === "INR" ? 1 : (exchangeRates[currency] || DEFAULT_RATES[currency] || 1);

  const toDisplay = useCallback(
    (inr: number) => (currency === "INR" ? inr : (inr / inrRate) * targetRate),
    [currency, inrRate, targetRate]
  );
  const toINR = useCallback(
    (display: number) => (currency === "INR" ? display : (display / targetRate) * inrRate),
    [currency, inrRate, targetRate]
  );

  // Round the slider ceiling up to a clean number in the display currency so
  // labels never show odd fractions (e.g. ₹1,000,000 → $11,976 → $12,000).
  const ceilingDisplay = useMemo(() => {
    const raw = toDisplay(ceilingINR);
    if (raw <= 0) return 1;
    const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(raw)) - 1);
    return Math.ceil(raw / magnitude) * magnitude;
  }, [ceilingINR, toDisplay]);

  const step = useMemo(() => Math.max(1, Math.round(ceilingDisplay / 200)), [ceilingDisplay]);
  const bigStep = step * 10;

  const clamp = useCallback((v: number) => Math.min(ceilingDisplay, Math.max(0, v)), [ceilingDisplay]);

  // Draft values drive the slider UI; text fields have their own draft so a
  // half-typed number doesn't get reformatted mid-keystroke.
  const [draft, setDraft] = useState(() => ({
    min: minPrice != null ? clamp(toDisplay(minPrice)) : 0,
    max: maxPrice != null ? clamp(toDisplay(maxPrice)) : ceilingDisplay,
  }));
  const [minText, setMinText] = useState(() => (minPrice != null ? String(Math.round(toDisplay(minPrice))) : ""));
  const [maxText, setMaxText] = useState(() => (maxPrice != null ? String(Math.round(toDisplay(maxPrice))) : ""));

  // Mirrors `draft` for use inside event handlers/timeouts without stale closures.
  const draftRef = useRef(draft);
  useEffect(() => { draftRef.current = draft; }, [draft]);

  const draggingThumbRef = useRef<"min" | "max" | null>(null);
  const typingFieldRef = useRef<"min" | "max" | null>(null);
  const minDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const maxDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Re-sync from props (external Clear All, currency switch, back/forward nav)
  // — but never while the user is actively dragging or mid-keystroke, or we'd
  // clobber their in-progress input.
  useEffect(() => {
    if (draggingThumbRef.current || typingFieldRef.current) return;
    const nextMin = minPrice != null ? clamp(toDisplay(minPrice)) : 0;
    const nextMax = maxPrice != null ? clamp(toDisplay(maxPrice)) : ceilingDisplay;
    setDraft({ min: nextMin, max: nextMax });
    setMinText(minPrice != null ? String(Math.round(nextMin)) : "");
    setMaxText(maxPrice != null ? String(Math.round(nextMax)) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice, ceilingDisplay, currency]);

  // Dragging to the far edge of the track means "and above" / "and below" —
  // an explicit unbounded filter rather than a numeric cap at the ceiling.
  const commitFromSlider = useCallback((minD: number, maxD: number) => {
    const minINR = minD > 0 ? Math.floor(toINR(minD)) : undefined;
    const maxINR = maxD < ceilingDisplay ? Math.ceil(toINR(maxD)) : undefined;
    onCommit(minINR, maxINR);
  }, [toINR, ceilingDisplay, onCommit]);

  // A typed number is an explicit request, even past the slider's ceiling —
  // it is sent as-is rather than silently treated as unbounded.
  const commitFromText = useCallback((minD: number | undefined, maxD: number | undefined) => {
    const minINR = minD != null && minD > 0 ? Math.floor(toINR(minD)) : undefined;
    const maxINR = maxD != null ? Math.ceil(toINR(maxD)) : undefined;
    onCommit(minINR, maxINR);
  }, [toINR, onCommit]);

  // ── Slider ──────────────────────────────────────────────────────────────
  const trackRef = useRef<HTMLDivElement>(null);

  const valueFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const ratio = rect.width === 0 ? 0 : Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return clamp(Math.round((ratio * ceilingDisplay) / step) * step);
  }, [ceilingDisplay, step, clamp]);

  const beginDrag = (thumb: "min" | "max") => (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingThumbRef.current = thumb;
  };

  const onDragMove = (thumb: "min" | "max") => (e: React.PointerEvent) => {
    if (draggingThumbRef.current !== thumb) return;
    const v = valueFromClientX(e.clientX);
    setDraft((prev) =>
      thumb === "min" ? { min: Math.min(v, prev.max), max: prev.max } : { min: prev.min, max: Math.max(v, prev.min) }
    );
  };

  const endDrag = (thumb: "min" | "max") => (e: React.PointerEvent) => {
    if (draggingThumbRef.current !== thumb) return;
    draggingThumbRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    const { min, max } = draftRef.current;
    commitFromSlider(min, max);
    setMinText(min > 0 ? String(Math.round(min)) : "");
    setMaxText(max < ceilingDisplay ? String(Math.round(max)) : "");
  };

  const onKeyDownThumb = (thumb: "min" | "max") => (e: React.KeyboardEvent) => {
    const { min, max } = draftRef.current;
    let next = { min, max };
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = thumb === "min" ? { min: clamp(Math.min(min + step, max)), max } : { min, max: clamp(Math.max(max + step, min)) };
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = thumb === "min" ? { min: clamp(min - step), max } : { min, max: clamp(max - step) };
        break;
      case "PageUp":
        next = thumb === "min" ? { min: clamp(Math.min(min + bigStep, max)), max } : { min, max: clamp(Math.max(max + bigStep, min)) };
        break;
      case "PageDown":
        next = thumb === "min" ? { min: clamp(min - bigStep), max } : { min, max: clamp(max - bigStep) };
        break;
      case "Home":
        next = thumb === "min" ? { min: 0, max } : { min, max: min };
        break;
      case "End":
        next = thumb === "min" ? { min: max, max } : { min, max: ceilingDisplay };
        break;
      default:
        return;
    }
    e.preventDefault();
    setDraft(next);
    commitFromSlider(next.min, next.max);
    setMinText(next.min > 0 ? String(Math.round(next.min)) : "");
    setMaxText(next.max < ceilingDisplay ? String(Math.round(next.max)) : "");
  };

  // ── Numeric inputs ──────────────────────────────────────────────────────
  // Text fields are the source of truth for "is this bound explicit" — an
  // empty field means unbounded (undefined), never a sentinel numeric value,
  // so it can't be confused with a genuinely-typed number equal to the ceiling.
  const flushMin = useCallback((rawText: string) => {
    if (minDebounceRef.current) clearTimeout(minDebounceRef.current);
    typingFieldRef.current = null;
    const trimmed = rawText.trim();
    const safeMin = trimmed === "" ? 0 : Math.max(0, Number(trimmed));

    const maxTrimmed = maxText.trim();
    const currentMaxValue = maxTrimmed === "" ? undefined : Math.max(0, Number(maxTrimmed));
    // If min now exceeds an explicit max, pull the max up to match rather than going invalid.
    const nextMaxValue = currentMaxValue != null && safeMin > currentMaxValue ? safeMin : currentMaxValue;

    setDraft({
      min: clamp(safeMin),
      max: nextMaxValue != null ? clamp(nextMaxValue) : ceilingDisplay,
    });
    if (nextMaxValue !== currentMaxValue) {
      setMaxText(nextMaxValue != null ? String(Math.round(nextMaxValue)) : "");
    }
    commitFromText(safeMin > 0 ? safeMin : undefined, nextMaxValue);
  }, [clamp, ceilingDisplay, commitFromText, maxText]);

  const flushMax = useCallback((rawText: string) => {
    if (maxDebounceRef.current) clearTimeout(maxDebounceRef.current);
    typingFieldRef.current = null;
    const trimmed = rawText.trim();
    const finalMaxValue = trimmed === "" ? undefined : Math.max(0, Number(trimmed));

    const minTrimmed = minText.trim();
    const currentMinValue = minTrimmed === "" ? 0 : Math.max(0, Number(minTrimmed));
    // If max now falls below an explicit min, pull the min down to match rather than going invalid.
    const nextMinValue = finalMaxValue != null && currentMinValue > finalMaxValue ? finalMaxValue : currentMinValue;

    setDraft({
      min: clamp(nextMinValue),
      max: finalMaxValue != null ? clamp(finalMaxValue) : ceilingDisplay,
    });
    if (nextMinValue !== currentMinValue) {
      setMinText(nextMinValue > 0 ? String(Math.round(nextMinValue)) : "");
    }
    commitFromText(nextMinValue > 0 ? nextMinValue : undefined, finalMaxValue);
  }, [clamp, ceilingDisplay, commitFromText, minText]);

  const handleMinTextChange = (text: string) => {
    setMinText(text);
    typingFieldRef.current = "min";
    if (minDebounceRef.current) clearTimeout(minDebounceRef.current);
    minDebounceRef.current = setTimeout(() => flushMin(text), TEXT_COMMIT_DEBOUNCE_MS);
  };

  const handleMaxTextChange = (text: string) => {
    setMaxText(text);
    typingFieldRef.current = "max";
    if (maxDebounceRef.current) clearTimeout(maxDebounceRef.current);
    maxDebounceRef.current = setTimeout(() => flushMax(text), TEXT_COMMIT_DEBOUNCE_MS);
  };

  // Cancel pending debounces on unmount so they never fire against an unmounted filter.
  useEffect(() => () => {
    if (minDebounceRef.current) clearTimeout(minDebounceRef.current);
    if (maxDebounceRef.current) clearTimeout(maxDebounceRef.current);
  }, []);

  const symbol = getCurrencySymbol();
  const minPct = (draft.min / ceilingDisplay) * 100;
  const maxPct = (draft.max / ceilingDisplay) * 100;

  return (
    <div>
      {/* Numeric inputs */}
      <div className="flex items-center gap-2 mb-4">
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Minimum price</span>
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {symbol}
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={minText}
            placeholder="Min"
            onChange={(e) => handleMinTextChange(e.target.value.replace(/[^\d]/g, ""))}
            onBlur={(e) => flushMin(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.currentTarget.blur(); } }}
            className="w-full pl-6 pr-2 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-gray-900"
          />
        </label>
        <span className="text-gray-300 text-xs shrink-0">to</span>
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Maximum price</span>
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {symbol}
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={maxText}
            placeholder="Max"
            onChange={(e) => handleMaxTextChange(e.target.value.replace(/[^\d]/g, ""))}
            onBlur={(e) => flushMax(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.currentTarget.blur(); } }}
            className="w-full pl-6 pr-2 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 text-gray-900"
          />
        </label>
      </div>

      {/* Dual-thumb slider — side padding must be >= half the thumb's width (w-4 = 16px,
          so px-2 = 8px each side) or the thumb clips past this component's own box at 0%/100%. */}
      <div className="px-2">
        <div ref={trackRef} className="relative h-1.5 rounded-full bg-gray-200">
          <div
            className="absolute h-full rounded-full bg-gray-900"
            style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
          />
          <div
            role="slider"
            tabIndex={0}
            aria-label="Minimum price"
            aria-valuemin={0}
            aria-valuemax={ceilingDisplay}
            aria-valuenow={Math.round(draft.min)}
            onPointerDown={beginDrag("min")}
            onPointerMove={onDragMove("min")}
            onPointerUp={endDrag("min")}
            onPointerCancel={endDrag("min")}
            onLostPointerCapture={() => { draggingThumbRef.current = null; }}
            onKeyDown={onKeyDownThumb("min")}
            className="absolute top-1/2 w-4 h-4 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white border-2 border-gray-900 shadow cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-gray-400 touch-none"
            style={{ left: `${minPct}%` }}
          />
          <div
            role="slider"
            tabIndex={0}
            aria-label="Maximum price"
            aria-valuemin={0}
            aria-valuemax={ceilingDisplay}
            aria-valuenow={Math.round(draft.max)}
            onPointerDown={beginDrag("max")}
            onPointerMove={onDragMove("max")}
            onPointerUp={endDrag("max")}
            onPointerCancel={endDrag("max")}
            onLostPointerCapture={() => { draggingThumbRef.current = null; }}
            onKeyDown={onKeyDownThumb("max")}
            className="absolute top-1/2 w-4 h-4 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white border-2 border-gray-900 shadow cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-gray-400 touch-none"
            style={{ left: `${maxPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
