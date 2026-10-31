// The walk-in laboratory: a compact, life-size room (4 m x 4.6 m) whose origin is the spot where the
// guest starts, facing -Z (the north wall). Shared by walk.html (8th Wall tracking) and ar-build.html.
import * as THREE from "three";

export const TITLES = { 1: "The lever", 2: "The gas valve", 3: "The open window", 4: "The body", 5: "The photograph", 6: "The journal", 7: "The bucket", 8: "The sphere", 9: "The locket" };
export const ROUND_OF = { 1: 1, 2: 1, 3: 1, 4: 2, 5: 2, 6: 2, 7: 3, 8: 3, 9: 3 };
export const X0 = -2, X1 = 2, Z0 = -4, Z1 = .6, H = 3;          // inside faces of the walls; the guest starts at (0, 0, 0)

function tex(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.r ?? .8, metalness: o.m ?? 0, emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1, map: o.map ?? null, side: o.side ?? THREE.FrontSide });
export const SIZES = [25, 35, 50, 65, 80, 100];                  // percent of life size; the site's slider picks one

// the lab at a given size, scaled about the guest's start spot; below 65% the ceiling would cut through
// a standing guest's head, so the smaller rooms are left open-topped and set inside a dark hall instead.
// Quick Look always shows the camera behind the model, so a closed shell is what hides the real room.
export function buildScaled(round, pct) {
  const s = pct / 100, root = new THREE.Group(), lab = buildLab(round);
  if (s < .65) {
    lab.children.filter(o => o.position.y > H - .3).forEach(o => lab.remove(o));
    const m = .7, hh = 2.6, t = .05, x0 = X0 * s - m, x1 = X1 * s + m, z0 = Z0 * s - m, z1 = Z1 * s + m, w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const dark = mat(0x0d0a08, { r: 1 }), ground = mat(0x1c1611, { r: 1 });
    const slab = (sw, sh, sd, mm, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, sd), mm); o.position.set(x, y, z); root.add(o); };
    slab(w, t, d, ground, cx, -.03 - t / 2, cz);
    slab(w, t, d, dark, cx, hh + t / 2, cz);
    slab(w, hh, t, dark, cx, hh / 2, z0 - t / 2); slab(w, hh, t, dark, cx, hh / 2, z1 + t / 2);
    slab(t, hh, d, dark, x0 - t / 2, hh / 2, cz); slab(t, hh, d, dark, x1 + t / 2, hh / 2, cz);
  }
  lab.scale.setScalar(s); root.add(lab); root.updateMatrixWorld(true);
  return root;
}

