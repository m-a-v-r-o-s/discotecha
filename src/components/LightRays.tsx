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
// Every pixel of this overlay is a soft gradient laid down additively across
// the whole viewport, twenty-odd layers deep, and the result is screen-blended
// over the page each frame. That is all fill rate, and it scales with the
// square of the sample ratio — at a phone's native 2.6x the lit state can't
// hold 60fps. There is no detail in a gradient to lose, so it renders at CSS
// resolution and lets the compositor scale it.
const DPR_CAP = 1;
const SPRITE = 32; // radius of the pre-rendered sparkle, in sprite px
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
  c: number; // index into COLORS / the sprite sheet
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
    let offX = 0; // the overlay's own top-left, in viewport px
    let offY = 0;
    const sparks: Spark[] = [];

    // Size the buffer from the element's own box, never from window.innerWidth.
    // A canvas is a *replaced* element: positioned, with width:auto, it takes
    // its width from the intrinsic size (the width attribute) and the opposing
    // inset is dropped, so `inset-0` on its own never stretches it — the box
    // ends up innerWidth * dpr CSS px wide, anchored top-left. At dpr 1 that
    // equals the viewport and looks correct by accident; at dpr 2.625 the box
    // is 2.6x too wide, so the origin painted at cx * dpr lands past the right
    // edge and only the tail of the fan shows, sweeping in from the right of
    // the hero. The w/h-full on the element gives it a real box; this reads it.
    // Offsets are tracked too because a fixed box doesn't always sit at 0,0 on
    // mobile, where the visual and layout viewports come apart.
    let reach = 0;
    // A beam's gradient depends only on its length and colour, both fixed
    // between resizes, so they're built once instead of 22 times a frame. The
    // stops carry full alpha and the frame's brightness rides on globalAlpha.
    // (Pre-rendering whole beams as sprites and blitting them was tried and is
    // slower: a rotated, non-uniform drawImage lands on a costlier resample
    // path than just running the gradient shader.)
    let halo: CanvasGradient[] = [];
    let core: CanvasGradient[] = [];
    const buildBeams = () => {
      reach = Math.hypot(canvas.width, canvas.height) * 0.72;
      halo = [];
      core = [];
      for (let k = 0; k < N_BEAMS; k++) {
        const c = COLORS[k % COLORS.length];
        const stops = (len: number) => {
          const g = ctx.createLinearGradient(0, 0, len, 0);
          g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},1)`);
          g.addColorStop(0.12, `rgba(${c[0]},${c[1]},${c[2]},0.6)`);
          g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
          return g;
        };
        halo.push(stops(reach * (0.85 + 0.15 * Math.sin(k * 2.3))));
        core.push(stops(reach));
      }
    };

    const measure = () => {
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const rect = canvas.getBoundingClientRect();
      offX = rect.left;
      offY = rect.top;
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        buildBeams();
      }
    };
    measure();

    // The sparkle field is the same soft dot eighty times over, so each colour
    // is rendered once here and blitted, rather than building a fresh radial
    // gradient per spark per frame.
    const sprites = COLORS.map((c) => {
      const s = document.createElement("canvas");
      s.width = SPRITE * 2;
      s.height = SPRITE * 2;
      const sc = s.getContext("2d");
      if (sc) {
        const g = sc.createRadialGradient(SPRITE, SPRITE, 0, SPRITE, SPRITE, SPRITE);
        g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},1)`);
        g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        sc.fillStyle = g;
        sc.fillRect(0, 0, SPRITE * 2, SPRITE * 2);
      }
      return s;
    });

    // one soft cone of light from the ball outward
    const beam = (
      cx: number,
      cy: number,
      ang: number,
      len: number,
      a: number,
      g: CanvasGradient,
      wide: number,
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      ctx.globalAlpha = a;
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

      // re-read every frame: the box moves and resizes under a mobile URL bar
      // as readily as it does on rotation, and the loop only runs while lit
      measure();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (shown > 0.003) {
        const cx = (scatter.cx - offX) * dpr;
        const cy = (scatter.cy - offY) * dpr;
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
          const len = reach * (0.85 + 0.15 * Math.sin(k * 2.3));
          beam(cx, cy, ang, len, a * 0.5, halo[k], 46 * dpr); // soft halo
          beam(cx, cy, ang, reach, a, core[k], 15 * dpr); // brighter core
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
              c: (Math.random() * COLORS.length) | 0,
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
          ctx.globalAlpha = a;
          ctx.drawImage(sprites[s.c], x - s.size, y - s.size, s.size * 2, s.size * 2);
        }
        ctx.globalAlpha = 1;

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

    return () => {
      cancelAnimationFrame(raf);
      if (scatter.wake === wake) scatter.wake = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 h-full w-full mix-blend-screen"
    />
  );
}
