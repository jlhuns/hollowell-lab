// The walk-in laboratory: a compact, life-size room (4 m x 4.6 m) whose origin is the spot where the
// guest starts, facing -Z (the north wall). Shared by walk.html (8th Wall tracking) and ar-build.html.
import * as THREE from "three";

export const TITLES = { 1: "The lever", 2: "The gas valve", 3: "The open window", 4: "The body", 5: "The photograph", 6: "The journal", 7: "The bucket", 8: "The sphere", 9: "The locket" };
export const ROUND_OF = { 1: 1, 2: 1, 3: 1, 4: 2, 5: 2, 6: 2, 7: 3, 8: 3, 9: 3 };
export const X0 = -2, X1 = 2, Z0 = -4, Z1 = .6, H = 3;          // inside faces of the walls; the guest starts at (0, 0, 0)

function tex(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.r ?? .8, metalness: o.m ?? 0, emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1, map: o.map ?? null, side: o.side ?? THREE.FrontSide });
function signTex(text, bg, fg, w = 256, h = 256, font = "bold 150px Georgia") {
  return tex(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = fg; g.lineWidth = 10; g.strokeRect(8, 8, W - 16, H - 16);
    g.fillStyle = fg; g.font = font; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, W / 2, H / 2 + 6); });
}

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

