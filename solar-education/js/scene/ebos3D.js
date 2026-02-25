// EBOS Site Designer - 3D Scene Builder
// Converted from hsat-site-designer (1).jsx build3D()

import { makeBifacialTex, makeFirstSolarTex, makeGndTex } from './ebosTextures.js';
import { EBOS_MOD } from '../data/ebosConfigs.js';

export function ebosCreateLabel(text, bg, scale) {
  const c = document.createElement("canvas");
  const x = c.getContext("2d");
  x.font = "bold 48px Arial";
  const tw = x.measureText(text).width;
  c.width = tw + 40; c.height = 72;
  x.fillStyle = bg;
  const r = 12, w = c.width, h = c.height;
  x.beginPath(); x.moveTo(r, 0); x.lineTo(w - r, 0);
  x.quadraticCurveTo(w, 0, w, r); x.lineTo(w, h - r);
  x.quadraticCurveTo(w, h, w - r, h); x.lineTo(r, h);
  x.quadraticCurveTo(0, h, 0, h - r); x.lineTo(0, r);
  x.quadraticCurveTo(0, 0, r, 0); x.fill();
  x.fillStyle = "#fff"; x.font = "bold 48px Arial";
  x.textAlign = "center"; x.textBaseline = "middle";
  x.fillText(text, w / 2, h / 2);
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter;
  const m = new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false });
  const s = new THREE.Sprite(m);
  s.scale.set((c.width / c.height) * scale * 2, scale * 2, 1);
  return s;
}