export function buildLab(round, openView = false) {
  const lab = new THREE.Group();
  const add = (o, x, y, z, parent = lab) => { o.position.set(x, y, z); parent.add(o); return o; };
  const box = (w, h, d, m, x, y, z, parent) => add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), x, y, z, parent);
  const cyl = (rt, rb, h, m, x, y, z, seg = 16, parent) => add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m), x, y, z, parent);
  const ball = (r, m, x, y, z, parent) => add(new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), m), x, y, z, parent);
  const M = {
    wood: mat(0x5a3e2a, { r: .7 }), darkwood: mat(0x4a3322, { r: .7 }), brass: mat(0xb8913c, { r: .35, m: .85 }),
    copper: mat(0xa0522d, { r: .4, m: .8 }), iron: mat(0x3a3a3c, { r: .55, m: .6 }), slab: mat(0x77716a, { r: .6 }),
    linen: mat(0xe8e0cf, { r: .95 }), coat: mat(0x1f1c22, { r: .9 }), skin: mat(0xc9a98c, { r: .8 }), mud: mat(0x2a1d12, { r: 1 }),
    rubber: mat(0x161616, { r: .7 }), cream: mat(0xe9dcc0, { r: .85 }), gold: mat(0xd4af37, { r: .25, m: 1, e: 0x553300, ei: .6 }),
    paper: mat(0xe6dcc3, { r: .95 }), red: mat(0x7a1e1e, { r: .5, m: .5 }), lamp: mat(0x5b5142, { r: .55 }),
    glass: mat(0x9ab5b3, { r: .12, m: .12 }), liquid: mat(0x526d76, { r: .2, m: .1 }), soot: mat(0x211b19, { r: 1 }),
    stain: mat(0x4d1716, { r: .7 }), burn: mat(0x806254, { r: .9 }), hair: mat(0x77746c, { r: .9 }),
  };
  const pageTexture = (heading, lines = 8, entries = []) => tex(512, 512, (g, w, h) => {
    g.fillStyle = "#e6dcc3"; g.fillRect(0, 0, w, h); g.strokeStyle = "#b8aa8e"; g.lineWidth = 2;
    for (let y = 74; y < h - 28; y += 40) { g.beginPath(); g.moveTo(34, y); g.lineTo(w - 30, y); g.stroke(); }
    g.fillStyle = "#30251c"; g.font = "bold 30px Georgia"; g.textAlign = "left"; g.fillText(heading, 34, 50);
    g.strokeStyle = "#49372b"; g.lineWidth = 3; g.beginPath(); g.moveTo(38, 90); g.lineTo(38, h - 40); g.stroke();
    g.fillStyle = "rgba(53,40,29,.78)"; g.font = "italic 22px Georgia";
    for (let i = 0; i < lines; i++) { const y = 120 + i * 40; if (entries[i]) g.fillText(entries[i], 62, y, 420); else g.fillRect(62, y, 110 + ((i * 47) % 230), 2); }
  });
  const locketPhotoTexture = tex(128, 128, (g, w, h) => {
    g.fillStyle = "#c8b99b"; g.fillRect(0, 0, w, h); g.fillStyle = "#655b4e";
    g.beginPath(); g.arc(43, 43, 15, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(82, 56, 11, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(43, 91, 25, 20, 0, Math.PI, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(82, 96, 20, 15, 0, Math.PI, Math.PI * 2); g.fill();
    g.fillStyle = "#493d30"; g.font = "bold 12px Georgia"; g.textAlign = "center"; g.fillText("E. & L.", w / 2, 119);
  });
  const makeGlove = (x, y, z, angle, scorched = false, missingButton = false) => {
    const g = add(new THREE.Group(), x, y, z); g.rotation.y = angle;
    box(.105, .024, .12, M.cream, 0, 0, 0, g);
    for (let i = 0; i < 4; i++) { const finger = add(new THREE.Mesh(new THREE.CapsuleGeometry(.013, .055, 3, 7), M.cream), (i - 1.5) * .024, 0, .095, g); finger.rotation.x = Math.PI / 2; }
    const thumb = add(new THREE.Mesh(new THREE.CapsuleGeometry(.014, .05, 3, 7), M.cream), .065, 0, .015, g); thumb.rotation.set(Math.PI / 2, 0, -.65);
    box(.11, .03, .045, M.linen, 0, .002, -.075, g);
    for (let i = 0; i < 3; i++) if (!(missingButton && i === 1)) ball(.012, mat(0xf1e7cf, { r: .28, m: .08 }), (i - 1) * .032, .02, -.075, g);
    if (missingButton) ball(.011, mat(0x43372b, { r: .9 }), 0, .018, -.075, g);
    if (scorched) { const mark = add(new THREE.Mesh(new THREE.CircleGeometry(.035, 18), M.burn), 0, .015, .015, g); mark.rotation.x = -Math.PI / 2; mark.scale.set(1.15, .85, 1); }
    return g;
  };

  // floor, walls, ceiling: a closed room, so the lab fills the view whichever way the guest turns
  const W = X1 - X0, D = Z1 - Z0, cz = (Z0 + Z1) / 2;
  const floorTex = tex(512, 512, (g, w) => { const r = rng(7); for (let i = 0; i < 16; i++) { const v = 62 + r() * 22; g.fillStyle = `rgb(${v + 20},${v},${v - 14})`; g.fillRect(0, i * 32, w, 32); g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(0, i * 32, w, 2); for (let k = 0; k < 3; k++) g.fillRect(r() * w, i * 32, 2, 32); } });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(2, 2);
  box(W + .2, .02, D + .2, mat(0xffffff, { map: floorTex, r: .9 }), 0, -.01, cz);
  const brick = tex(512, 256, (g, w, h) => { g.fillStyle = "#3b2a22"; g.fillRect(0, 0, w, h); const r = rng(3); for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? -24 : 0; x < w; x += 48) { const v = 80 + r() * 30; g.fillStyle = `rgb(${v + 30},${v},${v - 10})`; g.fillRect(x + 1, y + 1, 46, 14); } });
  brick.wrapS = brick.wrapT = THREE.RepeatWrapping; brick.repeat.set(2, 2.5);
  const wallM = mat(0xffffff, { map: brick, r: .95 });
  box(W + .2, H, .1, wallM, 0, H / 2, Z0 - .05);                                   // north
  if (!openView) box(W + .2, H, .1, wallM, 0, H / 2, Z1 + .05);                    // south, behind the guest
  box(.1, H, D, wallM, X0 - .05, H / 2, cz);                                        // west, with the door
  const wz0 = -2.6, wz1 = -1.6, wy0 = .9, wy1 = 2.4;                                 // east, with the window
  box(.1, H, wz0 - Z0, wallM, X1 + .05, H / 2, (Z0 + wz0) / 2);
  box(.1, H, Z1 - wz1, wallM, X1 + .05, H / 2, (wz1 + Z1) / 2);
  box(.1, wy0, wz1 - wz0, wallM, X1 + .05, wy0 / 2, (wz0 + wz1) / 2);
  box(.1, H - wy1, wz1 - wz0, wallM, X1 + .05, (H + wy1) / 2, (wz0 + wz1) / 2);
  if (!openView) box(W + .2, .1, D + .2, mat(0x2a1d15, { r: .95 }), 0, H + .05, cz); // ceiling
  for (const z of [-3.2, -1.7, -.2]) box(W, .16, .14, M.darkwood, 0, H - .08, z);   // beams

  // the night outside the open window (a closed box, so the real room never shows through)
  const night = mat(0x0b1622, { e: 0x0b1a2c, ei: 1, r: 1 });
  const ox = X1 + .1, depth = .6, wcz = (wz0 + wz1) / 2, ww = wz1 - wz0, wh = wy1 - wy0, wcy = (wy0 + wy1) / 2;
  box(.02, wh, ww, night, ox + depth, wcy, wcz);
  box(depth, .02, ww, night, ox + depth / 2, wy0, wcz); box(depth, .02, ww, night, ox + depth / 2, wy1, wcz);
  box(depth, wh, .02, night, ox + depth / 2, wcy, wz0); box(depth, wh, .02, night, ox + depth / 2, wcy, wz1);
  const moon = add(new THREE.Mesh(new THREE.CircleGeometry(.12, 24), mat(0xdfe8f0, { e: 0xcfdcea, ei: 1.2 })), ox + depth - .02, wcy + .35, wcz + .2); moon.rotation.y = -Math.PI / 2;
  for (const z of [wz0, wz1]) box(.08, wh + .1, .06, M.darkwood, X1 - .02, wcy, z);
  box(.08, .06, ww, M.darkwood, X1 - .02, wy0, wcz); box(.08, .06, ww, M.darkwood, X1 - .02, wy1, wcz);
  const casement = add(new THREE.Group(), X1 - .02, wcy, wz0);
  const glassM = mat(0x9fb8c8, { r: .1, m: .2, e: 0x112233, ei: .5 }); glassM.transparent = true; glassM.opacity = .45;
  box(.03, wh - .1, ww / 2, glassM, 0, 0, ww / 4, casement); casement.rotation.y = 1.0;     // swung open into the room
  // Rain beads on the sill and wind-driven streaks beyond the open casement.
  box(.22, .07, ww + .18, M.darkwood, X1 - .02, wy0 - .03, wcz);
  for (let i = 0; i < 7; i++) {
    const x = ox + .08 + (i % 3) * .16, z = wz0 + .12 + i * .11;
    const drop = ball(.018, mat(0x9fb8c8, { r: .15, m: .1, e: 0x263b4b, ei: .5 }), x, wy0 - .01, z);
    drop.scale.set(.7, 1.7, .7);
  }
  for (let i = 0; i < 8; i++) {
    const z = wz0 + .08 + i * .12, y = wy0 + .18 + ((i * 7) % 9) * .1;
    const streak = box(.006, .28 + (i % 3) * .12, .008, mat(0x344a5b, { r: 1, e: 0x1e2c39, ei: .35 }), ox + .04, y, z);
    streak.rotation.z = -.08;
  }
  // A narrow stool has fallen beside the apparatus; broken glass is ordinary lab clutter.
  const stool = add(new THREE.Group(), -.92, .02, -2.35); stool.rotation.z = .9; stool.rotation.x = .16;
  box(.36, .045, .34, M.darkwood, 0, .42, 0, stool);
  for (const [x, z] of [[-.13, -.12], [.13, -.12], [-.13, .12], [.13, .12]]) {
    const leg = cyl(.018, .024, .42, M.wood, x, .21, z, 8, stool); leg.rotation.z = x * 1.6; leg.rotation.x = z * 1.6;
  }
  for (let i = 0; i < 5; i++) {
    const shard = add(new THREE.Mesh(new THREE.TetrahedronGeometry(.07 + (i % 2) * .025), M.glass), -1.55 + i * .07, .012, -2.18 + (i % 3) * .035);
    shard.scale.set(.7, .12, 1.25); shard.rotation.y = i * .8;
  }
  const brokenVial = cyl(.035, .04, .11, M.glass, -1.32, .045, -2.12, 8); brokenVial.rotation.z = 1.15; brokenVial.material.transparent = true; brokenVial.material.opacity = .42;
  const paperScrap = box(.2, .007, .13, M.paper, -.5, .01, -2.95); paperScrap.rotation.y = -.55; paperScrap.rotation.z = .04;

  // the door (closed) and the gas valve beside it
  box(.06, 2.1, .95, M.darkwood, X0 + .03, 1.05, -.2);
  for (const dz of [-.5, .5]) box(.08, 2.2, .06, M.wood, X0 + .04, 1.1, -.2 + dz);
  ball(.04, M.brass, X0 + .09, 1.0, .12);
  cyl(.035, .035, H, M.iron, X0 + .06, H / 2, -1.0);
  const wheel = add(new THREE.Mesh(new THREE.TorusGeometry(.11, .022, 8, 20), M.red), X0 + .14, 1.2, -1.0); wheel.rotation.y = Math.PI / 2;
  cyl(.025, .025, .12, M.brass, X0 + .12, 1.2, -1.0);
  const gasLabel = box(.18, .1, .012, M.paper, X0 + .09, 1.48, -.98);
  box(.13, .014, .006, M.iron, X0 + .09, 1.49, -.972);

  // The gas is shut off: cloudy mantles and soot, no live flame.
  for (const x of [-1.3, 0, 1.3]) {
    cyl(.04, .07, .22, M.brass, x, 2.15, Z0 + .1);
    cyl(.025, .025, .14, M.iron, x, 2.27, Z0 + .14);
    ball(.1, M.lamp, x, 2.38, Z0 + .16);
    const soot = ball(.12, M.soot, x, 2.56, Z0 + .13); soot.scale.set(1.25, .5, .12);
  }
  // A brass wall clock adds period clutter between the shut-off lamp fittings.
  const clockX = -.65;
  add(new THREE.Mesh(new THREE.CircleGeometry(.22, 32), M.darkwood), clockX, 2.48, Z0 + .09);
  add(new THREE.Mesh(new THREE.CircleGeometry(.18, 32), M.paper), clockX, 2.48, Z0 + .075);
  const hand1 = box(.008, .11, .008, M.iron, clockX + .03, 2.52, Z0 + .055); hand1.rotation.z = -.6;
  const hand2 = box(.009, .075, .008, M.iron, clockX - .02, 2.51, Z0 + .052); hand2.rotation.z = .18;
  // Desk, open journal pages, the unsigned marriage will, and a fresh ink pot.
  const dk = [-1.35, -3.62];
  box(1.2, .05, .6, M.wood, dk[0], .765, dk[1]);
  for (const [dx, dz] of [[-.55, -.25], [.55, -.25], [-.55, .25], [.55, .25]]) box(.05, .74, .05, M.darkwood, dk[0] + dx, .37, dk[1] + dz);
  box(.06, .025, .34, M.darkwood, dk[0] + .25, .79, dk[1] + .02).rotation.y = -.04;
  const leftPage = box(.23, .008, .32, mat(0xffffff, { map: pageTexture("PRIVATE JOURNAL"), r: .98 }), dk[0] + .13, .81, dk[1] + .02); leftPage.rotation.y = .06;
  const rightPage = box(.23, .008, .32, mat(0xffffff, { map: pageTexture("RISE!  Q. FLASH", 6, ["The creation will not live.", "Very well. A performance.", "RISE!  Q. flash.", "G. shuts gas. Counts thirty.", "F. blue glow. S. sits up.", "SPARK only. NEVER FULL."]), r: .98 }), dk[0] + .37, .81, dk[1] + .02); rightPage.rotation.y = -.06;
  // The unsigned marriage will is partly tucked beneath the open journal leaves.
  const will = box(.28, .008, .34, mat(0xffffff, { map: pageTexture("LAST WILL", 7, ["To Lady Ashworth upon marriage.", "Viktor Hollowell", "Signature: ___________________", "Witness: _____________________"]), r: .98 }), dk[0] - .02, .797, dk[1] + .02); will.rotation.y = .12;
  cyl(.035, .045, .08, mat(0x29241e, { r: .25, m: .15 }), dk[0] - .48, .84, dk[1] - .16);
  cyl(.012, .009, .23, M.wood, dk[0] - .05, .85, dk[1] - .21, 8).rotation.z = -.8;
  ball(.015, M.iron, dk[0] - .13, .97, dk[1] - .21);
  box(.12, .018, .09, M.brass, dk[0] + .5, .82, dk[1] - .2).rotation.y = .3;   // paperweight
  box(.035, .01, .07, M.paper, dk[0] - .12, .805, dk[1] + .21).rotation.y = .45; // torn margin
  // A ruled ledger and a loose envelope make the desk lived-in without adding case evidence.
  box(.21, .035, .28, M.darkwood, dk[0] - .46, .805, dk[1] + .28).rotation.y = -.12;
  box(.19, .008, .25, mat(0xffffff, { map: pageTexture("ACCOUNTS", 5), r: .98 }), dk[0] - .46, .828, dk[1] + .28).rotation.y = -.12;
  const envelope = box(.17, .01, .11, M.paper, dk[0] + .52, .81, dk[1] + .12); envelope.rotation.y = -.45;
  // Crane's spectacles and their broken, plain-link chain lie at the desk edge.
  for (const x of [dk[0] + .32, dk[0] + .46]) {
    const lens = add(new THREE.Mesh(new THREE.TorusGeometry(.038, .004, 6, 18), M.iron), x, .82, dk[1] + .22); lens.rotation.x = Math.PI / 2;
  }
  box(.03, .006, .008, M.iron, dk[0] + .39, .82, dk[1] + .22);
  for (let i = 0; i < 9; i++) { const link = add(new THREE.Mesh(new THREE.TorusGeometry(.012, .0025, 5, 9), M.iron), dk[0] + .48 + i * .018, .814, dk[1] + .2 - i * .025); link.rotation.set(Math.PI / 2, i % 2 ? .6 : 0, 0); }
  const brokenLoop = add(new THREE.Mesh(new THREE.TorusGeometry(.01, .0025, 5, 8, Math.PI * 1.45), M.iron), dk[0] + .65, .812, dk[1] + .01); brokenLoop.rotation.x = Math.PI / 2;
  // Crane's clean walking stick leans against the desk as a tempting but innocent object.
  const stick = add(new THREE.Group(), -1.78, .02, -2.98); stick.rotation.z = -.16;
  cyl(.018, .022, .92, M.darkwood, 0, .46, 0, 10, stick);
  const crook = add(new THREE.Mesh(new THREE.TorusGeometry(.06, .018, 8, 14, Math.PI), M.darkwood), .045, .92, 0, stick); crook.rotation.z = Math.PI / 2;
  cyl(.023, .025, .05, M.brass, 0, .025, 0, 10, stick);

  // Crane's empty coat hangs over the desk chair; torn journal leaves protrude from its pocket.
  const chair = add(new THREE.Group(), -1.32, .02, -2.94);
  box(.46, .055, .44, M.darkwood, 0, .48, 0, chair);
  for (const [x, z] of [[-.19, -.17], [.19, -.17], [-.19, .17], [.19, .17]]) box(.045, .48, .045, M.wood, x, .24, z, chair);
  for (const x of [-.19, .19]) box(.045, .62, .045, M.darkwood, x, .78, .17, chair);
  box(.42, .5, .045, M.darkwood, 0, .78, .17, chair);
  const coat = add(new THREE.Group(), 0, 0, 0, chair);
  box(.44, .57, .07, M.coat, 0, 1.0, .22, coat);
  for (const side of [-1, 1]) {
    const sleeve = box(.15, .46, .11, M.coat, side * .25, .87, .24, coat); sleeve.rotation.z = side * -.16;
    box(.09, .08, .012, M.iron, side * .25, .64, .3, coat);
  }
  box(.16, .13, .014, M.darkwood, -.04, .91, .26, coat); // inner breast pocket
  const torn = box(.105, .18, .006, mat(0xffffff, { map: pageTexture("TORN JOURNAL", 7, ["The creation will not live.", "A performance instead.", "RISE! Q. flash.", "G. shuts gas. Counts thirty.", "F. blue glow. S. sits up.", "SPARK only. NEVER FULL.", "C. in the corridor again."]), r: .98 }), -.05, 1.015, .272, coat);
  torn.rotation.z = -.08;
  const tornMargin = box(.075, .125, .005, mat(0xffffff, { map: pageTexture("MARGIN", 3, ["C. in the corridor", "again during rehearsal."]), r: .98 }), .005, .99, .266, coat);
  tornMargin.rotation.z = .12;
  for (const y of [.86, .98, 1.1]) ball(.012, M.brass, .12, y, .26, coat);

  // the machine: cabinet, coils, brass sphere, dial and lever at FULL
  const mc = [-.2, -3.6];
  box(.9, 1.1, .6, M.darkwood, mc[0], .55, mc[1]);
  box(.94, .04, .64, M.brass, mc[0], 1.12, mc[1]);
  for (const dx of [-.3, .3]) { const coil = add(new THREE.Mesh(new THREE.TorusKnotGeometry(.1, .022, 48, 6, 2, 9), M.copper), mc[0] + dx, 1.3, mc[1]); coil.rotation.x = Math.PI / 2; }
  cyl(.025, .025, .34, M.brass, mc[0], 1.3, mc[1]);
  const sphere = ball(.18, M.brass, mc[0], 1.62, mc[1]);
  sphere.position.x += .07; sphere.position.y = 1.6; sphere.rotation.z = .35; // replaced crooked on its worn thread
  const oily = mat(0x423326, { r: .26, m: .12 });
  for (const [dx, dy] of [[-.06, -.04], [-.025, .025], [.015, .04], [.052, .01], [.045, -.045]]) { const mark = ball(.012, oily, mc[0] + .07 + dx, 1.6 + dy, mc[1] + .17); mark.scale.set(1, 1.15, .35); }
  const bloodOnSphere = ball(.038, M.stain, mc[0] + .03, 1.43, mc[1] - .02); bloodOnSphere.scale.set(1.7, .16, 1.2);
  const greyHair = add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(mc[0] - .08, 1.44, mc[1] - .08), new THREE.Vector3(mc[0] - .03, 1.445, mc[1] - .1), new THREE.Vector3(mc[0] + .02, 1.44, mc[1] - .08),
  ]), 8, .003, 4), M.hair));
  const dial = tex(256, 128, (g, w, h) => { g.fillStyle = "#e7dcc0"; g.fillRect(0, 0, w, h); g.strokeStyle = "#2b2119"; g.lineWidth = 4; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = "#2b2119"; g.font = "bold 26px Georgia"; g.textAlign = "center"; g.fillText("OFF", 44, 100); g.fillText("SPARK", 128, 100); g.fillStyle = "#8b1e1e"; g.fillText("FULL", 212, 100); g.beginPath(); g.arc(128, 128, 90, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); });
  add(new THREE.Mesh(new THREE.PlaneGeometry(.44, .22), mat(0xffffff, { map: dial })), mc[0] + .2, .82, mc[1] + .305);
  const lever = add(new THREE.Group(), mc[0] + .2, .66, mc[1] + .33);
  box(.035, .34, .035, M.brass, 0, .17, 0, lever); ball(.045, M.iron, 0, .36, 0, lever); lever.rotation.z = -.95;
  box(.015, .16, .012, M.cream, mc[0] + .27, .62, mc[1] + .34).rotation.z = .5;      // scorched cream fibers caught on the hinge
  box(.007, .12, .008, M.linen, mc[0] + .285, .62, mc[1] + .345).rotation.z = .54;
  box(.007, .09, .008, M.cream, mc[0] + .255, .62, mc[1] + .345).rotation.z = .44;
  const sootOnHandle = ball(.026, M.soot, mc[0] + .49, .87, mc[1] + .33); sootOnHandle.scale.set(.7, 1.4, .55);
  const powder = ball(.055, mat(0xaaa79f, { r: 1 }), mc[0] + .35, .76, mc[1] + .4); powder.scale.set(1.6, .14, .8);
  // A voltmeter and porcelain terminals sit beneath the main coil.
  box(.28, .18, .025, M.darkwood, mc[0] - .27, .91, mc[1] + .317);
  const meterFace = add(new THREE.Mesh(new THREE.CircleGeometry(.072, 24), M.paper), mc[0] - .27, .92, mc[1] + .335); meterFace.rotation.x = 0;
  const meterNeedle = box(.006, .006, .003, M.red, mc[0] - .27, .925, mc[1] + .34); meterNeedle.rotation.z = -.45;
  for (const dx of [-.38, .38]) { cyl(.055, .06, .12, mat(0xe0d8c4, { r: .35 }), mc[0] + dx, 1.19, mc[1] + .22); cyl(.018, .018, .08, M.brass, mc[0] + dx, 1.27, mc[1] + .22); }

  // the bucket (the gloves turn up in Round 3)
  const bk = [-.85, -2.95];
  cyl(.2, .16, .36, M.wood, bk[0], .18, bk[1], 20);
  const water = cyl(.185, .185, .01, mat(0x10181c, { r: .1, m: .3 }), bk[0], .33, bk[1], 20);
  if (round >= 3) {
    // The later examination has emptied the bucket and set both gloves over its rim.
    water.visible = false;
    makeGlove(bk[0] + .04, .35, bk[1] + .02, .6, true, false);
    makeGlove(bk[0] - .05, .37, bk[1] - .03, -.4, false, true);
    const puddle = add(new THREE.Mesh(new THREE.CircleGeometry(.22, 28), mat(0x26313a, { r: .18, m: .1 })), bk[0] + .18, .004, bk[1] + .18); puddle.rotation.x = -Math.PI / 2; puddle.scale.set(1.35, .6, 1);
  } else {
    // Pale leather is just visible through the dark water; its detail is exposed in Round 3.
    const submergedGlove = box(.09, .015, .16, mat(0x776c58, { r: .95 }), bk[0] + .02, .28, bk[1] + .01); submergedGlove.rotation.y = .5;
  }

  // Fenwick's screen in the north-east corner
  const sc = [1.45, -3.65];
  for (const i of [-1, 0, 1]) { const p = box(.55, 1.6, .03, mat(0x241612, { r: .5 }), sc[0] + i * .52, .85, sc[1] + (i ? .12 : 0)); p.rotation.y = i * .35; }

  // A high east-wall rack holds period glassware; the clear walkway below stays open.
  box(.12, .05, 1.05, M.darkwood, X1 - .12, 2.08, -3.36);
  for (const z of [-3.82, -3.48, -3.12]) {
    const jar = cyl(.09, .1, .25, M.glass, X1 - .24, 2.24, z, 16); jar.material.transparent = true; jar.material.opacity = .42;
    cyl(.075, .075, .08, mat(0x4a3322, { r: .8 }), X1 - .24, 2.405, z, 12);
    cyl(.06, .06, .08, M.liquid, X1 - .24, 2.16, z, 16);
    box(.11, .045, .006, M.paper, X1 - .24, 2.25, z + .096);
  }
  // Viktor's table with the electrodes and the body (head to the north)
  const vt = [-.15, -2.15];
  const table = (x, z) => { box(.8, .08, 1.9, M.slab, x, .86, z); for (const [dx, dz] of [[-.34, -.86], [.34, -.86], [-.34, .86], [.34, .86]]) box(.06, .82, .06, M.iron, x + dx, .41, z + dz); };
  table(...vt);
  for (const dx of [-.28, .28]) { cyl(.04, .04, .2, M.brass, vt[0] + dx, 1.0, vt[1] - .85); ball(.06, M.brass, vt[0] + dx, 1.13, vt[1] - .85); }
  const body = add(new THREE.Group(), vt[0], .9, vt[1]);
  const torso = add(new THREE.Mesh(new THREE.CapsuleGeometry(.18, .48, 8, 16), M.coat), 0, .14, -.18, body); torso.rotation.x = Math.PI / 2;
  box(.31, .13, .76, M.coat, 0, .09, .5, body);
  for (const z of [-.05, .13, .31]) ball(.018, M.brass, 0, .211, z, body);
  const head = add(new THREE.Group(), 0, .13, -.62, body); head.rotation.y = .28;
  ball(.11, M.skin, 0, 0, 0, head);
  const haircap = add(new THREE.Mesh(new THREE.SphereGeometry(.112, 18, 12, 0, Math.PI * 2, 0, Math.PI * .57), M.hair), 0, .018, -.006, head);
  const wound = ball(.026, M.stain, .012, -.006, -.102, head); wound.scale.set(1.25, .5, .4); // small, at the back of the skull
  const tableBlood = add(new THREE.Mesh(new THREE.CircleGeometry(.1, 24), M.stain), vt[0], .905, vt[1] - .87); tableBlood.rotation.x = -Math.PI / 2; tableBlood.scale.set(1.25, .7, 1);
  for (const s of [-1, 1]) {
    const arm = add(new THREE.Mesh(new THREE.CapsuleGeometry(.052, .4, 6, 10), M.coat), s * .23, .1, -.2, body); arm.rotation.x = Math.PI / 2;
    const palm = ball(.054, M.skin, s * .23, .1, .09, body); palm.scale.set(1.15, .65, 1.35);
    for (let f = 0; f < 4; f++) {
      const finger = add(new THREE.Mesh(new THREE.CapsuleGeometry(.012, .045, 3, 6), M.skin), s * .23 + (f - 1.5) * .022, .093, .145 + Math.abs(f - 1.5) * .008, body);
      finger.rotation.x = Math.PI / 2;
    }
    const burn = ball(.021, M.burn, s * .23, .108, .12, body); burn.scale.set(1.2, .2, .75);
  }
  // Viktor's right fist holds the snapped chain: short twisted links, with both ends broken.
  for (let i = 0; i < 5; i++) {
    const link = add(new THREE.Mesh(new THREE.TorusGeometry(.018, .004, 6, 12), M.gold), .23 + i * .014, .112 + (i % 2) * .006, .13 + i * .018, body);
    link.rotation.set(Math.PI / 2, i % 2 ? .7 : 0, i % 2 ? .7 : 0);
  }
  const snappedEnd = add(new THREE.Mesh(new THREE.TorusGeometry(.013, .003, 6, 10, Math.PI * 1.45), M.gold), .31, .105, .23, body); snappedEnd.rotation.x = Math.PI / 2;
  const secondSnap = add(new THREE.Mesh(new THREE.TorusGeometry(.012, .003, 6, 10, Math.PI * 1.4), M.gold), .29, .115, .115, body); secondSnap.rotation.set(Math.PI / 2, .4, .3);
  const locket = add(new THREE.Group(), vt[0] - .05, .025, vt[1] - .55);
  const pendant = add(new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .015, 24), M.gold), 0, .012, 0, locket);
  const photoMat = mat(0xffffff, { map: locketPhotoTexture, r: .95, side: THREE.DoubleSide });
  const photo = add(new THREE.Mesh(new THREE.CircleGeometry(.032, 20), photoMat), 0, .021, 0, locket); photo.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 7; i++) { const link = add(new THREE.Mesh(new THREE.TorusGeometry(.014, .003, 5, 9), M.gold), vt[0] - .12 + i * .02, .025, vt[1] - .68 + (i % 2) * .014); link.rotation.x = Math.PI / 2; }

  // the creation's table, empty, and its sheet on the floor
  const ct = [1.15, -2.15];
  table(...ct);
  const sheetGeo = new THREE.PlaneGeometry(1.2, .9, 12, 10), pos = sheetGeo.attributes.position, rs = rng(5);
  for (let i = 0; i < pos.count; i++) pos.setZ(i, rs() * .09);
  sheetGeo.computeVertexNormals();
  const sheet = add(new THREE.Mesh(sheetGeo, mat(0xe8e0cf, { r: .95, side: THREE.DoubleSide })), 1.3, .03, -.95); sheet.rotation.x = -Math.PI / 2;

  // cables tangled across the floor between the tables
  const r = rng(11);
  for (let i = 0; i < 16; i++) {
    const pts = []; let x = -.6 + r() * 2.2, z = -3 + r() * 1.9;
    for (let k = 0; k < 6; k++) { pts.push(new THREE.Vector3(x, .025 + r() * .02, z)); x = Math.min(1.6, Math.max(-.6, x + (r() - .5) * .8)); z = Math.min(-1.1, Math.max(-3, z + (r() - .5) * .5)); }
    add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .018 + r() * .014, 5), M.rubber), 0, 0, 0);
  }

  // footprints: the creation's table -> the machine -> along the north walkway -> the window
  const route = [[1.0, -3.05], [.6, -3.15], [.3, -3.2], [.6, -3.42], [1.0, -3.45], [1.4, -3.3], [1.72, -2.9], [1.88, -2.3]];
  const footShape = new THREE.Shape();
  footShape.moveTo(-.035, -.09); footShape.bezierCurveTo(-.05, -.04, -.045, .02, -.052, .055);
  footShape.bezierCurveTo(-.058, .09, -.04, .105, -.018, .1); footShape.bezierCurveTo(.02, .11, .055, .09, .052, .05);
  footShape.bezierCurveTo(.05, .01, .048, -.045, .033, -.09); footShape.bezierCurveTo(.018, -.115, -.02, -.115, -.035, -.09);
  const footGeo = new THREE.ShapeGeometry(footShape);
  const muddyPrint = mat(0x332519, { r: 1 }); muddyPrint.transparent = true; muddyPrint.opacity = .8;
  let left = true;
  for (let i = 0; i < route.length - 1; i++) {
    const a = new THREE.Vector3(route[i][0], 0, route[i][1]), b = new THREE.Vector3(route[i + 1][0], 0, route[i + 1][1]), steps = Math.max(1, Math.round(a.distanceTo(b) / .3)), dir = b.clone().sub(a).normalize();
    for (let k = 0; k < steps; k++) {
      const p = a.clone().lerp(b, k / steps), side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(left ? .06 : -.06);
      const f = add(new THREE.Group(), p.x + side.x, .007, p.z + side.z);
      const print = add(new THREE.Mesh(footGeo, muddyPrint), 0, 0, 0, f); print.rotation.x = -Math.PI / 2;
      f.rotation.y = Math.atan2(-dir.x, -dir.z); left = !left;
    }
  }

  // the viewing rail in front of the guests, its gate standing open
  const rz = -.45, rx0 = -.3, rx1 = X1 - .05;
  const rail = add(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, rx1 - rx0, 12), M.brass), (rx0 + rx1) / 2, .95, rz); rail.rotation.z = Math.PI / 2;
  for (let x = rx0; x <= rx1 + .01; x += (rx1 - rx0) / 5) cyl(.025, .025, .95, M.brass, x, .475, rz);
  const gate = add(new THREE.Group(), rx0, 0, rz);
  const gb = add(new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .7, 10), M.brass), -.35, .95, 0, gate); gb.rotation.z = Math.PI / 2;
  cyl(.02, .02, .95, M.brass, -.7, .475, 0, 8, gate); gate.rotation.y = -1.2;

  // the camera on its tripod (Quill and the Inspector), in the south-west corner
  const cm = [-1.45, .2];
  for (const a of [0, 2.1, 4.2]) { const leg = cyl(.015, .015, 1.4, M.wood, cm[0] + Math.cos(a) * .2, .68, cm[1] + Math.sin(a) * .2, 6); leg.rotation.set(Math.sin(a) * .18, 0, -Math.cos(a) * .18); }
  const camBox = add(new THREE.Group(), cm[0], 1.45, cm[1]); camBox.rotation.y = -.7;
  box(.3, .26, .36, M.darkwood, 0, 0, 0, camBox);
  box(.21, .18, .17, M.coat, 0, .01, -.23, camBox); // bellows
  const lens = cyl(.06, .075, .18, M.brass, 0, 0, -.34, 16, camBox); lens.rotation.x = Math.PI / 2;
  cyl(.083, .083, .035, M.iron, 0, 0, -.39, 20, camBox).rotation.x = Math.PI / 2;
  box(.24, .19, .025, M.iron, 0, .015, .18, camBox); // glass plate holder
  const negative = box(.2, .15, .004, mat(0x182229, { r: .2, m: .08 }), 0, .015, .197, camBox);
  // Magnesium flash pan, cold after the exposure.
  const flashArm = cyl(.012, .012, .42, M.brass, cm[0] + .25, 1.79, cm[1] + .05, 8); flashArm.rotation.z = -.12;
  const reflector = add(new THREE.Mesh(new THREE.SphereGeometry(.17, 14, 8), mat(0x928a78, { r: .45, m: .6 })), cm[0] + .25, 2.02, cm[1] + .05); reflector.scale.set(1.2, .22, .72);
  const spentFlash = ball(.05, M.soot, cm[0] + .25, 2.045, cm[1] + .05); spentFlash.scale.set(1.2, .18, .8);
  const plateTray = box(.24, .025, .32, M.darkwood, cm[0] + .38, .08, cm[1] - .18); plateTray.rotation.y = -.25;
  const loosePlate = box(.19, .008, .26, mat(0x263540, { r: .18, m: .08 }), cm[0] + .38, .1, cm[1] - .18); loosePlate.rotation.y = -.25;

  // Invisible touch volumes keep the physical room free of evidence tents and interface boards.
  const tapMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
  const evidencePoints = [
    [1, mc[0] + .2, .9, mc[1] + .33, .25], [2, X0 + .14, 1.2, -1.0, .22], [3, X1 - .02, 1.65, wcz, .35],
    [4, vt[0], 1.02, vt[1] - .35, .4], [5, cm[0], 1.45, cm[1], .3], [6, -1.37, 1.04, -2.67, .28],
    [7, bk[0], .22, bk[1], .24], [8, mc[0] + .07, 1.6, mc[1], .25], [9, vt[0] - .05, .05, vt[1] - .55, .22],
  ];
  for (const [n, x, y, z, radius] of evidencePoints) {
    if (ROUND_OF[n] > round) continue;
    const target = add(new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 8), tapMat), x, y, z);
    target.userData.evidence = n; target.castShadow = false; target.receiveShadow = false;
  }

  lab.traverse(o => { if (o.isMesh) { const hitTarget = o.userData.evidence !== undefined; o.castShadow = !hitTarget; o.receiveShadow = !hitTarget; } });

  return lab;
}
