/**
 * textureGenerator.js
 * Texture generation functions for solar panels and ground materials
 * Extracted from Ampacity Renewables Solar Education platform
 */

/**
 * Generate panel texture - either bifacial mono-PERC or First Solar CdTe thin film
 * @param {boolean} bif - true for bifacial, false for First Solar
 * @returns {THREE.CanvasTexture} Generated panel texture
 */
export function mkPanelTex(bif) {
  // Portrait panel texture (taller than wide to match 1P orientation)
  const W = 512, H = 1024;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d');
  const fr = 10; // frame border width

  if (bif) {
    // ═══ BIFACIAL MONO-PERC — blue cells, silver busbars, silver frame ═══
    // Silver aluminum frame
    x.fillStyle = '#b8b8b8';
    x.fillRect(0, 0, W, H);
    // Backsheet (dark between cells)
    x.fillStyle = '#0a0e1a';
    x.fillRect(fr, fr, W - fr * 2, H - fr * 2);

    // Cell grid: 6 columns × 10 rows (standard 120 half-cut cell layout)
    const cols = 6, rows = 10;
    const cellGap = 2.5; // gap between cells
    const aw = W - fr * 2, ah = H - fr * 2;
    const cw = (aw - (cols + 1) * cellGap) / cols;
    const ch = (ah - (rows + 1) * cellGap) / rows;

    for (let r = 0; r < rows; r++) {
      for (let cc = 0; cc < cols; cc++) {
        const cx = fr + cellGap + (cw + cellGap) * cc;
        const cy = fr + cellGap + (ch + cellGap) * r;

        // Base cell color — deep blue with slight variation per cell
        const hue = 218 + Math.random() * 8;
        const sat = 65 + Math.random() * 15;
        const lit = 12 + Math.random() * 5;
        x.fillStyle = 'hsl(' + hue + ',' + sat + '%,' + lit + '%)';
        x.fillRect(cx, cy, cw, ch);

        // Anti-reflective coating gradient (subtle blue shimmer)
        const grd = x.createLinearGradient(cx, cy, cx + cw, cy + ch);
        grd.addColorStop(0, 'rgba(30,60,120,0.15)');
        grd.addColorStop(0.3, 'rgba(20,40,90,0.05)');
        grd.addColorStop(0.7, 'rgba(40,70,140,0.12)');
        grd.addColorStop(1, 'rgba(25,50,110,0.08)');
        x.fillStyle = grd;
        x.fillRect(cx, cy, cw, ch);

        // 5 horizontal busbars per cell (silver)
        for (let bb = 0; bb < 5; bb++) {
          const by = cy + ch * ((bb + 1) / 6);
          x.fillStyle = 'rgba(200,200,200,0.22)';
          x.fillRect(cx, by - 0.6, cw, 1.2);
        }

        // Vertical finger lines (fine, ~20 per cell)
        x.strokeStyle = 'rgba(180,180,180,0.07)';
        x.lineWidth = 0.4;
        const nFingers = 20;
        for (let f = 0; f < nFingers; f++) {
          const fx = cx + cw * ((f + 0.5) / nFingers);
          x.beginPath();
          x.moveTo(fx, cy);
          x.lineTo(fx, cy + ch);
          x.stroke();
        }
      }
    }

    // Frame edge highlight (3D bevel effect)
    x.fillStyle = 'rgba(220,220,220,0.4)';
    x.fillRect(0, 0, W, 3);
    x.fillRect(0, 0, 3, H); // top+left highlight
    x.fillStyle = 'rgba(80,80,80,0.4)';
    x.fillRect(0, H - 3, W, 3);
    x.fillRect(W - 3, 0, 3, H); // bottom+right shadow

  } else {
    // ═══ FIRST SOLAR CdTe THIN FILM — uniform black, no cell grid ═══
    // Black frame
    x.fillStyle = '#1a1a1a';
    x.fillRect(0, 0, W, H);
    // Near-black panel face
    x.fillStyle = '#0c0c0c';
    x.fillRect(fr, fr, W - fr * 2, H - fr * 2);

    // Very subtle vertical laser scribe lines (barely visible)
    for (let i = fr + 4; i < W - fr; i += 6) {
      const opacity = 0.03 + Math.random() * 0.04;
      x.strokeStyle = 'rgba(30,30,30,' + opacity + ')';
      x.lineWidth = 0.5;
      x.beginPath();
      x.moveTo(i, fr);
      x.lineTo(i, H - fr);
      x.stroke();
    }

    // Subtle horizontal scribe lines (wider spacing)
    for (let j = fr + 40; j < H - fr; j += 42) {
      x.strokeStyle = 'rgba(25,25,25,0.04)';
      x.lineWidth = 0.4;
      x.beginPath();
      x.moveTo(fr, j);
      x.lineTo(W - fr, j);
      x.stroke();
    }

    // Very subtle dark gradient (slight sheen variation like the photo)
    const grd = x.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, 'rgba(20,20,25,0.08)');
    grd.addColorStop(0.4, 'rgba(10,10,12,0.02)');
    grd.addColorStop(0.8, 'rgba(15,15,18,0.06)');
    grd.addColorStop(1, 'rgba(8,8,10,0.03)');
    x.fillStyle = grd;
    x.fillRect(fr, fr, W - fr * 2, H - fr * 2);

    // Frame edge (dark, not silver)
    x.fillStyle = 'rgba(40,40,40,0.5)';
    x.fillRect(0, 0, W, 2);
    x.fillRect(0, 0, 2, H);
    x.fillStyle = 'rgba(10,10,10,0.5)';
    x.fillRect(0, H - 2, W, 2);
    x.fillRect(W - 2, 0, 2, H);
  }

  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  return t;
}

/**
 * Generate grass/dirt ground texture
 * @returns {THREE.CanvasTexture} Generated ground texture with repeat wrapping
 */
export function mkGroundTex() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#8a9455';
  x.fillRect(0, 0, 512, 512);
  
  // Random grass/dirt particles
  for (let i = 0; i < 3000; i++) {
    const px = Math.random() * 512, py = Math.random() * 512, sz = 1 + Math.random() * 4;
    x.fillStyle = 'hsl(' + Math.floor(75 + Math.random() * 30) + ',' + Math.floor(30 + Math.random() * 25) + '%,' + Math.floor(30 + Math.random() * 18) + '%)';
    x.fillRect(px, py, sz, sz);
  }
  
  // Dirt patches
  for (let i = 0; i < 20; i++) {
    x.fillStyle = 'rgba(' + Math.floor(130 + Math.random() * 30) + ',' + Math.floor(115 + Math.random() * 25) + ',' + Math.floor(80 + Math.random() * 20) + ',0.3)';
    x.beginPath();
    x.arc(Math.random() * 512, Math.random() * 512, 10 + Math.random() * 30, 0, Math.PI * 2);
    x.fill();
  }
  
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(12, 12);
  t.encoding = THREE.sRGBEncoding;
  return t;
}

/**
 * Generate gravel texture
 * @returns {THREE.CanvasTexture} Generated gravel texture with repeat wrapping
 */
export function mkGravelTex() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#b5ad98';
  x.fillRect(0, 0, 256, 256);
  
  // Random gravel particles
  for (let i = 0; i < 2000; i++) {
    x.fillStyle = 'hsl(40,15%,' + Math.floor(60 + Math.random() * 20) + '%)';
    x.fillRect(Math.random() * 256, Math.random() * 256, 0.5 + Math.random() * 2, 0.5 + Math.random() * 2);
  }
  
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.encoding = THREE.sRGBEncoding;
  return t;
}
