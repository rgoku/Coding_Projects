// EBOS Site Designer - Texture generators
// Converted from hsat-site-designer (1).jsx

export function makeBifacialTex() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 1024;
  const x = c.getContext("2d");
  x.fillStyle = "#0d1520"; x.fillRect(0, 0, 512, 1024);
  const cc = 6, cr = 10, cw = 512 / cc, ch = 1024 / cr, gap = 3;
  for (let r = 0; r < cr; r++) for (let cl = 0; cl < cc; cl++) {
    const cx = cl * cw + gap, cy = r * ch + gap, w = cw - gap * 2, h = ch - gap * 2;
    const v = 0.85 + Math.random() * 0.3;
    x.fillStyle = "rgb(" + Math.floor(22 * v) + "," + Math.floor(55 * v) + "," + Math.floor(95 * v) + ")";
    x.fillRect(cx, cy, w, h);
    for (let g2 = 0; g2 < 3; g2++) {
      const gx = cx + Math.random() * w, gy = cy + Math.random() * h;
      const gr = x.createRadialGradient(gx, gy, 0, gx, gy, w * 0.4);
      gr.addColorStop(0, "rgba(80,130,190,0.12)"); gr.addColorStop(1, "rgba(30,60,110,0)");
      x.fillStyle = gr; x.fillRect(cx, cy, w, h);
    }
    x.strokeStyle = "rgba(190,200,215,0.2)"; x.lineWidth = 0.6;
    for (let f = 1; f < 8; f++) { x.beginPath(); x.moveTo(cx + f * (w / 8), cy + 1); x.lineTo(cx + f * (w / 8), cy + h - 1); x.stroke(); }
  }
  x.strokeStyle = "rgba(230,235,240,0.6)"; x.lineWidth = 3;
  for (let b = 1; b <= 3; b++) { const by = b * (1024 / 4); x.beginPath(); x.moveTo(0, by); x.lineTo(512, by); x.stroke(); }
  x.strokeStyle = "rgba(215,220,230,0.3)"; x.lineWidth = 1.5;
  for (let r = 0; r < cr; r++) for (let b = 1; b <= 2; b++) { const by = r * ch + b * (ch / 3); x.beginPath(); x.moveTo(0, by); x.lineTo(512, by); x.stroke(); }
  x.strokeStyle = "rgba(8,12,20,0.95)"; x.lineWidth = gap;
  for (let i = 1; i < cc; i++) { x.beginPath(); x.moveTo(i * cw, 0); x.lineTo(i * cw, 1024); x.stroke(); }
  for (let i = 1; i < cr; i++) { x.beginPath(); x.moveTo(0, i * ch); x.lineTo(512, i * ch); x.stroke(); }
  x.fillStyle = "rgba(200,210,225,0.3)";
  for (let r = 1; r < cr; r++) for (let cl = 1; cl < cc; cl++) {
    const px = cl * cw, py = r * ch;
    x.beginPath(); x.moveTo(px, py - 4); x.lineTo(px + 4, py); x.lineTo(px, py + 4); x.lineTo(px - 4, py); x.fill();
  }
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 4; return t;
}

export function makeFirstSolarTex() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 1024;
  const x = c.getContext("2d");
  x.fillStyle = "#0a0a0a"; x.fillRect(0, 0, 512, 1024);
  for (let i = 0; i < 80; i++) {
    const lx = Math.random() * 512;
    x.strokeStyle = "rgba(20,20,25," + (0.1 + Math.random() * 0.15) + ")"; x.lineWidth = 1 + Math.random() * 3;
    x.beginPath(); x.moveTo(lx, 0); x.lineTo(lx + Math.random() * 6 - 3, 1024); x.stroke();
  }
  const gr = x.createLinearGradient(0, 0, 512, 1024);
  gr.addColorStop(0, "rgba(30,30,35,0.08)"); gr.addColorStop(0.3, "rgba(15,15,18,0.02)");
  gr.addColorStop(0.7, "rgba(25,25,30,0.06)"); gr.addColorStop(1, "rgba(10,10,12,0.03)");
  x.fillStyle = gr; x.fillRect(0, 0, 512, 1024);
  x.strokeStyle = "rgba(40,40,45,0.3)"; x.lineWidth = 4; x.strokeRect(4, 4, 504, 1016);
  x.fillStyle = "rgba(25,25,28,0.4)"; x.fillRect(180, 960, 150, 40);
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 4; return t;
}

export function makeGndTex() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 512;
  const x = c.getContext("2d");
  x.fillStyle = "#8a9a5a"; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 12000; i++) {
    const px = Math.random() * 512, py = Math.random() * 512, v = 0.7 + Math.random() * 0.6;
    x.fillStyle = "rgba(" + Math.floor(120 * v) + "," + Math.floor(135 * v) + "," + Math.floor(70 * v) + ",0.4)";
    x.fillRect(px, py, 1 + Math.random() * 4, 1 + Math.random() * 2);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