export function buildLab(round) {
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
    paper: mat(0xe6dcc3, { r: .95 }), red: mat(0x7a1e1e, { r: .5, m: .5 }), lamp: mat(0xffd9a0, { e: 0xffb060, ei: 1.5 }),
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
  box(W + .2, H, .1, wallM, 0, H / 2, Z1 + .05);                                   // south, behind the guest
  box(.1, H, D, wallM, X0 - .05, H / 2, cz);                                        // west, with the door
  const wz0 = -2.6, wz1 = -1.6, wy0 = .9, wy1 = 2.4;                                 // east, with the window
  box(.1, H, wz0 - Z0, wallM, X1 + .05, H / 2, (Z0 + wz0) / 2);
  box(.1, H, Z1 - wz1, wallM, X1 + .05, H / 2, (wz1 + Z1) / 2);
  box(.1, wy0, wz1 - wz0, wallM, X1 + .05, wy0 / 2, (wz0 + wz1) / 2);
  box(.1, H - wy1, wz1 - wz0, wallM, X1 + .05, (H + wy1) / 2, (wz0 + wz1) / 2);
  box(W + .2, .1, D + .2, mat(0x2a1d15, { r: .95 }), 0, H + .05, cz);              // ceiling
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

  // the door (closed) and the gas valve beside it
  box(.06, 2.1, .95, M.darkwood, X0 + .03, 1.05, -.2);
  for (const dz of [-.5, .5]) box(.08, 2.2, .06, M.wood, X0 + .04, 1.1, -.2 + dz);
  ball(.04, M.brass, X0 + .09, 1.0, .12);
  cyl(.035, .035, H, M.iron, X0 + .06, H / 2, -1.0);
  const wheel = add(new THREE.Mesh(new THREE.TorusGeometry(.11, .022, 8, 20), M.red), X0 + .14, 1.2, -1.0); wheel.rotation.y = Math.PI / 2;

  // gas lamps on the north wall
  for (const x of [-1.3, 0, 1.3]) { cyl(.04, .07, .22, M.brass, x, 2.15, Z0 + .1); ball(.1, M.lamp, x, 2.33, Z0 + .16); }

  // desk with the open journal
  const dk = [-1.35, -3.62];
  box(1.2, .05, .6, M.wood, dk[0], .765, dk[1]);
  for (const [dx, dz] of [[-.55, -.25], [.55, -.25], [-.55, .25], [.55, .25]]) box(.05, .74, .05, M.darkwood, dk[0] + dx, .37, dk[1] + dz);
  box(.24, .01, .32, M.paper, dk[0] + .15, .795, dk[1] + .02).rotation.y = .1;
  box(.24, .01, .32, M.paper, dk[0] + .4, .795, dk[1] + .04).rotation.y = -.08;
  cyl(.035, .04, .07, M.iron, dk[0] - .25, .825, dk[1] - .12);

  // the machine: cabinet, coils, brass sphere, dial and lever at FULL
  const mc = [-.2, -3.6];
  box(.9, 1.1, .6, M.darkwood, mc[0], .55, mc[1]);
  box(.94, .04, .64, M.brass, mc[0], 1.12, mc[1]);
  for (const dx of [-.3, .3]) { const coil = add(new THREE.Mesh(new THREE.TorusKnotGeometry(.1, .022, 48, 6, 2, 9), M.copper), mc[0] + dx, 1.3, mc[1]); coil.rotation.x = Math.PI / 2; }
  cyl(.025, .025, .34, M.brass, mc[0], 1.3, mc[1]);
  const sphere = ball(.18, M.brass, mc[0], 1.62, mc[1]);
  if (round >= 3) { sphere.position.x += .07; sphere.position.y = 1.6; sphere.rotation.z = .35; }   // found sitting crooked
  const dial = tex(256, 128, (g, w, h) => { g.fillStyle = "#e7dcc0"; g.fillRect(0, 0, w, h); g.strokeStyle = "#2b2119"; g.lineWidth = 4; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = "#2b2119"; g.font = "bold 26px Georgia"; g.textAlign = "center"; g.fillText("OFF", 44, 100); g.fillText("SPARK", 128, 100); g.fillStyle = "#8b1e1e"; g.fillText("FULL", 212, 100); g.beginPath(); g.arc(128, 128, 90, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); });
  add(new THREE.Mesh(new THREE.PlaneGeometry(.44, .22), mat(0xffffff, { map: dial })), mc[0] + .2, .82, mc[1] + .305);
  const lever = add(new THREE.Group(), mc[0] + .2, .66, mc[1] + .33);
  box(.035, .34, .035, M.brass, 0, .17, 0, lever); ball(.045, M.iron, 0, .36, 0, lever); lever.rotation.z = -.95;
  box(.015, .16, .012, M.linen, mc[0] + .27, .62, mc[1] + .34).rotation.z = .5;      // the gauze

  // the bucket (the gloves turn up in Round 3)
  const bk = [-.85, -2.95];
  cyl(.2, .16, .36, M.wood, bk[0], .18, bk[1], 20);
  cyl(.185, .185, .01, mat(0x10181c, { r: .1, m: .3 }), bk[0], .33, bk[1], 20);
  if (round >= 3) {
    box(.11, .04, .22, M.cream, bk[0] + .04, .35, bk[1] + .02).rotation.y = .6;
    const g2 = box(.1, .04, .2, M.cream, bk[0] - .05, .37, bk[1] - .03); g2.rotation.y = -.4; g2.rotation.z = .3;
  }

  // Fenwick's screen in the north-east corner
  const sc = [1.45, -3.65];
  for (const i of [-1, 0, 1]) { const p = box(.55, 1.6, .03, mat(0x241612, { r: .5 }), sc[0] + i * .52, .85, sc[1] + (i ? .12 : 0)); p.rotation.y = i * .35; }

  // Viktor's table with the electrodes and the body (head to the north)
  const vt = [-.15, -2.15];
  const table = (x, z) => { box(.8, .08, 1.9, M.slab, x, .86, z); for (const [dx, dz] of [[-.34, -.86], [.34, -.86], [-.34, .86], [.34, .86]]) box(.06, .82, .06, M.iron, x + dx, .41, z + dz); };
  table(...vt);
  for (const dx of [-.28, .28]) { cyl(.04, .04, .2, M.brass, vt[0] + dx, 1.0, vt[1] - .85); ball(.06, M.brass, vt[0] + dx, 1.13, vt[1] - .85); }
  const body = add(new THREE.Group(), vt[0], .9, vt[1]);
  ball(.11, M.skin, 0, .13, -.62, body);
  const torso = add(new THREE.Mesh(new THREE.CapsuleGeometry(.17, .5, 6, 12), M.coat), 0, .14, -.18, body); torso.rotation.x = Math.PI / 2;
  box(.3, .14, .78, M.coat, 0, .09, .5, body);
  for (const s of [-1, 1]) { const arm = add(new THREE.Mesh(new THREE.CapsuleGeometry(.055, .42, 4, 8), M.coat), s * .23, .1, -.2, body); arm.rotation.x = Math.PI / 2; ball(.06, mat(0x1a1210, { r: 1 }), s * .23, .1, .1, body); }
  if (round >= 3) { const locket = add(new THREE.Mesh(new THREE.TorusGeometry(.05, .018, 8, 20), M.gold), vt[0] - .05, .02, vt[1] - .55); locket.rotation.x = Math.PI / 2; }

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
  let left = true;
  for (let i = 0; i < route.length - 1; i++) {
    const a = new THREE.Vector3(route[i][0], 0, route[i][1]), b = new THREE.Vector3(route[i + 1][0], 0, route[i + 1][1]), steps = Math.max(1, Math.round(a.distanceTo(b) / .3)), dir = b.clone().sub(a).normalize();
    for (let k = 0; k < steps; k++) {
      const p = a.clone().lerp(b, k / steps), side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(left ? .06 : -.06);
      const f = add(new THREE.Mesh(new THREE.CircleGeometry(.05, 10), M.mud), p.x + side.x, .006, p.z + side.z); f.scale.set(1, 1.7, 1); f.rotation.x = -Math.PI / 2; f.rotation.z = -Math.atan2(dir.x, dir.z); left = !left;
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
  box(.3, .26, .36, M.darkwood, 0, 0, 0, camBox); const lens = cyl(.06, .075, .18, M.brass, 0, 0, -.25, 16, camBox); lens.rotation.x = Math.PI / 2;

  // numbered evidence markers, the round plaque and a key on the wall (cards can't be tapped in AR)
  const tentMap = {};
  const tent = n => {
    const g = new THREE.Group(), map = tentMap[n] ??= signTex(String(n), "#f2c230", "#141414"), w = .2, h = .15, a = .35, m = new THREE.MeshStandardMaterial({ map, roughness: .8 });
    const front = add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), m), 0, h / 2 * Math.cos(a), h / 2 * Math.sin(a), g); front.rotation.set(-a, 0, 0);
    const back = add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), m), 0, h / 2 * Math.cos(a), -h / 2 * Math.sin(a), g); back.rotation.set(a, Math.PI, 0);
    return g;
  };
  const tents = [[1, .08, -3.1, 0], [2, -1.75, -1.0, 0], [3, 1.72, -2.05, 0], [4, .12, -1.35, .9], [5, -1.1, .05, 0], [6, -1.0, -3.5, .79], [7, -.85, -2.62, 0], [8, -.52, -3.45, 1.14], [9, .05, -2.5, 0]];
  for (const [n, x, z, y] of tents) if (ROUND_OF[n] <= round) {
    const t = tent(n); add(t, x, y, z); t.rotation.y = Math.atan2(x, z) + Math.PI;   // face the start spot
    t.userData.evidence = n;
    const hit = add(new THREE.Mesh(new THREE.SphereGeometry(.3, 8, 6), new THREE.MeshBasicMaterial()), 0, .08, 0, t); hit.visible = false;   // easy to tap
  }

  const plaque = signTex(`ROUND ${round}  ·  HOLLOWELL MANOR  ·  31 OCTOBER 1888`, "#2b2119", "#e8c766", 1024, 146, "bold 50px Georgia");
  add(new THREE.Mesh(new THREE.PlaneGeometry(2.6, .37), mat(0xffffff, { map: plaque, r: .7 })), 0, 2.7, Z0 + .01);

  const keyTex = tex(1024, 800, (g, w, h) => {
    g.fillStyle = "#e6dcc3"; g.fillRect(0, 0, w, h); g.strokeStyle = "#2b2119"; g.lineWidth = 12; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = "#8b1e1e"; g.font = "bold 44px Georgia"; g.textAlign = "center"; g.fillText(`EVIDENCE · ROUND ${round}`, w / 2, 86);
    g.textAlign = "left"; g.font = "44px Georgia"; let y = 170;
    for (const n of Object.keys(TITLES).map(Number).filter(n => ROUND_OF[n] <= round)) {
      g.fillStyle = "#f2c230"; g.fillRect(90, y - 40, 56, 52); g.fillStyle = "#141414"; g.font = "bold 40px Georgia"; g.textAlign = "center"; g.fillText(String(n), 118, y);
      g.fillStyle = "#2b2119"; g.font = "44px Georgia"; g.textAlign = "left"; g.fillText(TITLES[n], 172, y); y += 64;
    }
    g.fillStyle = "#6b5a45"; g.font = "italic 34px Georgia"; g.textAlign = "center"; g.fillText("Read each card on the website.", w / 2, h - 50);
  });
  const key = add(new THREE.Mesh(new THREE.PlaneGeometry(1.0, .78), mat(0xffffff, { map: keyTex, r: .9 })), X1 - .01, 1.75, -.15); key.rotation.y = -Math.PI / 2;
  box(.03, .84, 1.06, M.darkwood, X1 - .005, 1.75, -.15);
  key.position.x -= .02;

  return lab;
}
