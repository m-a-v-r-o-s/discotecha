// Shared channel between the disco ball (Globe3D) and the site-wide light
// scatter overlay (LightRays). The ball writes its state every frame while it
// spins; the overlay reads it in its own loop. The ball calls `wake` on grab so
// the overlay's render loop only runs while there's something to show.
export type DiscoScatter = {
  cx: number; // ball centre, viewport px
  cy: number;
  spin: number; // ball rotation angle (rad)
  energy: number; // 0..1 spin boost above idle; drives the whole effect
  wake: (() => void) | null; // LightRays registers this; the ball kicks it awake
};

export const scatter: DiscoScatter = {
  cx: 0,
  cy: 0,
  spin: 0,
  energy: 0,
  wake: null,
};
