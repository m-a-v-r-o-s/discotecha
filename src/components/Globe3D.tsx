"use client";

import { useEffect, useRef } from "react";

/**
 * A 3D disco ball drawn on a canvas: the sphere is split into mirror facets by
 * meridians and parallels, each tile shaded glossy / matte / dark and lit from
 * the upper left, so highlights drift across the tiles as it turns. Spun about
 * the polar axis with the equator centred, so no pole tips into view. No
 * textures, no dependencies.
 */

const PERIOD = 20; // seconds per rotation
const LATS = Array.from({ length: 16 }, (_, i) => -90 + i * 12); // 12° band edges → 15 latitude bands
const MERID = 30; // longitude sectors

// light direction (upper-left, toward viewer), normalised
const LX = -0.35;
const LY = 0.55;
const LZ = 0.75;
const LM = Math.hypot(LX, LY, LZ);

type P = { x: number; y: number; z: number };

// unit-sphere point spun about the vertical (polar) axis; equator centred
function project(latDeg: number, lonDeg: number, theta: number): P {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const x0 = Math.cos(lat) * Math.sin(lon);
  const y0 = Math.sin(lat);
  const z0 = Math.cos(lat) * Math.cos(lon);
  return {
    x: x0 * Math.cos(theta) + z0 * Math.sin(theta),
    y: y0,
    z: -x0 * Math.sin(theta) + z0 * Math.cos(theta),
  };
}

// stable per-tile pseudo-random so a facet keeps its material as it spins
function rand(i: number, j: number): number {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
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
          const c = [
            project(LATS[i], lon0, theta),
            project(LATS[i], lon1, theta),
            project(LATS[i + 1], lon1, theta),
            project(LATS[i + 1], lon0, theta),
          ];
          const zavg = (c[0].z + c[1].z + c[2].z + c[3].z) / 4;
          if (zavg <= 0.02) continue; // near hemisphere only → opaque

          const latc = (LATS[i] + LATS[i + 1]) / 2;
          const lonc = (lon0 + lon1) / 2;
          const n = project(latc, lonc, theta); // view-space unit pos = normal
          const diff = Math.max(0, (n.x * LX + n.y * LY + n.z * LZ) / LM);

          const r = rand(i, j);
          let refl: number;
          let glossy = false;
          if (r < 0.07) refl = 0.38; // dark tile (rare)
          else if (r > 0.38) {
            refl = 1.0; // glossy mirror tile (most)
            glossy = true;
          } else refl = 0.7; // matte tile

          let v = refl * (0.42 + 0.82 * diff);
          if (glossy) v += 0.85 * Math.pow(diff, 5); // hot specular pop
          v = Math.max(0, Math.min(1.25, v));
          const poly = c.map((p) => [sx(p), sy(p)] as [number, number]);
          tiles.push({ z: zavg, poly, g: Math.min(255, v * 242) });

          // a lit glossy tile throws its own glint of light
          if (glossy && diff > 0.48) {
            const gx = (poly[0][0] + poly[1][0] + poly[2][0] + poly[3][0]) / 4;
            const gy = (poly[0][1] + poly[1][1] + poly[2][1] + poly[3][1]) / 4;
            const rad = Math.hypot(poly[0][0] - gx, poly[0][1] - gy) * 1.5;
            glows.push({ x: gx, y: gy, r: rad, a: Math.min(0.6, (diff - 0.48) * 1.5) });
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

      // seams (front only), thin and bright, like the poster's grid
      ctx.lineWidth = Math.max(1, R * 0.009);
      ctx.lineCap = "round";
      const seam = (pts: P[], closed: boolean) => {
        const n = pts.length;
        const last = closed ? n : n - 1;
        for (let i = 0; i < last; i++) {
          const a = pts[i];
          const b = pts[(i + 1) % n];
          const zm = (a.z + b.z) / 2;
          if (zm <= 0.02) continue;
          ctx.strokeStyle = `rgba(245,243,238,${0.35 + 0.35 * Math.min(1, zm)})`;
          ctx.beginPath();
          ctx.moveTo(sx(a), sy(a));
          ctx.lineTo(sx(b), sy(b));
          ctx.stroke();
        }
      };
      for (let li = 1; li < LATS.length - 1; li++) {
        const ring: P[] = [];
        for (let lon = 0; lon <= 360; lon += 6) ring.push(project(LATS[li], lon, theta));
        seam(ring, true);
      }
      for (let j = 0; j < MERID; j++) {
        const arc: P[] = [];
        for (let lat = -90; lat <= 90; lat += 5) arc.push(project(lat, (j * 360) / MERID, theta));
        seam(arc, false);
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
      className={`overflow-hidden rounded-full bg-ink shadow-[0_0_40px_rgba(255,42,0,0.25)] ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab touch-none select-none"
        aria-hidden
      />
    </div>
  );
}
