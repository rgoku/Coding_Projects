// Create Site 3D Builder — extracted from solar-farm-v2
// Builds the full 3D solar farm scene based on configuration
import { csTexMkPanel, csTexMkGround, csTexMkGravel } from './createSiteTextures.js';

export function csBuildSite(sc, inv, dc, comb, isBi, isFS) {
  const R = () => Math.random();
  const waypoints = [];
  const signs = [];

  // ═══ TERRAIN ═══
  const gG = new THREE.PlaneGeometry(800, 800, 80, 80);
  const gP = gG.attributes.position;
  for (let i = 0; i < gP.count; i++) {
    const gx = gP.getX(i), gz = gP.getY(i);
    let elev = Math.sin(gx * .032) * Math.cos(gz * .042) * .45;
    elev += Math.sin(gx * .085 + gz * .075) * .18;
    elev += Math.sin(gx * .52) * Math.cos(gz * .48) * .035;
    const dist = Math.sqrt(gx * gx + gz * gz);
    if (dist > 100) elev -= (dist - 100) * .002;
    gP.setZ(i, elev);
  }
  gG.computeVertexNormals();
  const gnd = new THREE.Mesh(gG, new THREE.MeshStandardMaterial({ map: csTexMkGround(), roughness: .95, metalness: 0, envMapIntensity: .05 }));
  gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; sc.add(gnd);

  // Worn paths
  const pathMat = new THREE.MeshStandardMaterial({ color: 0x6a5a45, roughness: .98, metalness: 0 });
  for (let p = 0; p < 6; p++) {
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(2.5 + R() * .5, 15 + R() * 10), pathMat);
    pm.rotation.x = -Math.PI / 2; pm.position.set(-50 + R() * 100, .085, -60 + p * 20 + R() * 8); pm.receiveShadow = true; sc.add(pm);
  }

  // ═══ MATERIALS ═══
  const pTex = csTexMkPanel(isBi, isFS);
  const M = {
    pnl: isFS
      ? new THREE.MeshStandardMaterial({ map: pTex, roughness: .06, metalness: .15, envMapIntensity: .4, emissive: 0x050508, emissiveIntensity: .02 })
      : new THREE.MeshStandardMaterial({ map: pTex, roughness: isBi ? .04 : .11, metalness: isBi ? .75 : .22, envMapIntensity: isBi ? 1.3 : .35, emissive: isBi ? 0x0a0a16 : 0x000000, emissiveIntensity: .018 }),
    frame: new THREE.MeshStandardMaterial({ color: 0xBEC2C6, roughness: .16, metalness: .94, envMapIntensity: .88 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x8A8A92, roughness: .38, metalness: .90, envMapIntensity: .65 }),
    galv: new THREE.MeshStandardMaterial({ color: 0xA8AEB2, roughness: .26, metalness: .84, envMapIntensity: .78 }),
    dc: new THREE.MeshStandardMaterial({ color: 0xA81C1C, roughness: .64, metalness: .07 }),
    ac: new THREE.MeshStandardMaterial({ color: 0xCA6814, roughness: .60, metalness: .10 }),
    inv: new THREE.MeshStandardMaterial({ color: 0x354050, roughness: .28, metalness: .52 }),
    invD: new THREE.MeshStandardMaterial({ color: 0x3D4858, roughness: .32, metalness: .42 }),
    conc: new THREE.MeshStandardMaterial({ color: 0x9C9C96, roughness: .94, metalness: 0 }),
    tx: new THREE.MeshStandardMaterial({ color: 0x4A7248, roughness: .45, metalness: .40 }),
    txFin: new THREE.MeshStandardMaterial({ color: 0x3E6640, roughness: .40, metalness: .48 }),
    fence: new THREE.MeshStandardMaterial({ color: 0x9A9A9A, roughness: .36, metalness: .80, transparent: true, opacity: .36, side: THREE.DoubleSide }),
    fP: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: .33, metalness: .87 }),
    comb: new THREE.MeshStandardMaterial({ color: 0x5C5C5C, roughness: .32, metalness: .72 }),
    warn: new THREE.MeshStandardMaterial({ color: 0xE8C800, roughness: .35, metalness: .05 }),
    led: new THREE.MeshStandardMaterial({ color: 0x22CC44, roughness: .1, metalness: .15, emissive: 0x22AA33, emissiveIntensity: .4 }),
    ledAmber: new THREE.MeshStandardMaterial({ color: 0xDDA030, roughness: .1, metalness: .15, emissive: 0xBB8822, emissiveIntensity: .35 }),
    bush: new THREE.MeshStandardMaterial({ color: 0x4D6F34, roughness: .96, metalness: 0 }),
    bark: new THREE.MeshStandardMaterial({ color: 0x5E3F24, roughness: .99, metalness: 0 }),
    canopy: new THREE.MeshStandardMaterial({ color: 0x3F702C, roughness: .89, metalness: 0 }),
    white: new THREE.MeshStandardMaterial({ color: 0xF7F7F7, roughness: .32, metalness: .06 }),
    bldg: new THREE.MeshStandardMaterial({ color: 0xC7BFB2, roughness: .87, metalness: .018 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x6C6C6C, roughness: .33, metalness: .75 }),
    ceramic: new THREE.MeshStandardMaterial({ color: 0xE7DCCE, roughness: .26, metalness: .06 }),
  };

  const ROWS = 16, RS = 8.5, TILT = 22 * Math.PI / 180;
  const PW = isFS ? 1.24 : 1.13, PH = isFS ? 2.0 : 2.28, PD = isFS ? .028 : .035, GAP = .04;
  const PPR = isFS ? 90 : (isBi ? 110 : 95);
  const RL = PPR * (PW + GAP), X0 = -RL / 2, Z0 = -(ROWS * RS) / 2, HUB = 3.4;
  const gvT = csTexMkGravel();

  function gpad(cx, cz, w, d) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: gvT.clone(), roughness: .82, metalness: .05 }));
    m.material.map.repeat.set(w / 8, d / 8); m.material.map.wrapS = m.material.map.wrapT = THREE.RepeatWrapping;
    m.rotation.x = -Math.PI / 2; m.position.set(cx, .09, cz); m.receiveShadow = true; sc.add(m);
  }

  // ═══ SIGN UTILITY ═══
  function addSign(text, x, y, z, opts) {
    opts = opts || {};
    const fontSize = opts.fontSize || 28, maxW = opts.maxWidth || 320;
    const c = document.createElement('canvas'); c.width = maxW; c.height = fontSize + 12;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(10,12,18,0.82)';
    const r = 4; ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(c.width - r, 0); ctx.quadraticCurveTo(c.width, 0, c.width, r);
    ctx.lineTo(c.width, c.height - r); ctx.quadraticCurveTo(c.width, c.height, c.width - r, c.height);
    ctx.lineTo(r, c.height); ctx.quadraticCurveTo(0, c.height, 0, c.height - r);
    ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.font = 'bold ' + fontSize + 'px "DM Sans",Arial,sans-serif';
    ctx.fillStyle = opts.color || 'rgba(255,255,255,0.92)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, c.width / 2, c.height / 2 + 1);
    const tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter;
    const aspect = c.width / c.height, h = opts.scale || 1.2, w = h * aspect;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    sign.position.set(x, y, z); sign.renderOrder = 999; sc.add(sign); signs.push(sign);
    if (!opts.noPost) {
      const postH = y - .1;
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, postH, 4), new THREE.MeshStandardMaterial({ color: 0x888888, roughness: .5, metalness: .6 })).translateX(x).translateY(y - postH / 2).translateZ(z));
    }
    return sign;
  }
  function addCableTag(text, x, y, z) { addSign(text, x, y + .6, z, { scale: .6, fontSize: 20, maxWidth: 240, noPost: true }); }

  // ═══ PANELS (InstancedMesh) ═══
  const totP = ROWS * PPR;
  const pGeo = new THREE.BoxGeometry(PW, PH, PD);
  const panels = new THREE.InstancedMesh(pGeo, M.pnl, totP);
  panels.castShadow = true; panels.receiveShadow = true;
  const dm = new THREE.Object3D(); let idx = 0;
  for (let r = 0; r < ROWS; r++) { const rz = Z0 + r * RS; for (let c = 0; c < PPR; c++) {
    dm.position.set(X0 + c * (PW + GAP) + PW / 2, HUB + Math.sin(TILT) * PH * .5, rz);
    dm.rotation.set(-TILT, 0, 0); dm.updateMatrix(); panels.setMatrixAt(idx++, dm.matrix);
  }}
  panels.instanceMatrix.needsUpdate = true; sc.add(panels);

  // Mid-clamps
  for (let r = 0; r < ROWS; r += 4) { const rz = Z0 + r * RS; for (let c = 5; c < PPR; c += 5) {
    const px = X0 + c * (PW + GAP) + PW / 2, py = HUB + Math.sin(TILT) * PH * .5;
    if (isFS) sc.add(new THREE.Mesh(new THREE.BoxGeometry(.05, .06, .025), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: .75, metalness: .15 })).translateX(px - PW / 2 - .005).translateY(py).translateZ(rz));
    else sc.add(new THREE.Mesh(new THREE.BoxGeometry(.035, .08, .02), M.frame).translateX(px - PW / 2 - .005).translateY(py).translateZ(rz));
  }}

  // ═══ TRACKER RACKING ═══
  for (let r = 0; r < ROWS; r++) {
    const rz = Z0 + r * RS;
    const tt = new THREE.Mesh(new THREE.CylinderGeometry(.058, .058, RL + 1.5, 8), M.galv);
    tt.rotation.z = Math.PI / 2; tt.position.set(0, HUB, rz); tt.castShadow = true; sc.add(tt);
    const pSp = 4 * (PW + GAP), nP = Math.floor(RL / pSp) + 1;
    for (let p = 0; p < nP; p++) {
      const px = X0 + p * pSp;
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.12, 4.4, .065), M.steel).translateX(px).translateY(HUB / 2 - .15).translateZ(rz));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.045, 4.15, .16), M.steel).translateX(px - .057).translateY(HUB / 2 - .15).translateZ(rz));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.045, 4.15, .16), M.steel).translateX(px + .057).translateY(HUB / 2 - .15).translateZ(rz));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.24, .08, .24), M.steel).translateX(px).translateY(HUB + .04).translateZ(rz));
      for (let b = 0; b < 4; b++) sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .012, 6), M.galv).translateX(px + ((b % 2) - .5) * .15).translateY(HUB + .085).translateZ(rz + ((Math.floor(b / 2)) - .5) * .15));
    }
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(.65, .48, .38), M.invD).translateX(0).translateY(HUB - .28).translateZ(rz));
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(.75, .06, .45), M.galv).translateX(0).translateY(HUB - .52).translateZ(rz));
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .25, 8), M.steel).translateX(0).translateY(HUB - .55).translateZ(rz).rotateX(Math.PI / 2));
    sc.add(new THREE.Mesh(new THREE.SphereGeometry(.032, 8, 8), M.led).translateX(-.22).translateY(HUB - .12).translateZ(rz - .19));
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.004, .004, .12, 4), M.steel).translateX(.25).translateY(HUB - .05).translateZ(rz - .19));
    const railGeo = new THREE.CylinderGeometry(.022, .022, RL + .6, 4);
    sc.add(new THREE.Mesh(railGeo, M.frame).translateX(0).translateY(HUB + Math.sin(TILT) * PH * .87).translateZ(rz - Math.cos(TILT) * .42).rotateZ(Math.PI / 2));
    sc.add(new THREE.Mesh(railGeo.clone(), M.frame).translateX(0).translateY(HUB - Math.sin(TILT) * PH * .08).translateZ(rz + Math.cos(TILT) * .42).rotateZ(Math.PI / 2));
    for (let cl = 0; cl < Math.floor(PPR / 4); cl++) {
      const clX = X0 + cl * 4 * (PW + GAP) + (PW + GAP) * 2;
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.06, .08, .08), M.galv).translateX(clX).translateY(HUB).translateZ(rz));
    }
  }

  // Panel & tracker labels
  const panelLabel = isFS ? 'First Solar 525W CdTe' : 'Bifacial 600W';
  addSign(panelLabel + ' Panels', 0, HUB + 3, 0, { scale: 1.8 });
  addSign('Single-Axis Trackers', X0 + RL * .4, HUB + 1.5, Z0 + ROWS * RS / 2, { scale: .9, maxWidth: 300 });
  waypoints.push({ name: 'Overview', color: '#ffffff', target: { x: 40, y: 2, z: 0 }, cam: { x: -80, y: 60, z: 100 }, overview: true });
  waypoints.push({ name: panelLabel + ' Panels', color: '#3858A0', target: { x: 0, y: HUB, z: Z0 + ROWS * RS / 2 }, cam: { x: -20, y: 12, z: Z0 + ROWS * RS / 2 + 30 } });

  // ═══ DC COLLECTION ═══
  const CE = RL / 2 + 8, DIX = X0 - 12, CIX = RL / 2 + 35;
  const wireRed = new THREE.MeshStandardMaterial({ color: 0xDD2020, roughness: .65, metalness: .08 });
  const wireBlack = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: .75, metalness: .05 });
  const cableB = new THREE.MeshStandardMaterial({ color: 0xEE6600, roughness: .55, metalness: .05 });
  const cableC = new THREE.MeshStandardMaterial({ color: 0x1560CC, roughness: .52, metalness: .08 });
  const cableD = new THREE.MeshStandardMaterial({ color: 0xCCD0D8, roughness: .15, metalness: .88 });
  const cableE = new THREE.MeshStandardMaterial({ color: 0xDDAA00, roughness: .48, metalness: .12 });
  const wireGreen = new THREE.MeshStandardMaterial({ color: 0x1a6a22, roughness: .78, metalness: .04 });
  const conduitGray = new THREE.MeshStandardMaterial({ color: 0x606060, roughness: .4, metalness: .6 });
  const mc4Mat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .55, metalness: .25 });
  const stringLen = isFS ? 6 : 28;
  const nStringsPerRow = Math.floor(PPR / stringLen);

  if (dc === 'string-homeruns') {
    for (let r = 0; r < ROWS; r++) { const rz = Z0 + r * RS;
      for (let s = 0; s < nStringsPerRow; s += 3) {
        const sx = X0 + s * (RL / nStringsPerRow) + RL / (nStringsPerRow * 2);
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.30, .18, .14), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: .45, metalness: .5 })).translateX(sx).translateY(HUB - .55).translateZ(rz + .22));
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, HUB - .7, 6), conduitGray).translateX(sx).translateY((HUB - .7) / 2 + .05).translateZ(rz + .28));
        if (inv === 'distributed') { const hrLen = sx - DIX; sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, hrLen, 6), cableB).translateX(sx - hrLen / 2).translateY(.04).translateZ(rz + .35).rotateZ(Math.PI / 2)); }
        else { const hrLen = CE - sx + 8; sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, hrLen, 6), cableB).translateX(sx + hrLen / 2).translateY(.04).translateZ(rz + .35).rotateZ(Math.PI / 2)); }
      }
      if (inv === 'distributed' && r % 4 === 0) { const tl = X0 - DIX + 15; sc.add(new THREE.Mesh(new THREE.BoxGeometry(tl, .005, .15), M.warn).translateX(DIX + tl / 2 - 5).translateY(.035).translateZ(rz + .35)); }
    }
    const hrLabelX = inv === 'distributed' ? (X0 + DIX) / 2 : CE;
    addSign('String Homeruns', hrLabelX, 2.5, 0, { scale: 1.2 });
    addCableTag('USE-2 PV Wire', X0 + RL * .3, HUB - .3, 0);
    addCableTag('PVC Conduit (Sch 40)', inv === 'distributed' ? (X0 + DIX) / 2 : (X0 + CE) / 2 + 10, .04, 8);
    waypoints.push({ name: 'String Homeruns', color: '#EE6600', target: { x: hrLabelX, y: 1, z: 0 }, cam: { x: hrLabelX - 15, y: 8, z: 22 } });
  } else if (dc === 'harnesses') {
    const cbX = CE + 8;
    for (let r = 0; r < ROWS; r++) { const rz = Z0 + r * RS;
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, RL * .94, 6), wireRed).translateX(0).translateY(HUB - .40).translateZ(rz + .24).rotateZ(Math.PI / 2));
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, RL * .94, 6), wireBlack).translateX(0).translateY(HUB - .48).translateZ(rz + .24).rotateZ(Math.PI / 2));
      const nY = Math.floor(PPR / (isFS ? 8 : 16));
      for (let y = 0; y < nY; y++) {
        const yx = X0 + RL * .05 + y * (RL * .9 / nY);
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .12, 8), mc4Mat).translateX(yx).translateY(HUB - .40).translateZ(rz + .24).rotateZ(Math.PI / 2));
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .12, 8), mc4Mat).translateX(yx).translateY(HUB - .48).translateZ(rz + .24).rotateZ(Math.PI / 2));
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .22, 4), wireRed).translateX(yx - .05).translateY(HUB - .28).translateZ(rz + .24));
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .22, 4), wireBlack).translateX(yx + .05).translateY(HUB - .28).translateZ(rz + .24));
        sc.add(new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 6), mc4Mat).translateX(yx - .05).translateY(HUB - .40).translateZ(rz + .24));
        sc.add(new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 6), mc4Mat).translateX(yx + .05).translateY(HUB - .48).translateZ(rz + .24));
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.03, .015, .12), M.steel).translateX(yx).translateY(HUB - .36).translateZ(rz + .24));
      }
      if (inv === 'distributed') {
        const termX = X0 - .5;
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.32, .22, .18), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: .45, metalness: .45 })).translateX(termX).translateY(HUB - .44).translateZ(rz + .24));
        const dropH = HUB - .25;
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, dropH, 6), wireRed).translateX(termX - .05).translateY(HUB - .44 - dropH / 2).translateZ(rz + .26));
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, dropH, 6), wireBlack).translateX(termX + .05).translateY(HUB - .44 - dropH / 2).translateZ(rz + .26));
        const runLen = Math.abs(termX - DIX);
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, runLen, 6), cableB).translateX((termX + DIX) / 2).translateY(.08).translateZ(rz + .3).rotateZ(Math.PI / 2));
      } else {
        const termX = RL / 2 + 1.5;
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.32, .22, .18), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: .45, metalness: .45 })).translateX(termX).translateY(HUB - .44).translateZ(rz + .24));
        const dropH = HUB - .25;
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, dropH, 6), wireRed).translateX(termX - .05).translateY(HUB - .44 - dropH / 2).translateZ(rz + .26));
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, dropH, 6), wireBlack).translateX(termX + .05).translateY(HUB - .44 - dropH / 2).translateZ(rz + .26));
        const runLen = cbX - termX;
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, runLen, 6), cableB).translateX(termX + runLen / 2).translateY(.08).translateZ(rz + .3).rotateZ(Math.PI / 2));
      }
    }
    if (inv !== 'distributed') {
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, ROWS * RS + 12, 8), cableB).translateX(cbX - 1.5).translateY(.2).rotateX(Math.PI / 2));
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, ROWS * RS + 12, 8), cableB).translateX(cbX - 1).translateY(.2).rotateX(Math.PI / 2));
      addCableTag('PVC N-S Trunk', cbX - 1.2, .2, 0);
    }
    const hLabelX = inv === 'distributed' ? X0 + RL * .25 : X0 + RL * .75;
    addSign('DC Harnesses', hLabelX, HUB + 1.5, 8, { scale: 1.2 });
    addCableTag('USE-2 PV Wire', X0 + RL * .3, HUB - .3, 12);
    addCableTag('PVC Conduit', inv === 'distributed' ? (X0 + DIX) / 2 : (RL / 2 + CE) / 2, .08, 16);
    waypoints.push({ name: 'DC Harnesses', color: '#EE6600', target: { x: hLabelX, y: HUB, z: 8 }, cam: { x: hLabelX - 10, y: 6, z: 26 } });
  } else if (dc === 'trunk-bus') {
    const bLen = ROWS * RS + 14, busY = 2.2;
    const busPosM = new THREE.MeshStandardMaterial({ color: 0xCC2222, roughness: .18, metalness: .82 });
    const busNegM = new THREE.MeshStandardMaterial({ color: 0x0e0e0e, roughness: .18, metalness: .78 });
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(.14, bLen, .06), busPosM).translateX(-.22).translateY(busY).rotateX(Math.PI / 2));
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(.14, bLen, .06), busNegM).translateX(.22).translateY(busY).rotateX(Math.PI / 2));
    for (let s = 0; s < Math.ceil(bLen / 5); s++) { const sz = Z0 - 5 + s * 5;
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.08, busY, .06), M.steel).translateX(-.55).translateY(busY / 2).translateZ(sz));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.08, busY, .06), M.steel).translateX(.55).translateY(busY / 2).translateZ(sz));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.3, .06, .06), M.steel).translateY(busY + .04).translateZ(sz));
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.035, .05, .18, 8), M.ceramic).translateX(-.22).translateY(busY + .14).translateZ(sz));
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.035, .05, .18, 8), M.ceramic).translateX(.22).translateY(busY + .14).translateZ(sz));
    }
    for (let r = 0; r < ROWS; r++) { const rz = Z0 + r * RS;
      const nTaps = isFS ? 6 : 3;
      for (let t = 0; t < nTaps; t++) {
        const tx = -.22 + (t % 2) * .44, tz = rz - .3 + Math.floor(t / 2) * .2;
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.01, .01, .35, 4), t % 2 === 0 ? wireRed : wireBlack).translateX(tx).translateY(busY - .18).translateZ(tz));
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .08, 6), mc4Mat).translateX(tx).translateY(busY - .38).translateZ(tz));
      }
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.55, .28, .22), new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: .5, metalness: .45 })).translateY(busY + .3).translateZ(rz));
      sc.add(new THREE.Mesh(new THREE.SphereGeometry(.02, 6, 6), M.led).translateX(.2).translateY(busY + .46).translateZ(rz - .1));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.12, .06, .01), M.warn).translateX(-.12).translateY(busY + .46).translateZ(rz - .12));
    }
    addSign('DC Trunk Bus', 0, busY + 2, 0, { scale: 1.2 });
    addCableTag('AL Bus Bars (±DC)', 0, busY + .5, 5);
    waypoints.push({ name: 'DC Trunk Bus', color: '#CC2222', target: { x: 0, y: busY, z: 0 }, cam: { x: -8, y: 6, z: 15 } });
  }

  // ═══ DC COMBINATION ═══
  const IX = CIX;
  if (comb === 'combiner-boxes') {
    const nCB = inv === 'central' ? 14 : 10, cbX = CE + 8;
    const cbBodyM = new THREE.MeshStandardMaterial({ color: 0xF2F2EE, roughness: .32, metalness: .15 });
    const cbDoorM = new THREE.MeshStandardMaterial({ color: 0xC8D0D8, roughness: .12, metalness: .15, transparent: true, opacity: .75 });
    const cbFrameM = new THREE.MeshStandardMaterial({ color: 0x9a9a98, roughness: .3, metalness: .65 });
    const breakerGreen = new THREE.MeshStandardMaterial({ color: 0x2A8A42, roughness: .45, metalness: .2 });
    const spdOrange = new THREE.MeshStandardMaterial({ color: 0xE87420, roughness: .4, metalness: .12 });
    const breakerGray = new THREE.MeshStandardMaterial({ color: 0xE0E0E0, roughness: .4, metalness: .18 });
    for (let i = 0; i < nCB; i++) { const cbZ = Z0 + 4 + (i / (nCB - 1)) * (ROWS - 2) * RS;
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.45, .12, .35), M.conc).translateX(cbX).translateY(.06).translateZ(cbZ));
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 3.4, 8), M.galv).translateX(cbX - .3).translateY(1.76).translateZ(cbZ));
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 3.4, 8), M.galv).translateX(cbX + .3).translateY(1.76).translateZ(cbZ));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.65, .04, .04), M.galv).translateX(cbX).translateY(2.9).translateZ(cbZ));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.65, .04, .04), M.galv).translateX(cbX).translateY(3.5).translateZ(cbZ));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.85, .72, .35), cbBodyM).translateX(cbX).translateY(3.2).translateZ(cbZ));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.87, .74, .02), cbFrameM).translateX(cbX).translateY(3.2).translateZ(cbZ - .19));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.78, .65, .01), cbDoorM).translateX(cbX).translateY(3.22).translateZ(cbZ - .195));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.04, .08, .02), cbFrameM).translateX(cbX + .36).translateY(3.2).translateZ(cbZ - .21));
      for (let br = 0; br < 4; br++) {
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.1, .18, .08), breakerGray).translateX(cbX - .28 + br * .15).translateY(3.3).translateZ(cbZ - .1));
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.04, .06, .02), breakerGreen).translateX(cbX - .28 + br * .15).translateY(3.35).translateZ(cbZ - .15));
      }
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.12, .2, .08), spdOrange).translateX(cbX + .12).translateY(3.3).translateZ(cbZ - .1));
      for (let ab = 0; ab < 2; ab++) {
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.08, .15, .06), breakerGray).translateX(cbX + .28 + ab * .1).translateY(3.28).translateZ(cbZ - .1));
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.03, .05, .02), breakerGreen).translateX(cbX + .28 + ab * .1).translateY(3.32).translateZ(cbZ - .15));
      }
      const glandM = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: .25, metalness: .6 });
      for (let gl = 0; gl < 5; gl++) {
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.022, .028, .06, 8), glandM).translateX(cbX - .24 + gl * .12).translateY(2.81).translateZ(cbZ));
        const wM = gl < 2 ? wireRed : gl < 4 ? wireBlack : wireGreen;
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .4, 4), wM).translateX(cbX - .24 + gl * .12).translateY(2.58).translateZ(cbZ));
      }
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.28, .08, .005), M.warn).translateX(cbX - .15).translateY(3.55).translateZ(cbZ - .2));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.12, .12, .005), new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: .5, metalness: .1 })).translateX(cbX + .25).translateY(3.55).translateZ(cbZ - .2));
      sc.add(new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 6), new THREE.MeshBasicMaterial({ color: 0x22dd44 })).translateX(cbX - .35).translateY(3.55).translateZ(cbZ - .2));
      const cbOutLen = IX - cbX - 2;
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, cbOutLen, 6), cableC).translateX(cbX + 1 + cbOutLen / 2).translateY(.15).translateZ(cbZ).rotateZ(Math.PI / 2));
    }
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, ROWS * RS + 8, 8), cableC).translateX(IX - 2).translateY(.15).rotateX(Math.PI / 2));
    const cbZmid = Z0 + 4 + ((ROWS - 2) * RS) / 2;
    if (dc === 'string-homeruns') {
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, ROWS * RS + 12, 8), cableB).translateX(cbX - 1).translateY(.12).rotateX(Math.PI / 2));
      addCableTag('PVC Trunk (DC Input)', cbX - 1, .12, cbZmid - 10);
    }
    addSign('Combiner Boxes', cbX, 5, cbZmid, { scale: 1.1 });
    addCableTag('HDPE Conduit (DC Feeder)', (cbX + IX) / 2, .15, cbZmid + 5);
    addCableTag('HDPE N-S Trunk', IX - 2, .15, cbZmid - 8);
    waypoints.push({ name: 'Combiner Boxes', color: '#F2F2EE', target: { x: cbX, y: 3, z: cbZmid }, cam: { x: cbX - 10, y: 7, z: cbZmid + 18 } });
  } else if (comb === 'lbds') {
    const nLBD = 6, lbdX = CE + 12;
    const lbdBodyM = new THREE.MeshStandardMaterial({ color: 0x90989E, roughness: .32, metalness: .45 });
    const lbdDoorM = new THREE.MeshStandardMaterial({ color: 0xB8BCC0, roughness: .15, metalness: .2, transparent: true, opacity: .7 });
    for (let i = 0; i < nLBD; i++) { const lbdZ = Z0 + 4 + (i / (nLBD - 1)) * (ROWS - 2) * RS;
      gpad(lbdX, lbdZ, 5, 4);
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 1.2), lbdBodyM).translateX(lbdX).translateY(1.2).translateZ(lbdZ));
      for (let v = 0; v < 4; v++) sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.6, .03, .01), M.steel).translateX(lbdX).translateY(2.0 + v * .08).translateZ(lbdZ - .62));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.6, .01), lbdDoorM).translateX(lbdX).translateY(1.1).translateZ(lbdZ - .61));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.06, .12, .03), M.steel).translateX(lbdX + .65).translateY(1.2).translateZ(lbdZ - .64));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.06, .12, .03), M.steel).translateX(lbdX - .65).translateY(1.2).translateZ(lbdZ - .64));
      for (let w = 0; w < 3; w++) sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.82, .05, .01), M.warn).translateX(lbdX).translateY(.25 + w * .7).translateZ(lbdZ - .615));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.08, .45, .1), new THREE.MeshStandardMaterial({ color: 0xDD0000, roughness: .35, metalness: .4 })).translateX(lbdX + .8).translateY(1.6).translateZ(lbdZ - .58));
      for (let gl = 0; gl < 6; gl++) sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.03, .04, .08, 8), new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: .25, metalness: .6 })).translateX(lbdX - .5 + gl * .2).translateY(.06).translateZ(lbdZ));
      const lbdOutLen = IX - lbdX - 2;
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, lbdOutLen, 6), cableC).translateX(lbdX + 1 + lbdOutLen / 2).translateY(.18).translateZ(lbdZ).rotateZ(Math.PI / 2));
      const lbdInLen = lbdX - .5;
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, lbdInLen, 6), cableB).translateX(.5 + lbdInLen / 2).translateY(.12).translateZ(lbdZ - .3).rotateZ(Math.PI / 2));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.4, .25, .005), new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: .5, metalness: .1 })).translateX(lbdX - .4).translateY(1.7).translateZ(lbdZ - .62));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.18, .18, .005), M.warn).translateX(lbdX + .35).translateY(1.7).translateZ(lbdZ - .62));
    }
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, ROWS * RS + 8, 8), cableC).translateX(IX - 2).translateY(.18).rotateX(Math.PI / 2));
    const lbdZmid = Z0 + 4 + ((ROWS - 2) * RS) / 2;
    addSign('Load Break Disconnects', lbdX, 4, lbdZmid, { scale: 1.1, maxWidth: 380 });
    addCableTag('HDPE Conduit (DC Feeder)', (lbdX + IX) / 2, .18, lbdZmid + 5);
    addCableTag('PVC Conduit (Input)', lbdX / 2, .12, lbdZmid - 8);
    addCableTag('HDPE N-S Trunk', IX - 2, .18, lbdZmid - 15);
    waypoints.push({ name: 'Load Break Disconnects', color: '#90989E', target: { x: lbdX, y: 2, z: lbdZmid }, cam: { x: lbdX - 10, y: 6, z: lbdZmid + 18 } });
  }

  // ═══ INVERTERS ═══
  const invGreenDark = new THREE.MeshStandardMaterial({ color: 0x1A7A68, roughness: .30, metalness: .42 });
  const invGreenLight = new THREE.MeshStandardMaterial({ color: 0x30A888, roughness: .28, metalness: .38 });
  const invSidePanel = new THREE.MeshStandardMaterial({ color: 0xDDD8CC, roughness: .40, metalness: .25 });
  const hazardTriM = new THREE.MeshStandardMaterial({ color: 0xE8C000, roughness: .3, metalness: .05 });
  const ventM = new THREE.MeshStandardMaterial({ color: 0x1E3E3C, roughness: .3, metalness: .55 });

  if (inv === 'distributed') {
    for (let r = 0; r < ROWS; r += 2) { const rz = Z0 + r * RS + RS / 2, ix = DIX;
      gpad(ix, rz, 5, 4);
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(5.2, .15, 4.2), new THREE.MeshStandardMaterial({ color: 0x888880, roughness: .85, metalness: .05 })).translateX(ix).translateY(.075).translateZ(rz));
      const standMat = new THREE.MeshStandardMaterial({ color: 0x8a9090, roughness: .35, metalness: .75 });
      for (let p = 0; p < 4; p++) { const px = ix + ((p % 2) - .5) * 1.4, pz = rz + ((Math.floor(p / 2)) - .5) * .6;
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.06, 1.6, .06), standMat).translateX(px).translateY(.85).translateZ(pz));
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.15, .02, .15), standMat).translateX(px).translateY(.12).translateZ(pz));
      }
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, .05, .05), standMat).translateX(ix).translateY(1.62).translateZ(rz - .28));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, .05, .05), standMat).translateX(ix).translateY(1.62).translateZ(rz + .28));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.0, .55), M.inv).translateX(ix).translateY(1.15).translateZ(rz));
      for (let f = 0; f < 10; f++) {
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.018, .85, .52), M.invD).translateX(ix + .58 + f * .01).translateY(1.15).translateZ(rz));
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.018, .85, .52), M.invD).translateX(ix - .58 - f * .01).translateY(1.15).translateZ(rz));
      }
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.42, .22, .005), new THREE.MeshStandardMaterial({ color: 0x0a2848, roughness: .05, metalness: .1, emissive: 0x051525, emissiveIntensity: .3 })).translateX(ix - .25).translateY(1.28).translateZ(rz - .3));
      const ledColors = [0x22dd44, 0x22dd44, 0x22dd44, 0x2288ff, 0xffaa00];
      for (let l = 0; l < 5; l++) sc.add(new THREE.Mesh(new THREE.SphereGeometry(.015, 6, 6), new THREE.MeshBasicMaterial({ color: ledColors[l] })).translateX(ix - .38 + l * .09).translateY(1.52).translateZ(rz - .295));
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .025, 12), new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: .35, metalness: .4 })).translateX(ix - .48).translateY(1.05).translateZ(rz - .31).rotateX(Math.PI / 2));
      for (let d = 0; d < Math.min(nStringsPerRow, 6); d++) { const condX = ix - .4 + d * .15;
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .45, 6), cableB).translateX(condX).translateY(.32).translateZ(rz + .15));
      }
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 3, 8), cableD).translateX(ix + 2.5).translateY(.25).translateZ(rz).rotateZ(Math.PI / 2));
    }
    for (let r = 0; r < ROWS; r += 2) { const rz = Z0 + r * RS + RS / 2;
      const acRunLen = IX - DIX - 16;
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, acRunLen, 6), cableD).translateX(DIX + 3 + acRunLen / 2).translateY(.08).translateZ(rz).rotateZ(Math.PI / 2));
    }
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, ROWS * RS + 6, 8), cableD).translateX(IX - 18).translateY(.15).rotateX(Math.PI / 2));
    addCableTag('EMT N-S AC Trunk', IX - 18, .15, 0);
    gpad(IX - 12, 0, 12, 16);
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(4, 2.8, 1.6), new THREE.MeshStandardMaterial({ color: 0x454545, roughness: .4, metalness: .55 })).translateX(IX - 12).translateY(1.5));
    for (let l = 0; l < 4; l++) sc.add(new THREE.Mesh(new THREE.SphereGeometry(.025, 6, 6), M.led).translateX(IX - 13.5 + l * .35).translateY(2.65).translateZ(-.84));
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 23, 8), cableD).translateX(IX - 6.5).translateY(.2).rotateZ(Math.PI / 2));
    gpad(IX + 5, 0, 14, 12);
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(10, .4, 8), M.conc).translateX(IX + 5).translateY(.2));
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 3.5), M.tx).translateX(IX + 5).translateY(2.0));
    for (let side = -1; side <= 1; side += 2) for (let f = 0; f < 8; f++) sc.add(new THREE.Mesh(new THREE.BoxGeometry(.06, 2.8, .08), M.txFin).translateX(IX + 7.8 + f * .18).translateY(1.8).translateZ(side * 2));
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, 3, 10), M.tx).translateX(IX + 5).translateY(4.5).rotateZ(Math.PI / 2));
    for (let b = 0; b < 3; b++) { sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .18, 2, 10), M.ceramic).translateX(IX + 4 + b).translateY(4.8).translateZ(-2.2));
      for (let sh = 0; sh < 4; sh++) sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.22, .18, .08, 12), M.ceramic).translateX(IX + 4 + b).translateY(4.0 + sh * .45).translateZ(-2.2));
    }
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, 30, 8), cableE).translateX(IX + 22).translateY(.25).rotateZ(Math.PI / 2));
    addSign('String Inverters', DIX, 3, 0, { scale: 1.1 });
    addSign('AC Recombiner', IX - 12, 4.5, 0, { scale: 1.0 });
    addSign('Step-Up Transformer', IX + 5, 5.5, 0, { scale: 1.1 });
    addCableTag('EMT Conduit (AC)', (DIX + IX - 18) / 2, .08, 10);
    addCableTag('MV XLPE 34.5kV', IX + 22, .25, 3);
    waypoints.push({ name: 'String Inverters', color: '#1A7A68', target: { x: DIX, y: 1.5, z: 0 }, cam: { x: DIX - 10, y: 5, z: 18 } });
    waypoints.push({ name: 'AC Recombiner', color: '#CCD0D8', target: { x: IX - 12, y: 2, z: 0 }, cam: { x: IX - 18, y: 6, z: 12 } });
    waypoints.push({ name: 'Step-Up Transformer', color: '#4A7248', target: { x: IX + 5, y: 2, z: 0 }, cam: { x: IX + 5, y: 6, z: 15 } });
  } else if (inv === 'centralized-cluster') {
    gpad(IX, 0, 40, 32);
    for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++) { const skidX = IX - 12 + col * 12, skidZ = -8 + row * 16;
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(7, .12, 4), new THREE.MeshStandardMaterial({ color: 0x6a6a68, roughness: .7, metalness: .5 })).translateX(skidX).translateY(.06).translateZ(skidZ));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.0, 3.5), invGreenDark).translateX(skidX).translateY(1.62).translateZ(skidZ));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.06, 2.6, 3.4), invSidePanel).translateX(skidX - 3.28).translateY(1.62).translateZ(skidZ));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.06, 2.6, 3.4), invSidePanel).translateX(skidX + 3.28).translateY(1.62).translateZ(skidZ));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.5, .06), invGreenLight).translateX(skidX - .8).translateY(1.55).translateZ(skidZ - 1.78));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.5, .06), invGreenLight).translateX(skidX + .8).translateY(1.55).translateZ(skidZ - 1.78));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.35, .35, .005), hazardTriM).translateX(skidX - .8).translateY(2.0).translateZ(skidZ - 1.82));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.35, .35, .005), hazardTriM).translateX(skidX + .8).translateY(2.0).translateZ(skidZ - 1.82));
      for (let v = 0; v < 6; v++) sc.add(new THREE.Mesh(new THREE.BoxGeometry(4, .04, .01), ventM).translateX(skidX).translateY(2.85 + v * .08).translateZ(skidZ - 1.77));
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .08, 8), M.led).translateX(skidX + 2.8).translateY(3.15).translateZ(skidZ - 1.6));
    }
    gpad(IX + 16, 0, 14, 10);
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(10, .3, 7), M.conc).translateX(IX + 16).translateY(.15));
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 3.2), M.tx).translateX(IX + 16).translateY(2.0));
    for (let f = 0; f < 10; f++) sc.add(new THREE.Mesh(new THREE.BoxGeometry(.08, 2.8, 3.22), M.txFin).translateX(IX + 18.5 + f * .2).translateY(2.0));
    for (let b = 0; b < 3; b++) sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.1, .15, 1.6, 8), M.ceramic).translateX(IX + 15 + b).translateY(4.5));
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 20, 8), cableC).translateX(IX - 12).translateY(.2).rotateZ(Math.PI / 2));
    for (let ac = 0; ac < 3; ac++) sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, 14, 6), cableD).translateX(IX + 9).translateY(.2 + ac * .18).rotateZ(Math.PI / 2));
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, 28, 8), cableE).translateX(IX + 30).translateY(.25).rotateZ(Math.PI / 2));
    addSign('Inverter Cluster', IX, 5, 0, { scale: 1.3 });
    addSign('MV Transformer', IX + 16, 5, 0, { scale: 1.1 });
    addCableTag('HDPE (DC Input)', IX - 12, .2, -6);
    addCableTag('EMT Conduit (AC)', IX + 9, .2, 4);
    addCableTag('MV XLPE 34.5kV', IX + 30, .25, 3);
    waypoints.push({ name: 'Inverter Cluster', color: '#1A7A68', target: { x: IX, y: 2, z: 0 }, cam: { x: IX - 20, y: 10, z: 25 } });
    waypoints.push({ name: 'MV Transformer', color: '#4A7248', target: { x: IX + 16, y: 2, z: 0 }, cam: { x: IX + 16, y: 6, z: 14 } });
  } else if (inv === 'central') {
    gpad(IX, 0, 36, 26);
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(24, .25, 14), M.conc).translateX(IX).translateY(.12));
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(22, 5.5, 12), invGreenDark).translateX(IX).translateY(2.88));
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(.08, 5.0, 11.5), invSidePanel).translateX(IX - 11.05).translateY(2.88));
    for (let d = 0; d < 3; d++) { const dx = IX - 7 + d * 7;
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(2.8, 4.2, .06), invGreenLight).translateX(dx).translateY(2.2).translateZ(-6.04));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .005), hazardTriM).translateX(dx - .6).translateY(3.0).translateZ(-6.08));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .005), hazardTriM).translateX(dx + .6).translateY(3.0).translateZ(-6.08));
    }
    for (let v = 0; v < 8; v++) sc.add(new THREE.Mesh(new THREE.BoxGeometry(18, .05, .01), ventM).translateX(IX).translateY(4.8 + v * .1).translateZ(-6.03));
    for (let c = 0; c < 6; c++) {
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 2.8), new THREE.MeshStandardMaterial({ color: 0x3a4a48, roughness: .35, metalness: .5 })).translateX(IX - 8 + c * 3.2).translateY(6.3));
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.95, .95, .12, 16), new THREE.MeshStandardMaterial({ color: 0x4a5a58, roughness: .3, metalness: .55 })).translateX(IX - 8 + c * 3.2).translateY(7.05));
    }
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(6, 5, 5), M.bldg).translateX(IX + 14).translateY(2.6));
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, 20, 8), cableC).translateX(IX - 12).translateY(.25).rotateZ(Math.PI / 2));
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, 40, 8), cableE).translateX(IX + 34).translateY(.25).rotateZ(Math.PI / 2));
    addSign('Central Inverter', IX, 8, 0, { scale: 1.4 });
    addSign('MV Switchgear', IX + 14, 5.5, 0, { scale: 1.0 });
    addCableTag('HDPE (DC Input)', IX - 12, .25, -6);
    addCableTag('MV XLPE 34.5kV', IX + 34, .25, 3);
    waypoints.push({ name: 'Central Inverter', color: '#1A7A68', target: { x: IX, y: 3, z: 0 }, cam: { x: IX - 25, y: 12, z: 25 } });
    waypoints.push({ name: 'MV Switchgear', color: '#C5BDB0', target: { x: IX + 14, y: 3, z: 0 }, cam: { x: IX + 14, y: 6, z: 12 } });
  }

  // ═══ SUBSTATION ═══
  const SX = IX + 55, SZ = -35;
  const subGravelTex = csTexMkGravel(); subGravelTex.repeat.set(6, 5);
  sc.add(new THREE.Mesh(new THREE.PlaneGeometry(52, 46), new THREE.MeshStandardMaterial({ map: subGravelTex, roughness: .92, metalness: 0 })).translateX(SX).translateY(.06).translateZ(SZ).rotateX(-Math.PI / 2));
  // Substation fence
  const fenceM2 = new THREE.MeshStandardMaterial({ color: 0x909090, roughness: .45, metalness: .7 });
  const fenceWire2 = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: .5, metalness: .5, transparent: true, opacity: .3 });
  for (let side = 0; side < 4; side++) {
    const isX = side < 2; const sign2 = side % 2 === 0 ? -1 : 1;
    const len = isX ? 46 : 52; const count = Math.floor(len / 4);
    for (let p = 0; p <= count; p++) {
      const frac = p / count - .5;
      const fx = isX ? SX + sign2 * 26 : SX + frac * 52;
      const fz = isX ? SZ + frac * 46 : SZ + sign2 * 23;
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, 3, 6), fenceM2).translateX(fx).translateY(1.5).translateZ(fz));
      sc.add(new THREE.Mesh(new THREE.SphereGeometry(.06, 6, 6), fenceM2).translateX(fx).translateY(3.05).translateZ(fz));
    }
    const rx = isX ? SX + sign2 * 26 : SX, rz2 = isX ? SZ : SZ + sign2 * 23;
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, len, 6), fenceM2).translateX(rx).translateY(2.9).translateZ(rz2).rotateZ(isX ? 0 : Math.PI / 2).rotateY(isX ? Math.PI / 2 : 0));
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, len, 6), fenceM2).translateX(rx).translateY(.4).translateZ(rz2).rotateZ(isX ? 0 : Math.PI / 2).rotateY(isX ? Math.PI / 2 : 0));
    sc.add(new THREE.Mesh(new THREE.PlaneGeometry(len, 2.5), fenceWire2).translateX(rx).translateY(1.65).translateZ(rz2).rotateY(isX ? 0 : Math.PI / 2));
  }
  // Main transformer
  const txPadW = 18, txPadD = 14, txW = 8, txH = 7, txD = 5.5;
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(txPadW, .35, txPadD), M.conc).translateX(SX).translateY(.17).translateZ(SZ));
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(txW, txH, txD), M.tx).translateX(SX).translateY(txH / 2 + .35).translateZ(SZ));
  // Radiators
  const radM = new THREE.MeshStandardMaterial({ color: 0x505850, roughness: .42, metalness: .6 });
  for (let side3 = -1; side3 <= 1; side3 += 2) {
    const radZ = SZ + side3 * (txD / 2 + 1.2);
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, txW - 1, 8), radM).translateX(SX).translateY(txH - .2).translateZ(radZ).rotateZ(Math.PI / 2));
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, txW - 1, 8), radM).translateX(SX).translateY(1.2).translateZ(radZ).rotateZ(Math.PI / 2));
    for (let fin = 0; fin < 22; fin++) { const fx2 = SX - txW / 2 + .8 + fin * ((txW - 1.6) / 21);
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.03, txH - 2.2, 1.8), radM).translateX(fx2).translateY(txH / 2 + .1).translateZ(radZ));
    }
  }
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, 5, 12), M.tx).translateX(SX).translateY(txH + 1.2).translateZ(SZ).rotateZ(Math.PI / 2));
  // HV Bushings
  const bushM = new THREE.MeshStandardMaterial({ color: 0xE0D8CC, roughness: .28, metalness: .08 });
  for (let b = 0; b < 3; b++) { const bx = SX - 2 + b * 2, bushBase = txH + .35;
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.14, .2, 4.5, 12), bushM).translateX(bx).translateY(bushBase + 2.5).translateZ(SZ - txD / 2 - .5));
    for (let s = 0; s < 9; s++) { const skirtR = .38 - .015 * s;
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(skirtR, skirtR - .04, .1, 12), bushM).translateX(bx).translateY(bushBase + .5 + s * .5).translateZ(SZ - txD / 2 - .5));
    }
  }
  // Bus structures
  const busColors = [0xCC2222, 0xDDAA00, 0x2266CC];
  for (let sup = 0; sup < 4; sup++) { const supX = SX - 12 + sup * 6.5;
    for (let col2 = -1; col2 <= 1; col2 += 2) { const cx = supX + col2 * .9;
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, 12, 6), M.galv).translateX(cx).translateY(6).translateZ(SZ - 9));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.4, .08, .4), M.steel).translateX(cx).translateY(.08).translateZ(SZ - 9));
    }
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, .15, .12), M.galv).translateX(supX).translateY(11.5).translateZ(SZ - 9));
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, .15, .12), M.galv).translateX(supX).translateY(10).translateZ(SZ - 9));
  }
  for (let phase = 0; phase < 3; phase++) { const busY2 = 10.8 + phase, busZ2 = SZ - 9 - phase * .3;
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 22, 8), new THREE.MeshStandardMaterial({ color: busColors[phase], roughness: .22, metalness: .82 })).translateX(SX - 1).translateY(busY2).translateZ(busZ2).rotateZ(Math.PI / 2));
  }
  // Control house
  const chX = SX - 16, chZ = SZ + 2;
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(8, 4, 5.5), new THREE.MeshStandardMaterial({ color: 0xC5BDB0, roughness: .85, metalness: .02 })).translateX(chX).translateY(2.25).translateZ(chZ));
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(8.8, .12, 6.2), new THREE.MeshStandardMaterial({ color: 0x5A5A5A, roughness: .35, metalness: .72 })).translateX(chX).translateY(4.3).translateZ(chZ));
  // Circuit breakers
  for (let cb = 0; cb < 2; cb++) { const cbX2 = SX - 5 + cb * 10, cbZ2 = SZ + 14;
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 1.5), new THREE.MeshStandardMaterial({ color: 0x505855, roughness: .45, metalness: .5 })).translateX(cbX2).translateY(1.45).translateZ(cbZ2));
    for (let bp = 0; bp < 3; bp++) sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.08, .12, 1.8, 8), bushM).translateX(cbX2 - .7 + bp * .7).translateY(3.4).translateZ(cbZ2));
  }
  // Transmission towers
  for (let tower = 0; tower < 3; tower++) { const tX = SX + 22 + tower * 28;
    for (let leg = 0; leg < 4; leg++) { const lx = tX + ((leg % 2) - .5) * 1.8, lz = SZ + ((Math.floor(leg / 2)) - .5) * 1.8;
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.06, .14, 24, 6), M.galv).translateX(lx).translateY(12).translateZ(lz));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.6, .3, .6), M.conc).translateX(lx).translateY(.15).translateZ(lz));
    }
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(16, .2, .25), M.galv).translateX(tX).translateY(22).translateZ(SZ));
    for (let ext = -1; ext <= 1; ext++) { sc.add(new THREE.Mesh(new THREE.BoxGeometry(.15, 2.2, .15), M.galv).translateX(tX + ext * 6).translateY(23).translateZ(SZ));
      for (let disc = 0; disc < 8; disc++) sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .1, .1, 8), bushM).translateX(tX + ext * 6).translateY(21.2 - disc * .18).translateZ(SZ));
    }
    if (tower < 2) for (let cond = 0; cond < 3; cond++) sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 28, 4), new THREE.MeshStandardMaterial({ color: 0x444444, roughness: .4, metalness: .6 })).translateX(tX + 14).translateY(20 - .1 * cond).translateZ(SZ - 6 + cond * 6).rotateZ(Math.PI / 2));
  }
  // AC trench to substation
  const acLinkZ = Math.abs(SZ + 20);
  for (let cab = 0; cab < 3; cab++) sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, acLinkZ, 6), cableE).translateX(IX + 35).translateY(.08).translateZ((SZ + 20) / 2 + cab * .15).rotateX(Math.PI / 2));
  const acTL = SX - IX - 20;
  for (let cab = 0; cab < 3; cab++) sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, acTL, 6), cableE).translateX(IX + 10 + acTL / 2).translateY(.08).translateZ(SZ + 19.4 + cab * .3).rotateZ(Math.PI / 2));

  // Substation labels
  addSign('Substation (34.5 kV)', SX, 14, SZ, { scale: 1.6 });
  addSign('Main Power Transformer', SX, txH + 6, SZ - txD / 2 - 2, { scale: .85 });
  addSign('Control House', chX, 6, chZ, { scale: .8 });
  addSign('Transmission Line (138 kV)', SX + 50, 26, SZ, { scale: 1.2, maxWidth: 380 });
  addCableTag('MV Cable Trench (34.5 kV)', IX + 35, .08, (SZ + 20) / 2);
  waypoints.push({ name: 'Substation', color: '#DDAA00', target: { x: SX, y: 4, z: SZ }, cam: { x: SX - 25, y: 18, z: SZ + 30 } });
  waypoints.push({ name: 'Main Transformer', color: '#4A7248', target: { x: SX, y: 4, z: SZ }, cam: { x: SX - 10, y: 8, z: SZ + 12 } });
  waypoints.push({ name: 'Transmission Towers', color: '#888888', target: { x: SX + 50, y: 12, z: SZ }, cam: { x: SX + 40, y: 20, z: SZ + 35 } });

  // ═══ SITE INFRASTRUCTURE ═══
  const F = { x1: X0 - 22, x2: SX + 75, z1: Z0 - 22, z2: -Z0 + 22 };
  // Roads
  const rdT = csTexMkGravel(); rdT.repeat.set(1, 15);
  sc.add(new THREE.Mesh(new THREE.PlaneGeometry(5, F.z2 - F.z1 + 30), new THREE.MeshStandardMaterial({ map: rdT, roughness: .8, metalness: 0 })).translateX(F.x1 - 5).translateY(.07).rotateX(-Math.PI / 2));
  const rdT2 = csTexMkGravel(); rdT2.repeat.set(15, 1);
  sc.add(new THREE.Mesh(new THREE.PlaneGeometry(F.x2 - F.x1 - 10, 4), new THREE.MeshStandardMaterial({ map: rdT2, roughness: .8, metalness: 0 })).translateX((F.x1 + F.x2) / 2).translateY(.06).translateZ(F.z2 - 6).rotateX(-Math.PI / 2));
  // O&M Building
  const omX = F.x1 + 12, omZ = F.z2 - 10; gpad(omX, omZ, 16, 12);
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(12, 3.8, 8), M.bldg).translateX(omX).translateY(1.9).translateZ(omZ));
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(12.4, .2, 8.4), M.roof).translateX(omX).translateY(3.9).translateZ(omZ));
  addSign('O&M Building', omX, 5.5, omZ, { scale: .9 });
  waypoints.push({ name: 'O&M Building', color: '#C5BDB0', target: { x: omX, y: 2, z: omZ }, cam: { x: omX - 12, y: 6, z: omZ + 15 } });
  // Perimeter fencing
  const fenceH = 2.4;
  for (let fx = F.x1; fx <= F.x2; fx += 3) { sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, fenceH, 6), M.fP).translateX(fx).translateY(fenceH / 2).translateZ(F.z1)); if (fx < F.x2) sc.add(new THREE.Mesh(new THREE.PlaneGeometry(3, fenceH), M.fence).translateX(fx + 1.5).translateY(fenceH / 2).translateZ(F.z1)); }
  for (let fx = F.x1; fx <= F.x2; fx += 3) { sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, fenceH, 6), M.fP).translateX(fx).translateY(fenceH / 2).translateZ(F.z2)); if (fx < F.x2) sc.add(new THREE.Mesh(new THREE.PlaneGeometry(3, fenceH), M.fence).translateX(fx + 1.5).translateY(fenceH / 2).translateZ(F.z2)); }
  for (let fz = F.z1; fz <= F.z2; fz += 3) { sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, fenceH, 6), M.fP).translateX(F.x1).translateY(fenceH / 2).translateZ(fz)); if (fz < F.z2) sc.add(new THREE.Mesh(new THREE.PlaneGeometry(3, fenceH), M.fence).translateX(F.x1).translateY(fenceH / 2).translateZ(fz + 1.5).rotateY(Math.PI / 2)); }
  for (let fz = F.z1; fz <= F.z2; fz += 3) { sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, fenceH, 6), M.fP).translateX(F.x2).translateY(fenceH / 2).translateZ(fz)); if (fz < F.z2) sc.add(new THREE.Mesh(new THREE.PlaneGeometry(3, fenceH), M.fence).translateX(F.x2).translateY(fenceH / 2).translateZ(fz + 1.5).rotateY(-Math.PI / 2)); }
  // Barbed wire
  const bwMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: .6, metalness: .7 });
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, F.x2 - F.x1, 3), bwMat).translateX((F.x1 + F.x2) / 2).translateY(fenceH + .1).translateZ(F.z1).rotateZ(Math.PI / 2));
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, F.x2 - F.x1, 3), bwMat).translateX((F.x1 + F.x2) / 2).translateY(fenceH + .1).translateZ(F.z2).rotateZ(Math.PI / 2));
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, F.z2 - F.z1, 3), bwMat).translateX(F.x1).translateY(fenceH + .1).translateZ((F.z1 + F.z2) / 2).rotateX(Math.PI / 2));
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, F.z2 - F.z1, 3), bwMat).translateX(F.x2).translateY(fenceH + .1).translateZ((F.z1 + F.z2) / 2).rotateX(Math.PI / 2));
  // Main gate
  const gateX = (F.x1 + F.x2) / 2;
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 3, 8), M.fP).translateX(gateX - 3).translateY(1.5).translateZ(F.z2));
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 3, 8), M.fP).translateX(gateX + 3).translateY(1.5).translateZ(F.z2));
  addSign('Main Gate', gateX, 3.5, F.z2, { scale: .7 });
  addSign('Perimeter Road', F.x1 - 5, 2.5, 0, { scale: .7, maxWidth: 240 });
  // Site lighting
  const lightPoles = [{ x: F.x1 + 15, z: F.z2 - 10 }, { x: F.x2 - 15, z: F.z2 - 10 }, { x: F.x1 + 15, z: F.z1 + 10 }, { x: F.x2 - 15, z: F.z1 + 10 }, { x: gateX, z: F.z2 + 5 }];
  lightPoles.forEach(lp => {
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, 8, 8), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: .4, metalness: .6 })).translateX(lp.x).translateY(4).translateZ(lp.z));
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(.4, .15, .25), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .3, metalness: .5 })).translateX(lp.x).translateY(7.9).translateZ(lp.z));
  });
  // Vegetation
  function makePine(x, z, s) {
    const th = 4 * s; sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.08 * s, .12 * s, th, 6), M.bark).translateX(x).translateY(th / 2).translateZ(z));
    for (let l = 0; l < 3; l++) sc.add(new THREE.Mesh(new THREE.ConeGeometry((.5 - l * .12) * s, .8 * s, 8), M.canopy).translateX(x).translateY(th + .3 + l * .6 * s).translateZ(z));
  }
  function makeBush(x, z, s) { const b = new THREE.Mesh(new THREE.SphereGeometry(.3 * s, 6, 5), M.bush); b.position.set(x, .2 * s, z); b.scale.y = .7; sc.add(b); }
  for (let tx = F.x1 + 8; tx < F.x2 - 8; tx += 12 + R() * 6) { if (Math.abs(tx - gateX) < 15) continue; makePine(tx, F.z1 - 2, .8 + R() * .4); makePine(tx, F.z2 + 2, .8 + R() * .4); }
  for (let tz = F.z1 + 8; tz < F.z2 - 8; tz += 12 + R() * 6) { makePine(F.x1 - 2, tz, .8 + R() * .4); makePine(F.x2 + 2, tz, .8 + R() * .4); }
  for (let vp = 0; vp < 25; vp++) { const vx = F.x1 + R() * (F.x2 - F.x1), vz = F.z1 + R() * (F.z2 - F.z1); if (vx > X0 - 5 && vx < RL / 2 + 5 && vz > Z0 - 5 && vz < -Z0 + 5) continue; makeBush(vx, vz, .4 + R() * .3); }
  // Rocks
  for (let rk = 0; rk < 40; rk++) { const rx = F.x1 + R() * (F.x2 - F.x1), rz3 = F.z1 + R() * (F.z2 - F.z1); if (rx > X0 - 5 && rx < RL / 2 + 5 && rz3 > Z0 - 5 && rz3 < -Z0 + 5) continue;
    const rs = .1 + R() * .25; const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rs, 0), new THREE.MeshStandardMaterial({ color: 0x6a6560, roughness: .95, metalness: 0 }));
    rock.position.set(rx, rs * .5, rz3); rock.rotation.set(R() * Math.PI, R() * Math.PI, R() * Math.PI); sc.add(rock);
  }
  // Row markers
  for (let r = 0; r < ROWS; r++) { const rz = Z0 + r * RS; sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1.5, 6), M.warn).translateX(X0 - 3).translateY(.75).translateZ(rz)); }

  return { signs, waypoints };
}
