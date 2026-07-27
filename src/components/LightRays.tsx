"use client";

import { useEffect, useRef } from "react";
import { scatter } from "@/lib/discoScatter";

// Site-wide light thrown by the disco ball when it's manually spun. Reads the
// ball's spin energy/position from the shared `scatter` channel and paints rays
// + a sparkle field over the whole page, additively, screen-blended so it only
// lights dark areas. The loop sleeps entirely until the ball wakes it, so there
// is no cost when nothing is spinning.

const N_BEAMS = 11;
const MAX_SPARKS = 80;
// additive light colours, on-brand: signal red, warm white, amber
const COLORS: [number, number, number][] = [
  [255, 60, 20],
  [255, 236, 214],
  [255, 138, 54],
];

type Spark = {
  x: number;
  y: number;
  life: number;
  ttl: number;
  size: number;
  c: [number, number, number];
  vx: number;
  vy: number;
};

export default function LightRays() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let last = 0;
    let shown = 0; // smoothed energy, for graceful ramp/fade
    let sparkAcc = 0;
    const sparks: Spark[] = [];

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };
    resize();

    // one soft cone of light from the ball outward
    const beam = (
      cx: number,
      cy: number,
      ang: number,
      len: number,
      a: number,
      c: [number, number, number],
      wide: number,
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      const g = ctx.createLinearGradient(0, 0, len, 0);
      g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a})`);
      g.addColorStop(0.12, `rgba(${c[0]},${c[1]},${c[2]},${a * 0.6})`);
      g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      ctx.fillStyle = g;
      const w0 = 2 * dpr;
      ctx.beginPath();
      ctx.moveTo(0, -w0);
      ctx.lineTo(len, -wide);
      ctx.lineTo(len, wide);
      ctx.lineTo(0, w0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0);
      last = t;
      shown += (scatter.energy - shown) * Math.min(1, dt * 5);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (shown > 0.003) {
        const cx = scatter.cx * dpr;
        const cy = scatter.cy * dpr;
        const reach = Math.hypot(canvas.width, canvas.height) * 0.72;
        ctx.globalCompositeOperation = "lighter";

        // radiance around the ball
        const br = (0.1 + 0.06 * shown) * Math.min(canvas.width, canvas.height);
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, br);
        bg.addColorStop(0, `rgba(255,150,90,${0.22 * shown})`);
        bg.addColorStop(1, "rgba(255,150,90,0)");
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(cx, cy, br, 0, Math.PI * 2);
        ctx.fill();

        // rays, rotating with the ball
        for (let k = 0; k < N_BEAMS; k++) {
          const ang = scatter.spin + (k * Math.PI * 2) / N_BEAMS;
          const flick = 0.72 + 0.28 * Math.sin(t * 0.005 + k * 1.9);
          const a = 0.22 * shown * flick;
          const c = COLORS[k % COLORS.length];
          const len = reach * (0.85 + 0.15 * Math.sin(k * 2.3));
          beam(cx, cy, ang, len, a * 0.5, c, 46 * dpr); // soft halo
          beam(cx, cy, ang, reach, a, c, 15 * dpr); // brighter core
        }

        // sparkle field twinkling across the viewport
        sparkAcc += dt * (6 + 90 * shown);
        while (sparkAcc >= 1) {
          sparkAcc -= 1;
          if (sparks.length < MAX_SPARKS) {
            sparks.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              life: 0,
              ttl: 0.5 + Math.random(),
              size: (1.4 + 3.2 * Math.random()) * dpr,
              c: COLORS[(Math.random() * COLORS.length) | 0],
              vx: (Math.random() - 0.5) * 24 * dpr,
              vy: (Math.random() - 0.5) * 24 * dpr,
            });
          }
        }
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.life += dt;
          if (s.life >= s.ttl) {
            sparks.splice(i, 1);
            continue;
          }
          const k = s.life / s.ttl;
          const a = Math.sin(Math.PI * k) * (0.5 + 0.5 * shown); // fade in/out
          const x = s.x + s.vx * s.life;
          const y = s.y + s.vy * s.life;
          const g = ctx.createRadialGradient(x, y, 0, x, y, s.size);
          g.addColorStop(0, `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${a})`);
          g.addColorStop(1, `rgba(${s.c[0]},${s.c[1]},${s.c[2]},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalCompositeOperation = "source-over";
      } else if (sparks.length) {
        sparks.length = 0;
      }

      if (shown > 0.003 || scatter.energy > 0.003) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };

    const wake = () => {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    scatter.wake = wake;
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (scatter.wake === wake) scatter.wake = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 mix-blend-screen"
    />
  );
}