export function ebosBuild3D(scene, layout, config) {
  while (scene.children.length > 0) scene.remove(scene.children[0]);
  const ms = EBOS_MOD[config.module], tubeH = 2.1, cx = layout.bounds.w / 2, cz = layout.bounds.h / 2;

  // Sky
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, uniforms: {},
    vertexShader: "varying vec3 vP;void main(){vP=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.0);}",
    fragmentShader: "varying vec3 vP;void main(){float h=normalize(vP).y;vec3 t=vec3(0.52,0.68,0.88);vec3 ho=vec3(0.82,0.86,0.90);vec3 g=vec3(0.45,0.48,0.32);vec3 c=h>0.0?mix(ho,t,pow(h,0.35)):mix(ho,g,pow(-h,0.6));gl_FragColor=vec4(c,1.0);}"
  })));

  // Lights
  scene.add(new THREE.AmbientLight(0xd0dce8, 0.5));
  scene.add(new THREE.HemisphereLight(0x9bbce0, 0x6a7a4a, 0.4));
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.5);
  sun.position.set(50, 70, 25); sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  const sc = Math.max(layout.bounds.w, layout.bounds.h) * 0.7;
  sun.shadow.camera.left = -sc; sun.shadow.camera.right = sc;
  sun.shadow.camera.top = sc; sun.shadow.camera.bottom = -sc;
  sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 400;
  sun.shadow.bias = -0.0003; scene.add(sun);
  const fill = new THREE.DirectionalLight(0xb0c8e0, 0.35);
  fill.position.set(-30, 25, -15); scene.add(fill);

  // Ground
  const gS = Math.max(layout.bounds.w, layout.bounds.h) * 3 + 200;
  const gT = makeGndTex(); gT.repeat.set(gS / 12, gS / 12);
  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(gS, gS),
    new THREE.MeshStandardMaterial({ map: gT, roughness: 0.92 }));
  gnd.rotation.x = -Math.PI / 2; gnd.position.y = -0.01;
  gnd.receiveShadow = true; scene.add(gnd);

  // Shared materials
  const stl = new THREE.MeshStandardMaterial({ color: 0xa5a5a5, metalness: 0.65, roughness: 0.25 });
  const stlDk = new THREE.MeshStandardMaterial({ color: 0x707070, metalness: 0.6, roughness: 0.3 });
  const bolt = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.9, roughness: 0.15 });
  const orgM = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 0.1, metalness: 0.3, roughness: 0.5 });
  const mtrM = new THREE.MeshStandardMaterial({ color: 0x1a3a8a, metalness: 0.45, roughness: 0.35 });
  const conc = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.9 });
  const isBifacial = config.module === "bifacial";
  const cTex = isBifacial ? makeBifacialTex() : makeFirstSolarTex();
  const pnlM = isBifacial
    ? new THREE.MeshStandardMaterial({ map: cTex, metalness: 0.15, roughness: 0.08 })
    : new THREE.MeshStandardMaterial({ map: cTex, color: 0x111111, metalness: 0.05, roughness: 0.25 });
  const glsM = isBifacial
    ? new THREE.MeshStandardMaterial({ color: 0x88aacc, metalness: 0.2, roughness: 0.02, transparent: true, opacity: 0.1 })
    : new THREE.MeshStandardMaterial({ color: 0x111115, metalness: 0.3, roughness: 0.05, transparent: true, opacity: 0.15 });
  const frmM = isBifacial
    ? new THREE.MeshStandardMaterial({ color: 0xd0d4d8, metalness: 0.8, roughness: 0.15 })
    : new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.5, roughness: 0.3 });
  const invM = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.4, roughness: 0.5 });
  const redC = new THREE.MeshStandardMaterial({ color: 0xff2200, roughness: 0.4, emissive: 0xff0000, emissiveIntensity: 0.3 });
  const bluC = new THREE.MeshStandardMaterial({ color: 0x2244aa, roughness: 0.5, emissive: 0x1133aa, emissiveIntensity: 0.2 });
  const jncM = new THREE.MeshStandardMaterial({ color: 0xffdd00, roughness: 0.3, emissive: 0xffaa00, emissiveIntensity: 0.3 });
  const tR = 0.12;

  // Shared geos
  const mw = ms.w, mh = ms.h;
  const pGeo = new THREE.BoxGeometry(mh, 0.06, mw);
  const gGeo = new THREE.BoxGeometry(mh - 0.02, 0.003, mw - 0.02);

  // Build rows
  layout.rows.forEach(row => {
    const rx = row.x - cx, rz = row.y - cz;
    const g = new THREE.Group();

    // Torque tube
    const tt = new THREE.Mesh(new THREE.CylinderGeometry(tR, tR, row.len + 0.5, 12), stl);
    tt.rotation.z = Math.PI / 2; tt.position.set(row.len / 2, tubeH, 0);
    tt.castShadow = true; g.add(tt);

    // Purlins
    const rOff = mw * 0.35;
    [-rOff, 0, rOff].forEach(zo => {
      const rl = new THREE.Mesh(new THREE.BoxGeometry(row.len + 1, 0.05, 0.06), stl);
      rl.position.set(row.len / 2, tubeH + tR + 0.05, zo); rl.castShadow = true; g.add(rl);
    });

    // Posts
    const pStp = row.len / (row.posts - 1);
    for (let p = 0; p < row.posts; p++) {
      const px = p * pStp; const isDr = p === row.driveIdx; const pH = tubeH - 0.1;
      const isArr = p % 2 === 0;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, pH, 0.08), stl);
      post.position.set(px, pH / 2, 0); post.castShadow = true; g.add(post);

      if (isArr) {
        const clmp = new THREE.Mesh(new THREE.CylinderGeometry(tR + 0.03, tR + 0.03, 0.08, 8), stlDk);
        clmp.rotation.z = Math.PI / 2; clmp.position.set(px, tubeH, 0); g.add(clmp);
        const fanR = 0.22; const shape = new THREE.Shape();
        shape.moveTo(0, -fanR); shape.lineTo(0, fanR); shape.absarc(0, 0, fanR, Math.PI / 2, -Math.PI / 2, true);
        const fan = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: false }), stl);
        fan.rotation.x = Math.PI / 2; fan.position.set(px, tubeH, 0); g.add(fan);
      } else {
        const nbx = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.1), stlDk);
        nbx.position.set(px, tubeH, 0); g.add(nbx);
        const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.015, 10), orgM);
        badge.rotation.x = Math.PI / 2; badge.position.set(px, tubeH - 0.03, 0.07); g.add(badge);
      }

      // String inverter for distributed
      if (config.inverter === "distributed" && p % 4 === 1) {
        const invY = tubeH * 0.42;
        const ib = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.4), invM);
        ib.position.set(px, invY, 0.22); ib.castShadow = true; g.add(ib);
        [0x00ff00, 0x00ff00, 0xffaa00].forEach((lc, li) => {
          const led = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6),
            new THREE.MeshStandardMaterial({ color: lc, emissive: lc, emissiveIntensity: 1.0 }));
          led.position.set(px, invY + 0.08 - li * 0.05, 0.3); g.add(led);
        });
        const rc = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), redC);
        rc.position.set(px, invY + 0.35, 0.2); g.add(rc);
        const bc = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), bluC);
        bc.position.set(px, invY + 0.35, 0.18); g.add(bc);
      }

      // Drive motor
      if (isDr) {
        const mc = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.18, 8), mtrM);
        mc.rotation.z = Math.PI / 2; mc.position.set(px, tubeH + 0.1, 0); mc.castShadow = true; g.add(mc);
        const mbx = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), mtrM);
        mbx.position.set(px + 0.14, tubeH + 0.1, 0); g.add(mbx);
      }
    }

    // Solar panels
    for (let m = 0; m < row.mods; m++) {
      const mx = m * (mh + 0.02) + mh / 2;
      const pn = new THREE.Mesh(pGeo, pnlM);
      pn.position.set(mx, tubeH + tR + 0.08, 0); pn.castShadow = true; pn.receiveShadow = true; g.add(pn);
      const gl = new THREE.Mesh(gGeo, glsM);
      gl.position.set(mx, tubeH + tR + 0.113, 0); g.add(gl);
      const ft = 0.03;
      [-1, 1].forEach(dx => {
        const e = new THREE.Mesh(new THREE.BoxGeometry(ft, 0.065, mw + ft * 2), frmM);
        e.position.set(mx + dx * (mh / 2 + ft / 2), tubeH + tR + 0.08, 0); g.add(e);
      });
      [-1, 1].forEach(dz => {
        const e = new THREE.Mesh(new THREE.BoxGeometry(mh + ft * 2, 0.065, ft), frmM);
        e.position.set(mx, tubeH + tR + 0.08, dz * (mw / 2 + ft / 2)); g.add(e);
      });
      if (m % 4 === 0) {
        const jb = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.15), jncM);
        jb.position.set(mx, tubeH + tR + 0.04, 0); g.add(jb);
      }
    }

    g.position.set(rx, 0, rz); scene.add(g);
  });

  // Equipment
  const eqI = {
    combiner: { c: 0xcc2222, l: "COMBINER", h: 1, w: 0.8, d: 0.6 },
    "lbd": { c: 0xe08020, l: "LBD", h: 1, w: 0.8, d: 0.6 },
    "str-inv": { c: 0x00bb55, l: "STRING INV", h: 1.5, w: 1.2, d: 0.6 },
    "clust-inv": { c: 0xccbb00, l: "CLUSTER INV", h: 2, w: 2.5, d: 1.5 },
    "cent-inv": { c: 0x3366cc, l: "CENTRAL INV", h: 3, w: 4, d: 2.5 },
    "mv-xfmr": { c: 0x8855cc, l: "MV XFMR", h: 2.2, w: 2.5, d: 1.8 },
    substation: { c: 0x5522aa, l: "SUBSTATION", h: 4.5, w: 7, d: 5 }
  };

  layout.equip.forEach(eq => {
    const ex = eq.x - cx, ez = eq.y - cz, info = eqI[eq.t];
    if (!info) return;
    const mat = new THREE.MeshStandardMaterial({ color: info.c, roughness: 0.5, metalness: 0.3 });
    const big = ["clust-inv", "cent-inv", "mv-xfmr", "substation"].includes(eq.t);
    if (big) {
      const pd = new THREE.Mesh(new THREE.BoxGeometry(info.w + 1.5, 0.18, info.d + 1.5), conc);
      pd.position.set(ex, 0.09, ez); pd.receiveShadow = true; scene.add(pd);
    }
    const bx = new THREE.Mesh(new THREE.BoxGeometry(info.w, info.h, info.d), mat);
    bx.position.set(ex, (big ? 0.18 : 0) + info.h / 2, ez); bx.castShadow = true; scene.add(bx);
    const ed = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(info.w, info.h, info.d)),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 }));
    ed.position.copy(bx.position); scene.add(ed);

    if (eq.t === "substation") {
      const fm = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.5, roughness: 0.3 });
      for (let fx = -(info.w / 2 + 1.5); fx <= info.w / 2 + 1.5; fx += 1.2)
        [-1, 1].forEach(fz => {
          const fp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 3, 0.05), fm);
          fp.position.set(ex + fx, 1.5, ez + fz * (info.d / 2 + 1.2)); scene.add(fp);
        });
    }

    const cc = info.c;
    const lb = ebosCreateLabel(info.l, "rgba(" + (cc >> 16 & 0xff) + "," + (cc >> 8 & 0xff) + "," + (cc & 0xff) + ",0.85)",
      eq.t === "substation" ? 2.5 : big ? 1.8 : 1);
    lb.position.set(ex, info.h + (big ? 1.5 : 0.8), ez); scene.add(lb);
  });

  // Cables
  layout.dcR.forEach(r => {
    const c = r.t === "trunk" ? 0xff9100 : r.t === "homerun" ? 0x607080 : 0xff4444;
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(r.x1 - cx, .04, r.y1 - cz),
        new THREE.Vector3(r.x2 - cx, .04, r.y2 - cz)
      ]),
      new THREE.LineBasicMaterial({ color: c })));
  });
  layout.acR.forEach(r => scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(r.x1 - cx, .06, r.y1 - cz),
      new THREE.Vector3(r.x2 - cx, .06, r.y2 - cz)
    ]),
    new THREE.LineBasicMaterial({ color: 0x00cc66 }))));
  layout.mvR.forEach(r => scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(r.x1 - cx, .05, r.y1 - cz),
      new THREE.Vector3(r.x2 - cx, .05, r.y2 - cz)
    ]),
    new THREE.LineBasicMaterial({ color: 0x9955ee }))));

  // Roads
  const rdM = new THREE.MeshStandardMaterial({ color: 0x6a6a55, roughness: 0.85 });
  layout.roads.forEach(r => {
    [{ x: r.x + r.w / 2, z: r.y, w: r.w + 2, d: 1.8 },
    { x: r.x + r.w / 2, z: r.y + r.h, w: r.w + 2, d: 1.8 },
    { x: r.x, z: r.y + r.h / 2, w: 1.8, d: r.h },
    { x: r.x + r.w, z: r.y + r.h / 2, w: 1.8, d: r.h }
    ].forEach(rd => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(rd.w, .03, rd.d), rdM);
      m.position.set(rd.x - cx, .015, rd.z - cz); m.receiveShadow = true; scene.add(m);
    });
  });

  // Block labels
  new Set(layout.rows.map(r => r.block)).forEach(bi => {
    const bR = layout.rows.filter(r => r.block === bi);
    const l = ebosCreateLabel("BLOCK " + (bi + 1), "rgba(0,180,220,0.7)", 2);
    l.position.set(
      (Math.min(...bR.map(r => r.x)) + Math.max(...bR.map(r => r.x + r.len))) / 2 - cx, 8,
      (Math.min(...bR.map(r => r.y)) + Math.max(...bR.map(r => r.y))) / 2 - cz);
    scene.add(l);
  });

  // Compass
  const cg = new THREE.Group();
  const cArr = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.5, 2, 4),
    new THREE.MeshStandardMaterial({ color: 0xff3333 }));
  cArr.rotation.x = -Math.PI / 2; cArr.position.z = -1; cg.add(cArr);
  const nL = ebosCreateLabel("N", "#ff3333", 1.2);
  nL.position.set(0, 0.5, -2.5); cg.add(nL);
  cg.position.set(-cx - 8, 3, -cz - 8); scene.add(cg);
}
