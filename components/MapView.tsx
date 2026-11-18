"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAP_ASPECT, clamp, type Point } from "@/lib/geo";

type View = { cx: number; cy: number; z: number };

type Props = {
  guess: Point | null;
  answer: Point | null;
  revealed: boolean;
  disabled: boolean;
  /** Changes every question so the map can fly back to the overview. */
  resetKey: number;
  distanceLabel: string | null;
  onGuess: (p: Point) => void;
};

const MAX_ZOOM = 8;
const HOME: View = { cx: 0.5, cy: 0.5, z: 1 };
const DRAG_THRESHOLD = 6;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function MapView({ guess, answer, revealed, disabled, resetKey, distanceLabel, onGuess }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setViewState] = useState<View>(HOME);

  const viewRef = useRef<View>(HOME);
  const sizeRef = useRef(size);
  const animToken = useRef(0);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ x: number; y: number; view: View; moved: boolean } | null>(null);
  const lastPinch = useRef<number | null>(null);

  sizeRef.current = size;

  // ---- geometry helpers --------------------------------------------------
  const fit = useCallback(() => {
    const { w, h } = sizeRef.current;
    const fitW = Math.min(w, h * MAP_ASPECT);
    return { fitW, fitH: fitW / MAP_ASPECT, w, h };
  }, []);

  const clampView = useCallback(
    (v: View): View => {
      const { fitW, fitH, w, h } = fit();
      if (!fitW) return v;
      const z = clamp(v.z, 1, MAX_ZOOM);
      const halfX = w / (2 * fitW * z);
      const halfY = h / (2 * fitH * z);
      const cx = halfX >= 0.5 ? 0.5 : clamp(v.cx, halfX, 1 - halfX);
      const cy = halfY >= 0.5 ? 0.5 : clamp(v.cy, halfY, 1 - halfY);
      return { cx, cy, z };
    },
    [fit]
  );

  const setView = useCallback(
    (v: View) => {
      const next = clampView(v);
      viewRef.current = next;
      setViewState(next);
    },
    [clampView]
  );

  const zoomAt = useCallback(
    (px: number, py: number, newZ: number) => {
      const { fitW, fitH, w, h } = fit();
      if (!fitW) return;
      const v = viewRef.current;
      const z = clamp(newZ, 1, MAX_ZOOM);
      const nx = v.cx + (px - w / 2) / (fitW * v.z);
      const ny = v.cy + (py - h / 2) / (fitH * v.z);
      setView({ cx: nx - (px - w / 2) / (fitW * z), cy: ny - (py - h / 2) / (fitH * z), z });
    },
    [fit, setView]
  );

  const cancelAnimation = useCallback(() => {
    animToken.current++;
  }, []);

  /** Smooth fly-to: log-interpolated zoom, linear pan, eased. */
  const flyTo = useCallback(
    (target: View, duration: number) =>
      new Promise<void>((resolve) => {
        const token = ++animToken.current;
        const from = viewRef.current;
        const to = clampView(target);
        const t0 = performance.now();
        const step = (now: number) => {
          if (token !== animToken.current) return resolve();
          const t = clamp((now - t0) / duration, 0, 1);
          const e = easeInOutCubic(t);
          setView({
            cx: from.cx + (to.cx - from.cx) * e,
            cy: from.cy + (to.cy - from.cy) * e,
            z: Math.exp(Math.log(from.z) + (Math.log(to.z) - Math.log(from.z)) * e),
          });
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      }),
    [clampView, setView]
  );

  // ---- resize ------------------------------------------------------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      sizeRef.current = { w: r.width, h: r.height };
      setSize({ w: r.width, h: r.height });
      setView(viewRef.current);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [setView]);

  // ---- wheel zoom (non-passive so we can preventDefault) -----------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cancelAnimation();
      const r = el.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, viewRef.current.z * Math.exp(-e.deltaY * 0.0016));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt, cancelAnimation]);

  // ---- new question: fly back to the overview ----------------------------
  useEffect(() => {
    flyTo(HOME, resetKey === 0 ? 1 : 900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // ---- reveal: frame both points, then zoom in on the true answer --------
  useEffect(() => {
    if (!revealed || !answer) return;
    let cancelled = false;
    (async () => {
      const { fitW, fitH, w, h } = fit();
      if (guess && fitW) {
        const dx = Math.max(Math.abs(guess.x - answer.x), 0.004);
        const dy = Math.max(Math.abs(guess.y - answer.y), 0.004);
        const z = clamp(Math.min((0.62 * w) / (fitW * dx), (0.62 * h) / (fitH * dy)), 1, 7);
        await flyTo({ cx: (guess.x + answer.x) / 2, cy: (guess.y + answer.y) / 2, z }, 1000);
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 900));
        if (cancelled) return;
      }
      await flyTo({ cx: answer.x, cy: answer.y, z: 4.5 }, 1800);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  // ---- pointer interaction ----------------------------------------------
  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    cancelAnimation();
    if (pointers.current.size === 1) {
      drag.current = { x: e.clientX, y: e.clientY, view: viewRef.current, moved: false };
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      lastPinch.current = Math.hypot(a.x - b.x, a.y - b.y);
      if (drag.current) drag.current.moved = true;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const rect = containerRef.current!.getBoundingClientRect();

    if (pointers.current.size === 2 && lastPinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2 - rect.left;
      const my = (a.y + b.y) / 2 - rect.top;
      zoomAt(mx, my, viewRef.current.z * (dist / lastPinch.current));
      lastPinch.current = dist;
      return;
    }

    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) d.moved = true;
    if (d.moved) {
      const { fitW, fitH } = fit();
      setView({ cx: d.view.cx - dx / (fitW * d.view.z), cy: d.view.cy - dy / (fitH * d.view.z), z: d.view.z });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    const wasSingle = pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    lastPinch.current = null;
    if (pointers.current.size === 0) drag.current = null;

    if (!d || d.moved || !wasSingle || disabled) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const { fitW, fitH, w, h } = fit();
    const v = viewRef.current;
    const x = v.cx + (e.clientX - rect.left - w / 2) / (fitW * v.z);
    const y = v.cy + (e.clientY - rect.top - h / 2) / (fitH * v.z);
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    onGuess({ x, y });
  };

  const onPointerCancel = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    lastPinch.current = null;
    if (pointers.current.size === 0) drag.current = null;
  };

  // ---- render ------------------------------------------------------------
  const { fitW, fitH, w, h } = fit();
  const toPx = (p: Point) => ({
    x: w / 2 + (p.x - view.cx) * fitW * view.z,
    y: h / 2 + (p.y - view.cy) * fitH * view.z,
  });
  const origin = toPx({ x: 0, y: 0 });
  const g = guess ? toPx(guess) : null;
  const a = answer && revealed ? toPx(answer) : null;

  const zoomBy = (factor: number) => {
    cancelAnimation();
    zoomAt(w / 2, h / 2, viewRef.current.z * factor);
  };

  return (
    <div
      ref={containerRef}
      className={`map ${disabled ? "map--locked" : "map--live"}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      role="application"
      aria-label="Map of Azeroth. Click to place your guess."
    >
      {fitW > 0 && (
        <div className="map__world" style={{ left: origin.x, top: origin.y, width: fitW * view.z, height: fitH * view.z }}>
          <img
            className="map__img"
            src="/maps/azeroth.png"
            alt="World of Warcraft Classic world map"
            draggable={false}
          />
        </div>
      )}

      {/* Line between guess and answer */}
      {g && a && (
        <svg className="map__overlay" width={w} height={h} aria-hidden>
          <line className="map__line-glow" x1={g.x} y1={g.y} x2={a.x} y2={a.y} pathLength={1} />
          <line className="map__line" x1={g.x} y1={g.y} x2={a.x} y2={a.y} pathLength={1} />
        </svg>
      )}

      {/* Distance badge at the midpoint */}
      {g && a && distanceLabel && (
        <div className="badge" style={{ left: (g.x + a.x) / 2, top: (g.y + a.y) / 2 }}>
          {distanceLabel}
        </div>
      )}

      {/* True answer */}
      {a && (
        <div className="marker marker--answer" style={{ left: a.x, top: a.y }}>
          <span className="marker__pulse" />
          <span className="marker__pulse marker__pulse--late" />
          <span className="marker__core">★</span>
        </div>
      )}

      {/* Player's guess */}
      {g && (
        <div className="marker marker--guess" style={{ left: g.x, top: g.y }}>
          <span className="marker__pin" />
        </div>
      )}

      <div className="zoom" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}>
        <button aria-label="Zoom in" onClick={() => zoomBy(1.6)}>+</button>
        <button aria-label="Zoom out" onClick={() => zoomBy(1 / 1.6)}>−</button>
        <button aria-label="Reset view" onClick={() => flyTo(HOME, 600)}>⌂</button>
      </div>
    </div>
  );
}
