"use client";

import { useCallback, useEffect, useRef } from "react";
import { useInView } from "@/lib/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";

interface Point {
  x: number;
  y: number;
}
interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  born: number;
}

const CELL_SIZE = 55;
const INFLUENCE_RADIUS = 260;
const MAX_WARP = 24;
const DOT_SPACING = 30;
const LERP_SPEED = 0.08;

// Scalwise brand tokens, not the source component's blue/monochrome themes
const LINE_BASE = { r: 247, g: 244, b: 252, a: 0.07 };
const LINE_ACTIVE = { r: 144, g: 97, b: 249, a: 0.85 };
const NODE_BASE = { r: 247, g: 244, b: 252, a: 0.15 };
const NODE_ACTIVE = { r: 144, g: 97, b: 249, a: 1 };
const GLOW_RGB = "144,97,249"; // purple-light
const RIPPLE_RGB = "212,255,61"; // neon volt — reserved for the click ripple only

const NODE_BASE_RADIUS = 1.6;
const NODE_ACTIVE_RADIUS = 3;

function lerpN(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(base: typeof LINE_BASE, active: typeof LINE_BASE, t: number) {
  const r = Math.round(lerpN(base.r, active.r, t));
  const g = Math.round(lerpN(base.g, active.g, t));
  const b = Math.round(lerpN(base.b, active.b, t));
  const a = lerpN(base.a, active.a, t);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

/** Cursor-warped grid backdrop, scoped to its wrapping container (not the full viewport).
 *  Pauses off-screen and is skipped entirely under prefers-reduced-motion. */
export function KineticGrid({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<Point>({ x: -9999, y: -9999 });
  const targetMouseRef = useRef<Point>({ x: -9999, y: -9999 });
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const { ref: inViewRef, inView } = useInView<HTMLDivElement>({ threshold: 0.05 });
  const inViewValueRef = useRef(inView);
  useEffect(() => {
    inViewValueRef.current = inView;
  }, [inView]);

  const reducedMotion = usePrefersReducedMotion();

  const getWarpedPoint = useCallback(
    (
      gx: number,
      gy: number,
      col: number,
      row: number,
      mouse: Point,
      ripples: Ripple[],
      cols: number,
      rows: number
    ): { pt: Point; proximity: number } => {
      const edgeMargin = 1.5;
      const colPin = Math.min(col / edgeMargin, (cols - 1 - col) / edgeMargin, 1);
      const rowPin = Math.min(row / edgeMargin, (rows - 1 - row) / edgeMargin, 1);
      const pinFactor = colPin * colPin * rowPin * rowPin;

      const dx = gx - mouse.x;
      const dy = gy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS) * pinFactor;

      let rx = 0;
      let ry = 0;
      for (const r of ripples) {
        const rdx = gx - r.x;
        const rdy = gy - r.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        const waveWidth = 55;
        const diff = rdist - r.radius;
        if (Math.abs(diff) < waveWidth) {
          const strength = (1 - Math.abs(diff) / waveWidth) * r.opacity * 18 * pinFactor;
          const angle = Math.atan2(rdy, rdx);
          const sign = diff < 0 ? -1 : 1;
          rx += Math.cos(angle) * strength * sign * -1;
          ry += Math.sin(angle) * strength * sign * -1;
        }
      }

      if (dist < INFLUENCE_RADIUS && dist > 0 && pinFactor > 0) {
        const t = dist / INFLUENCE_RADIUS;
        const eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60);
        const warpAmt = eased * MAX_WARP * pinFactor;
        const angle = Math.atan2(dy, dx);
        return {
          pt: {
            x: gx - Math.cos(angle) * warpAmt + rx,
            y: gy - Math.sin(angle) * warpAmt + ry,
          },
          proximity,
        };
      }
      return { pt: { x: gx + rx, y: gy + ry }, proximity };
    },
    []
  );

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w: W, h: H } = sizeRef.current;
      const mouse = mouseRef.current;
      const ripples = ripplesRef.current;

      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = "rgba(247,244,252,0.05)";
      for (let x = DOT_SPACING / 2; x < W; x += DOT_SPACING) {
        for (let y = DOT_SPACING / 2; y < H; y += DOT_SPACING) {
          ctx.beginPath();
          ctx.arc(x, y, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = (now - r.born) / 1000;
        r.radius = Math.max(0, age * 400);
        r.opacity = Math.max(0, 1 - age * 1.2);
        if (r.opacity <= 0) ripples.splice(i, 1);
      }

      const cols = Math.max(2, Math.ceil(W / CELL_SIZE)) + 1;
      const rows = Math.max(2, Math.ceil(H / CELL_SIZE)) + 1;
      const cellW = W / (cols - 1);
      const cellH = H / (rows - 1);

      const pts: Point[][] = [];
      const prox: number[][] = [];

      for (let row = 0; row < rows; row++) {
        pts[row] = [];
        prox[row] = [];
        for (let col = 0; col < cols; col++) {
          const { pt, proximity } = getWarpedPoint(
            col * cellW,
            row * cellH,
            col,
            row,
            mouse,
            ripples,
            cols,
            rows
          );
          pts[row][col] = pt;
          prox[row][col] = proximity;
        }
      }

      const drawSeg = (p1: Point, p2: Point, pr1: number, pr2: number) => {
        const avg = (pr1 + pr2) / 2;
        const t = avg * avg * (3 - 2 * avg);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = lerpColor(LINE_BASE, LINE_ACTIVE, t);
        ctx.lineWidth = lerpN(0.8, 1.4, t);
        ctx.stroke();
      };

      ctx.lineCap = "butt";
      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols - 1; col++)
          drawSeg(pts[row][col], pts[row][col + 1], prox[row][col], prox[row][col + 1]);
      for (let col = 0; col < cols; col++)
        for (let row = 0; row < rows - 1; row++)
          drawSeg(pts[row][col], pts[row + 1][col], prox[row][col], prox[row + 1][col]);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const p = pts[row][col];
          const pr = prox[row][col];
          const t = pr * pr * (3 - 2 * pr);
          const r = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);

          if (t > 0.3) {
            const glowR = r + lerpN(0, 6, (t - 0.3) / 0.7);
            const grd = ctx.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, glowR);
            grd.addColorStop(0, `rgba(${GLOW_RGB},${(t * 0.35).toFixed(3)})`);
            grd.addColorStop(1, `rgba(${GLOW_RGB},0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = lerpColor(NODE_BASE, NODE_ACTIVE, t);
          ctx.fill();
        }
      }

      for (const r of ripples) {
        const safeRadius = Math.max(0, r.radius);
        ctx.beginPath();
        ctx.arc(r.x, r.y, safeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${RIPPLE_RGB},${(r.opacity * 0.3).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    },
    [getWarpedPoint]
  );

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    function animate(now: number) {
      if (inViewValueRef.current) {
        const m = mouseRef.current;
        const t = targetMouseRef.current;
        m.x = lerpN(m.x, t.x, LERP_SPEED);
        m.y = lerpN(m.y, t.y, LERP_SPEED);
        draw(now);
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    const setSize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: rect.width, h: rect.height };
    };

    setSize();
    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(wrapper);

    const onMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      targetMouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onClick = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      ripplesRef.current.push({ x, y, radius: 0, opacity: 1, born: performance.now() });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={(node) => {
        wrapperRef.current = node;
        inViewRef.current = node;
      }}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
