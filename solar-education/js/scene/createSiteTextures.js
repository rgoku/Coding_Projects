// Texture generators for Create Site (solar-farm-v2)
// These are separate from the main education textureGenerator.js

export function csTexMkPanel(isBi, isFS) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 512;
  const x = c.getContext('2d');
  if (isFS) {
    // First Solar CdTe thin-film: uniform dark black, no cell grid, frameless
    const g = x.createLinearGradient(0, 0, 256, 512);
    g.addColorStop(0, '#0e0e12'); g.addColorStop(0.3, '#111118');
    g.addColorStop(0.7, '#0d0d14'); g.addColorStop(1, '#0a0a10');
    x.fillStyle = g; x.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 1200; i++) {
      x.fillStyle = 'rgba(' + (8 + Math.random() * 12) + ',' + (8 + Math.random() * 12) + ',' + (14 + Math.random() * 10) + ',' + (0.15 + Math.random() * 0.15) + ')';
      x.fillRect(Math.random() * 256, Math.random() * 512, 2 + Math.random() * 4, 2 + Math.random() * 4);
    }
    x.strokeStyle = 'rgba(60,65,75,.35)'; x.lineWidth = 1.5; x.strokeRect(1, 1, 254, 510);
  } else {
    x.fillStyle = isBi ? '#1a2244' : '#14192e'; x.fillRect(0, 0, 256, 512);
    const cellW = 256 / 6, cellH = 512 / 10;
    for (let r = 0; r < 10; r++) for (let col = 0; col < 6; col++) {
      const cx2 = col * cellW + 2, cy = r * cellH + 2, cw = cellW - 4, ch = cellH - 4;
      const g2 = x.createLinearGradient(cx2, cy, cx2 + cw, cy + ch);
      if (isBi) { g2.addColorStop(0, '#284078'); g2.addColorStop(0.5, '#3858A0'); g2.addColorStop(1, '#2A4080'); }
      else { g2.addColorStop(0, '#182040'); g2.addColorStop(0.5, '#1e2850'); g2.addColorStop(1, '#182040'); }
      x.fillStyle = g2; x.fillRect(cx2, cy, cw, ch);
      x.strokeStyle = 'rgba(100,120,180,.15)'; x.lineWidth = 0.5;
      for (let l = 0; l < 4; l++) { x.beginPath(); x.moveTo(cx2, cy + l * (ch / 3)); x.lineTo(cx2 + cw, cy + l * (ch / 3)); x.stroke(); }
    }
    x.strokeStyle = 'rgba(180,180,180,.25)'; x.lineWidth = 1; x.strokeRect(2, 2, 252, 508);
  }
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; return t;
}

export function csTexMkGround() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#5a6b3a'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 8000; i++) {
    const px = Math.random() * 512, py = Math.random() * 512;
    const sh = 40 + Math.random() * 40;
    x.fillStyle = 'rgb(' + (sh + 20) + ',' + (sh + 40) + ',' + sh + ')';
    x.fillRect(px, py, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(20, 20);
  return t;
}

export function csTexMkGravel() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#8a8070'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i++) {
    const px = Math.random() * 256, py = Math.random() * 256;
    const s = 100 + Math.random() * 60;
    x.fillStyle = 'rgb(' + s + ',' + (s - 5) + ',' + (s - 10) + ')';
    const r2 = 1 + Math.random() * 3;
    x.beginPath(); x.arc(px, py, r2, 0, Math.PI * 2); x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 8);
  return t;
}
