"use client";

import { useEffect, useRef } from "react";
import { scatter } from "@/lib/discoScatter";

/**
 * A 3D disco ball drawn on a canvas: the sphere is split into mirror facets by
 * meridians and parallels, each tile shaded glossy / matte / dark and lit from
 * the upper left, so highlights drift across the tiles as it turns. Spun about
 * the polar axis with the equator centred, so no pole tips into view. No
 * textures, no dependencies.
 */

const PERIOD = 20; // seconds per rotation
// mirror-ball mesh: 22 latitude bands × 36 longitude sectors
const LATS = Array.from({ length: 23 }, (_, i) => -90 + i * (180 / 22));
const MERID = 36; // longitude sectors

// light direction (upper-left, toward viewer), normalised
const LX = -0.35;
const LY = 0.55;
const LZ = 0.75;
const LM = Math.hypot(LX, LY, LZ);

// A fake "environment" the mirror facets reflect: a handful of bright lobes in
// view space. Each facet reflects them based on which way it faces, so glints
// sweep across the tiles as the ball turns — matcap-style, no textures/libs.
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

const TILT = 0; // straight-on, equator centred (no pole in view)

type P = { x: number; y: number; z: number };

// unit-sphere point spun about the polar axis, then tilted slightly toward the viewer
function project(latDeg: number, lonDeg: number, theta: number): P {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const x0 = Math.cos(lat) * Math.sin(lon);
  const y0 = Math.sin(lat);
  const z0 = Math.cos(lat) * Math.cos(lon);
  const x1 = x0 * Math.cos(theta) + z0 * Math.sin(theta);
  const z1 = -x0 * Math.sin(theta) + z0 * Math.cos(theta);
  return {
    x: x1,
    y: y0 * Math.cos(TILT) - z1 * Math.sin(TILT),
    z: y0 * Math.sin(TILT) + z1 * Math.cos(TILT),
  };
}

