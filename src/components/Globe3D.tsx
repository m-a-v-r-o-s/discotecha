"use client";

import { useEffect, useRef } from "react";
import { scatter } from "@/lib/discoScatter";

/**
 * A 3D disco ball drawn on a canvas: the sphere is split into mirror facets by
 * meridians and parallels, each tile shaded glossy / matte / dark and lit from
 * the upper left, so highlights drift across the tiles as it turns. Spun about
 * the polar axis with the equator centred, so no pole tips into view. No
 * textures, no dependencies.
 *
 * Every point the ball draws sits at a fixed (lat, lon) on the sphere and only
 * the spin angle changes between frames, so the unit-sphere coordinates and
 * each facet's material are built once at module load and a frame does nothing
 * but rotate them. That's what keeps it to two trig calls and a dozen strokes
 * per frame instead of ~86,000 and ~2,500, which is the difference between
 * this being free and it being unwatchable on a phone.
 */

const PERIOD = 20; // seconds per rotation
// mirror-ball mesh: 22 latitude bands × 36 longitude sectors
const LATS = Array.from({ length: 23 }, (_, i) => -90 + i * (180 / 22));
const MERID = 36; // longitude sectors
const BANDS = LATS.length - 1;

// light direction (upper-left, toward viewer), pre-normalised
const LM = Math.hypot(-0.35, 0.55, 0.75);
const LXN = -0.35 / LM;
const LYN = 0.55 / LM;
const LZN = 0.75 / LM;

// A fake "environment" the mirror facets reflect: a handful of bright lobes in
// view space. Each facet reflects them based on which way it faces, so glints
// sweep across the tiles as the ball turns, matcap-style, no textures/libs.
type Env = { x: number; y: number; z: number; i: number; p: number };
function dir(x: number, y: number, z: number, i: number, p: number): Env {
  const m = Math.hypot(x, y, z);
  return { x: x / m, y: y / m, z: z / m, i, p };
}
const ENV: Env[] = [
  dir(0.6, -0.1, 0.78, 1.15, 7), // sharp glint, lower-right
  dir(0.05, 0.85, 0.5, 1.05, 9), // sharp glint, top
  dir(-0.68, -0.35, 0.64, 0.95, 11), // sharp glint, lower-left
  dir(-0.5, 0.5, 0.7, 0.85, 6), // broad glint, upper-left
  dir(0.32, 0.18, 0.93, 0.95, 15), // tight hotspot, near-centre
];

// the lobe exponents are all small integers, and pow() ran ~4,000 times a frame
function ipow(b: number, e: number): number {
  let r = 1;
  let x = b;
  let n = e;
  while (n > 0) {
    if (n & 1) r *= x;
    x *= x;
    n >>= 1;
  }
  return r;
}

const TILT = 0; // straight-on, equator centred (no pole in view)
const CTILT = Math.cos(TILT);
const STILT = Math.sin(TILT);

const D2R = Math.PI / 180;
const RING_N = 2; // edge samples per tile side; tiles are tiny at this density
const RING_PTS = 3 * RING_N + (RING_N - 1); // 8 points around one tile
const PAR_PTS = 61; // a parallel, sampled every 6°
const MER_PTS = 37; // a meridian, sampled every 5°
const PARALLELS = LATS.length - 2; // seams between bands, poles excluded

// ── Geometry, built once ──────────────────────────────────────────
// Unit-sphere coords at rest, kept flat so the per-frame pass is pure
// arithmetic over a typed array and allocates nothing.
function putBase(out: Float64Array, o: number, latDeg: number, lonDeg: number) {
  const lat = latDeg * D2R;
  const lon = lonDeg * D2R;
  const cl = Math.cos(lat);
  out[o] = cl * Math.sin(lon);
  out[o + 1] = Math.sin(lat);
  out[o + 2] = cl * Math.cos(lon);
}