// stable per-tile pseudo-random so a facet keeps its material as it spins
function rand(i: number, j: number): number {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// sample a tile's four edges so the filled polygon hugs the curved
// parallels/meridians instead of cutting straight across (matters most on the
// tall polar rows, which otherwise leave gaps against the seams)
function tileRing(latA: number, latB: number, lonA: number, lonB: number, theta: number): P[] {
  const N = 2; // tiles are tiny at this density; slight curve sampling is enough
  const pts: P[] = [];
  for (let k = 0; k <= N; k++) pts.push(project(latA, lonA + ((lonB - lonA) * k) / N, theta));
  for (let k = 1; k <= N; k++) pts.push(project(latA + ((latB - latA) * k) / N, lonB, theta));
  for (let k = 1; k <= N; k++) pts.push(project(latB, lonB + ((lonA - lonB) * k) / N, theta));
  for (let k = 1; k < N; k++) pts.push(project(latB + ((latA - latB) * k) / N, lonA, theta));
  return pts;
}

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
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      cx = canvas.width / 2;
      cy = canvas.height / 2;
      R = Math.min(canvas.width, canvas.height) / 2;
    };

    const sx = (p: P) => cx + p.x * R;
    const sy = (p: P) => cy - p.y * R;

    const draw = (theta: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // dark sphere underneath so facet seams never show gaps
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = "#464442";
      ctx.fill();

      // build the front-facing facets, then paint far-to-near
      type Tile = { z: number; poly: [number, number][]; g: number };
      type Glow = { x: number; y: number; r: number; a: number };
      const tiles: Tile[] = [];
      const glows: Glow[] = [];
      for (let i = 0; i < LATS.length - 1; i++) {
        for (let j = 0; j < MERID; j++) {
          const lon0 = (j * 360) / MERID;
          const lon1 = ((j + 1) * 360) / MERID;
          const ring = tileRing(LATS[i], LATS[i + 1], lon0, lon1, theta);
          let zsum = 0;
          for (const p of ring) zsum += p.z;
          const zavg = zsum / ring.length;
          if (zavg <= 0.02) continue; // near hemisphere only → opaque

          const latc = (LATS[i] + LATS[i + 1]) / 2;
          const lonc = (lon0 + lon1) / 2;
          const n = project(latc, lonc, theta); // view-space unit pos = normal
          const diff = Math.max(0, (n.x * LX + n.y * LY + n.z * LZ) / LM);
          // reflected environment: tight bright lobes → moving mirror glints,
          // near-zero for most facets so material contrast survives
          let env = 0;
          for (const s of ENV) {
            const d = n.x * s.x + n.y * s.y + n.z * s.z;
            if (d > 0) env += s.i * Math.pow(d, s.p);
          }

          const r = rand(i, j);
          let refl: number;
          let glossy = false;
          if (r < 0.12) {
            refl = 0.32 + 0.14 * (r / 0.12); // dark tile (rare)
          } else {
            const u = (r - 0.12) / 0.88;
            refl = 0.55 + 0.45 * u; // continuous mid→bright so adjacent tiles differ
            glossy = u > 0.62; // only the top reflectors throw glints
          }

          let v = refl * (0.36 + 0.92 * diff) + refl * env * 1.15; // body + reflected glints
          if (glossy) v += 0.95 * env; // mirror tiles throw the glints harder

          let minx = Infinity;
          let maxx = -Infinity;
          let miny = Infinity;
          let maxy = -Infinity;
          let gx = 0;
          let gy = 0;
          const poly = ring.map((p) => {
            const x = sx(p);
            const y = sy(p);
            gx += x;
            gy += y;
            if (x < minx) minx = x;
            if (x > maxx) maxx = x;
            if (y < miny) miny = y;
            if (y > maxy) maxy = y;
            return [x, y] as [number, number];
          });
          gx /= poly.length;
          gy /= poly.length;

          // regional brightness bias, fixed in view (rows hold their screen height
          // under polar spin): middle rows brightest, then the top rows, then the
          // bottom row graded from a dark left to a brighter right.
          // brightness zones by latitude: middle band brightest, upper band next,
          // lower band graded from a brighter left to a darker right
          let region: number;
          if (latc > 22.5) region = 0.86; // upper zone
          else if (latc < -22.5) region = 0.72 - 0.3 * (((gx - cx) / R + 1) / 2); // lower zone
          else region = 1.12; // middle zone — brightest

          // soft tone-map: highlights roll off toward a light grey (never pure
          // white) and keep their per-tile variation, so no flat white cluster
          const g = 232 * (1 - Math.exp(-v * region * 1.45));
          tiles.push({ z: zavg, poly, g });

          // a glossy tile blooms where it reflects a bright lobe, dimmed by region
          if (glossy && env > 0.3) {
            const rad = 0.5 * Math.hypot(maxx - minx, maxy - miny) * 1.3;
            glows.push({ x: gx, y: gy, r: rad, a: Math.min(0.7, env * 0.8 * region) });
          }
        }
      }
      tiles.sort((a, b) => a.z - b.z);
      for (const t of tiles) {
        const g = t.g;
        ctx.fillStyle = `rgb(${g | 0},${Math.max(0, g - 2) | 0},${Math.max(0, g - 5) | 0})`;
        ctx.beginPath();
        ctx.moveTo(t.poly[0][0], t.poly[0][1]);
        for (let k = 1; k < t.poly.length; k++) ctx.lineTo(t.poly[k][0], t.poly[k][1]);
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
      const seam = (pts: P[], closed: boolean, vertical: boolean) => {
        const n = pts.length;
        const last = closed ? n : n - 1;
        const ox = vertical ? off : 0;
        const oy = vertical ? 0 : off;
        for (let i = 0; i < last; i++) {
          const a = pts[i];
          const b = pts[(i + 1) % n];
          const zm = (a.z + b.z) / 2;
          if (zm <= 0.02) continue;
          const alpha = 0.7 + 0.3 * Math.min(1, zm);
          const ax = sx(a);
          const ay = sy(a);
          const bx = sx(b);
          const by = sy(b);
          // shadow wall toward the top-left
          ctx.strokeStyle = `rgba(26,24,22,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(ax - ox, ay - oy);
          ctx.lineTo(bx - ox, by - oy);
          ctx.stroke();
          // lit wall toward the bottom-right
          ctx.strokeStyle = `rgba(198,194,186,${alpha * 0.85})`;
          ctx.beginPath();
          ctx.moveTo(ax + ox, ay + oy);
          ctx.lineTo(bx + ox, by + oy);
          ctx.stroke();
        }
      };
      for (let li = 1; li < LATS.length - 1; li++) {
        const ring: P[] = [];
        for (let lon = 0; lon <= 360; lon += 6) ring.push(project(LATS[li], lon, theta));
        seam(ring, true, false); // parallels: shadow on top, highlight on bottom
      }
      for (let j = 0; j < MERID; j++) {
        const arc: P[] = [];
        for (let lat = -90; lat <= 90; lat += 5) arc.push(project(lat, (j * 360) / MERID, theta));
        seam(arc, false, true); // meridians: shadow on left, highlight on right
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
      if (dragging || omega0 !== 0 || Math.abs(omega - omega0) > 1e-4) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };
    const ensureRunning = () => {
      if (running) return;
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

    if (omega0 !== 0) ensureRunning(); // default idle spin

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(theta);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      className={`overflow-hidden rounded-full bg-ink ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab touch-none select-none"
        aria-hidden
      />
    </div>
  );
}