const TILE_RING = new Float64Array(BANDS * MERID * RING_PTS * 3);
const TILE_NRM = new Float64Array(BANDS * MERID * 3);
const TILE_REFL = new Float64Array(BANDS * MERID);
const TILE_GLOSS = new Uint8Array(BANDS * MERID);
// brightness zones by latitude: middle band brightest, upper band next, lower
// band graded from a brighter left to a darker right (that one needs the
// facet's screen x, so it stays a per-frame calculation)
const BAND_REGION = new Float64Array(BANDS);
const BAND_GRADED = new Uint8Array(BANDS);

// stable per-tile pseudo-random so a facet keeps its material as it spins
function rand(i: number, j: number): number {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

for (let i = 0; i < BANDS; i++) {
  const latA = LATS[i];
  const latB = LATS[i + 1];
  const latc = (latA + latB) / 2;
  if (latc > 22.5) BAND_REGION[i] = 0.86; // upper zone
  else if (latc < -22.5) BAND_GRADED[i] = 1; // lower zone
  else BAND_REGION[i] = 1.12; // middle zone, brightest

  for (let j = 0; j < MERID; j++) {
    const lonA = (j * 360) / MERID;
    const lonB = ((j + 1) * 360) / MERID;
    const t = (i * MERID + j) * RING_PTS * 3;
    let k = 0;
    // walk the tile's four edges so the filled polygon hugs the curved
    // parallels/meridians instead of cutting straight across (matters most on
    // the tall polar rows, which otherwise leave gaps against the seams)
    for (let s = 0; s <= RING_N; s++)
      putBase(TILE_RING, t + 3 * k++, latA, lonA + ((lonB - lonA) * s) / RING_N);
    for (let s = 1; s <= RING_N; s++)
      putBase(TILE_RING, t + 3 * k++, latA + ((latB - latA) * s) / RING_N, lonB);
    for (let s = 1; s <= RING_N; s++)
      putBase(TILE_RING, t + 3 * k++, latB, lonB + ((lonA - lonB) * s) / RING_N);
    for (let s = 1; s < RING_N; s++)
      putBase(TILE_RING, t + 3 * k++, latB + ((latA - latB) * s) / RING_N, lonA);

    const m = i * MERID + j;
    putBase(TILE_NRM, m * 3, latc, (lonA + lonB) / 2);

    const r = rand(i, j);
    if (r < 0.12) {
      TILE_REFL[m] = 0.32 + 0.14 * (r / 0.12); // dark tile (rare)
    } else {
      const u = (r - 0.12) / 0.88;
      TILE_REFL[m] = 0.55 + 0.45 * u; // continuous mid→bright, adjacent tiles differ
      TILE_GLOSS[m] = u > 0.62 ? 1 : 0; // only the top reflectors throw glints
    }
  }
}

const PAR = new Float64Array(PARALLELS * PAR_PTS * 3);
for (let li = 1; li < LATS.length - 1; li++) {
  const o = (li - 1) * PAR_PTS * 3;
  for (let s = 0; s < PAR_PTS; s++) putBase(PAR, o + s * 3, LATS[li], s * 6);
}
const MER = new Float64Array(MERID * MER_PTS * 3);
for (let j = 0; j < MERID; j++) {
  const o = j * MER_PTS * 3;
  for (let s = 0; s < MER_PTS; s++) putBase(MER, o + s * 3, -90 + s * 5, (j * 360) / MERID);
}

// screen coords for the visible facets, reused frame to frame
const POLY = new Float64Array(BANDS * MERID * RING_PTS * 2);

// the fill colour is one of ~230 greys, so build each string once
const GREY: string[] = [];
function grey(v: number): string {
  const k = v | 0;
  return GREY[k] || (GREY[k] = `rgb(${k},${Math.max(0, k - 2)},${Math.max(0, k - 5)})`);
}

// Seam alpha only ever runs 0.7→1.0. Quantising it lets every grout line of a
// given depth go into one path and stroke as a batch: a dozen strokes a frame
// rather than one per segment per side.
const SEAM_BUCKETS = 6;

export default function Globe3D({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let cx = 0;
    let cy = 0;
    let R = 0;

    const resize = () => {
      // a 160px ball gains nothing from 2.6x oversampling, and the buffer is
      // filled several times over per frame, so capping it is the cheapest win
      // available on a high-density phone screen
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      cx = canvas.width / 2;
      cy = canvas.height / 2;
      R = Math.min(canvas.width, canvas.height) / 2;
    };

    type Tile = { z: number; o: number; g: number };
    type Glow = { x: number; y: number; r: number; a: number };

    const draw = (theta: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // dark sphere underneath so facet seams never show gaps
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = "#464442";
      ctx.fill();

      // the whole frame's trigonometry, right here
      const ct = Math.cos(theta);
      const st = Math.sin(theta);

      // build the front-facing facets, then paint far-to-near
      const tiles: Tile[] = [];
      const glows: Glow[] = [];

      for (let i = 0; i < BANDS; i++) {
        for (let j = 0; j < MERID; j++) {
          const t = (i * MERID + j) * RING_PTS * 3;

          // depth first: most facets face away, and dropping them before we
          // work out their screen coords halves the arithmetic
          let zsum = 0;
          for (let k = 0; k < RING_PTS; k++) {
            const o = t + k * 3;
            const bx = TILE_RING[o];
            const by = TILE_RING[o + 1];
            const bz = TILE_RING[o + 2];
            const z1 = -bx * st + bz * ct;
            zsum += by * STILT + z1 * CTILT;
          }
          const zavg = zsum / RING_PTS;
          if (zavg <= 0.02) continue; // near hemisphere only → opaque

          const m = i * MERID + j;
          const nbx = TILE_NRM[m * 3];
          const nby = TILE_NRM[m * 3 + 1];
          const nbz = TILE_NRM[m * 3 + 2];
          const nz1 = -nbx * st + nbz * ct;
          const nx = nbx * ct + nbz * st; // view-space unit pos = normal
          const ny = nby * CTILT - nz1 * STILT;
          const nz = nby * STILT + nz1 * CTILT;

          const diff = Math.max(0, nx * LXN + ny * LYN + nz * LZN);
          // reflected environment: tight bright lobes → moving mirror glints,
          // near-zero for most facets so material contrast survives
          let env = 0;
          for (let e = 0; e < ENV.length; e++) {
            const s = ENV[e];
            const d = nx * s.x + ny * s.y + nz * s.z;
            if (d > 0) env += s.i * ipow(d, s.p);
          }

          const refl = TILE_REFL[m];
          const glossy = TILE_GLOSS[m] === 1;
          let v = refl * (0.36 + 0.92 * diff) + refl * env * 1.15; // body + glints
          if (glossy) v += 0.95 * env; // mirror tiles throw the glints harder

          const po = m * RING_PTS * 2;
          let minx = Infinity;
          let maxx = -Infinity;
          let miny = Infinity;
          let maxy = -Infinity;
          let gx = 0;
          let gy = 0;
          for (let k = 0; k < RING_PTS; k++) {
            const o = t + k * 3;
            const bx = TILE_RING[o];
            const by = TILE_RING[o + 1];
            const bz = TILE_RING[o + 2];
            const z1 = -bx * st + bz * ct;
            const x = cx + (bx * ct + bz * st) * R;
            const y = cy - (by * CTILT - z1 * STILT) * R;
            POLY[po + k * 2] = x;
            POLY[po + k * 2 + 1] = y;
            gx += x;
            gy += y;
            if (x < minx) minx = x;
            if (x > maxx) maxx = x;
            if (y < miny) miny = y;
            if (y > maxy) maxy = y;
          }
          gx /= RING_PTS;
          gy /= RING_PTS;

          const region = BAND_GRADED[i]
            ? 0.72 - 0.3 * (((gx - cx) / R + 1) / 2)
            : BAND_REGION[i];

          // soft tone-map: highlights roll off toward a light grey (never pure
          // white) and keep their per-tile variation, so no flat white cluster
          const g = 232 * (1 - Math.exp(-v * region * 1.45));
          tiles.push({ z: zavg, o: po, g });

          // a glossy tile blooms where it reflects a bright lobe, dimmed by region
          if (glossy && env > 0.3) {
            const rad = 0.5 * Math.hypot(maxx - minx, maxy - miny) * 1.3;
            glows.push({ x: gx, y: gy, r: rad, a: Math.min(0.7, env * 0.8 * region) });
          }
        }
      }

      tiles.sort((a, b) => a.z - b.z);
      for (const tl of tiles) {
        ctx.fillStyle = grey(tl.g);
        ctx.beginPath();
        ctx.moveTo(POLY[tl.o], POLY[tl.o + 1]);
        for (let k = 1; k < RING_PTS; k++) ctx.lineTo(POLY[tl.o + k * 2], POLY[tl.o + k * 2 + 1]);
        ctx.closePath();
        ctx.fill();
      }

      // seams (front only) drawn as little valleys: a shadow on the up-light
      // (top/left) side and a highlight on the down-light (bottom/right) side,
      // so each grout line reads as a groove pressed into the surface
      const W = Math.max(1, R * 0.007);
      const off = W / 4;
      ctx.lineWidth = W / 2;
      ctx.lineCap = "round";

      const dark: Path2D[] = [];
      const lite: Path2D[] = [];
      for (let b = 0; b < SEAM_BUCKETS; b++) {
        dark.push(new Path2D());
        lite.push(new Path2D());
      }

      const seam = (arr: Float64Array, base: number, n: number, closed: boolean, vertical: boolean) => {
        const ox = vertical ? off : 0;
        const oy = vertical ? 0 : off;
        const last = closed ? n : n - 1;
        for (let s = 0; s < last; s++) {
          const oa = base + s * 3;
          const ob = base + (((s + 1) % n) * 3);
          const az1 = -arr[oa] * st + arr[oa + 2] * ct;
          const bz1 = -arr[ob] * st + arr[ob + 2] * ct;
          const zm = ((arr[oa + 1] * STILT + az1 * CTILT) + (arr[ob + 1] * STILT + bz1 * CTILT)) / 2;
          if (zm <= 0.02) continue;
          const bkt = Math.min(SEAM_BUCKETS - 1, (Math.min(1, zm) * SEAM_BUCKETS) | 0);
          const ax = cx + (arr[oa] * ct + arr[oa + 2] * st) * R;
          const ay = cy - (arr[oa + 1] * CTILT - az1 * STILT) * R;
          const bx = cx + (arr[ob] * ct + arr[ob + 2] * st) * R;
          const by = cy - (arr[ob + 1] * CTILT - bz1 * STILT) * R;
          const d = dark[bkt];
          d.moveTo(ax - ox, ay - oy);
          d.lineTo(bx - ox, by - oy);
          const l = lite[bkt];
          l.moveTo(ax + ox, ay + oy);
          l.lineTo(bx + ox, by + oy);
        }
      };

      for (let li = 0; li < PARALLELS; li++) seam(PAR, li * PAR_PTS * 3, PAR_PTS, true, false);
      for (let j = 0; j < MERID; j++) seam(MER, j * MER_PTS * 3, MER_PTS, false, true);

      for (let b = 0; b < SEAM_BUCKETS; b++) {
        const alpha = 0.7 + (0.3 * (b + 0.5)) / SEAM_BUCKETS;
        ctx.strokeStyle = `rgba(26,24,22,${alpha})`; // shadow wall toward the top-left
        ctx.stroke(dark[b]);
        ctx.strokeStyle = `rgba(198,194,186,${alpha * 0.85})`; // lit wall toward the bottom-right
        ctx.stroke(lite[b]);
      }

      // bloom: each lit mirror tile adds a soft additive glint
      ctx.globalCompositeOperation = "lighter";
      for (const gl of glows) {
        const grd = ctx.createRadialGradient(gl.x, gl.y, 0, gl.x, gl.y, gl.r);
        grd.addColorStop(0, `rgba(255,249,238,${gl.a})`);
        grd.addColorStop(0.45, `rgba(255,249,238,${gl.a * 0.35})`);
        grd.addColorStop(1, "rgba(255,249,238,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(gl.x, gl.y, gl.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const omega0 = reduce ? 0 : (Math.PI * 2) / PERIOD; // base idle speed (rad/s)
    const SENS = 0.008; // radians of spin per pixel dragged
    const MAX_OMEGA = 14; // clamp fling speed
    const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

    let theta = 0;
    let omega = omega0;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let lastFrame = 0;
    let running = false;
    // the idle spin used to keep turning at 60fps behind whatever you'd
    // scrolled to, and in a background tab: nothing to look at, full price
    let onScreen = true;
    let awake = true;
    const live = () => onScreen && awake;

    resize();
    draw(theta);

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - lastFrame) / 1000 || 0);
      lastFrame = now;
      if (!dragging) {
        theta += omega * dt;
        // ease the speed back toward the default after a fling
        omega += (omega0 - omega) * (1 - Math.exp(-dt / 0.6));
      }
      draw(theta);

      // feed the site-wide light scatter: energy is how much faster than idle
      // it's spinning (with a floor while actively dragging), so it only fires
      // on a manual spin
      const boost = (Math.abs(omega) - omega0) / (MAX_OMEGA - omega0);
      scatter.energy = reduce ? 0 : Math.max(0, Math.min(1, dragging ? Math.max(0.2, boost) : boost));
      if (scatter.energy > 0.001 || dragging) {
        const rect = canvas.getBoundingClientRect();
        scatter.cx = rect.left + rect.width / 2;
        scatter.cy = rect.top + rect.height / 2;
        scatter.spin = theta;
      }
      if (!live()) {
        running = false;
        return;
      }
      if (dragging || omega0 !== 0 || Math.abs(omega - omega0) > 1e-4) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };
    const ensureRunning = () => {
      if (running || !live()) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastT = performance.now();
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
      canvas.style.cursor = "grabbing";
      ensureRunning();
      // seed position so the overlay's first frame is anchored on the ball
      const rect = canvas.getBoundingClientRect();
      scatter.cx = rect.left + rect.width / 2;
      scatter.cy = rect.top + rect.height / 2;
      scatter.spin = theta;
      scatter.wake?.(); // kick the light-scatter overlay awake
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dts = Math.max(1, now - lastT) / 1000;
      theta += dx * SENS; // grab-and-spin, direct
      const inst = clamp((dx * SENS) / dts, MAX_OMEGA);
      omega = omega * 0.4 + inst * 0.6; // smoothed, for release momentum
      lastX = e.clientX;
      lastT = now;
      e.preventDefault();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      omega = clamp(omega, MAX_OMEGA);
      canvas.style.cursor = "grab";
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
      ensureRunning();
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    // park the loop when the ball isn't on screen or the tab is in the
    // background; drop the scatter energy too, or the overlay would sit there
    // painting rays for a ball nobody can see
    const park = () => {
      if (live()) {
        ensureRunning();
      } else {
        omega = omega0;
        scatter.energy = 0;
      }
    };
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      park();
    });
    io.observe(canvas);
    const onVisibility = () => {
      awake = document.visibilityState !== "hidden";
      park();
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (omega0 !== 0) ensureRunning(); // default idle spin

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(theta);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div className={`overflow-hidden rounded-full bg-ink ${className}`}>
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab touch-none select-none"
        aria-hidden
      />
    </div>
  );
}
