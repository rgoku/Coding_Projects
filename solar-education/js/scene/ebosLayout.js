// EBOS Site Designer - Layout Math (Pure function, no DOM/Three.js)
// Converted from hsat-site-designer (1).jsx buildLayout()

import { EBOS_MOD, EBOS_INV_OPTS } from '../data/ebosConfigs.js';

export function buildLayout(mt, cfg, sp) {
  const mod = EBOS_MOD[mt];
  const { rowLength, postSpacing, rowPitch, blockRows, blockCount } = sp;
  const invPer = EBOS_INV_OPTS.find(o => o.key === cfg.inverter)?.invPer || 8;
  const modStep = mod.h + 0.02;
  const mpr = Math.floor(rowLength / modStep);
  const spr = Math.floor(mpr / mod.strLen);
  const am = spr * mod.strLen;
  const al = am * modStep;
  const np = Math.max(3, Math.floor(al / postSpacing) + 1);
  const di = Math.floor(np / 2);
  const rkw = am * mod.watt / 1000;
  const bkw = rkw * blockRows;
  const tmw = (bkw * blockCount) / 1000;
  const ic = cfg.inverter === "central" ? blockCount : blockCount * Math.ceil(blockRows / invPer);

  const rows = [], equip = [], dcR = [], acR = [], mvR = [], roads = [];
  const eqW = cfg.inverter === "central" ? 10 : cfg.inverter === "cluster" ? 7 : 3;
  const bH = blockRows * rowPitch;
  const bW = al + eqW + 4;
  const gap = 9;
  const cols = Math.ceil(Math.sqrt(blockCount));
  const gR = Math.ceil(blockCount / cols);

  for (let bi = 0; bi < blockCount; bi++) {
    const gc = bi % cols, gr = Math.floor(bi / cols);
    const bx = gc * (bW + gap), by = gr * (bH + gap);
    roads.push({ x: bx - 3, y: by - 3, w: bW + 6, h: bH + 6 });

    for (let ri = 0; ri < blockRows; ri++) {
      const ry = by + ri * rowPitch;
      rows.push({ x: bx, y: ry, len: al, mods: am, posts: np, driveIdx: di, block: bi });

      if (cfg.dcCollection === "harnesses" || cfg.dcCombination === "combiner") {
        dcR.push({ x1: bx, y1: ry, x2: bx + al, y2: ry, t: "harness" });
        if (ri % 4 === 3 || ri === blockRows - 1) {
          const cx2 = bx + al + 2, cy = ry - Math.min(3, ri % 4) * rowPitch / 2;
          equip.push({ x: cx2, y: cy, t: "combiner", block: bi });
          for (let d = Math.max(0, ri - 3); d <= ri; d++)
            dcR.push({ x1: bx + al, y1: by + d * rowPitch, x2: cx2, y2: cy, t: "drop" });
        }
      } else if (cfg.dcCollection === "trunk" || cfg.dcCombination === "lbd") {
        dcR.push({ x1: bx, y1: ry, x2: bx + al, y2: ry, t: "trunk" });
        if (ri % 4 === 3 || ri === blockRows - 1)
          equip.push({ x: bx + al + 2, y: ry - Math.min(3, ri % 4) * rowPitch / 2, t: "lbd", block: bi });
      } else {
        dcR.push({ x1: bx, y1: ry, x2: bx + al, y2: ry, t: "homerun" });
      }
    }

    if (cfg.inverter === "distributed") {
      for (let ri = 0; ri < blockRows; ri += invPer) {
        const iy = by + (ri + Math.min(invPer - 1, blockRows - ri - 1) / 2) * rowPitch;
        equip.push({ x: bx + al + 2, y: iy, t: "str-inv", block: bi });
        acR.push({ x1: bx + al + 2, y1: iy, x2: bx + al + 6, y2: iy });
      }
    } else if (cfg.inverter === "cluster") {
      for (let ci = 0; ci < Math.ceil(blockRows / invPer); ci++) {
        const iy = by + (ci * invPer + Math.min(invPer, blockRows - ci * invPer) / 2) * rowPitch;
        equip.push({ x: bx + al + 5, y: iy, t: "clust-inv", block: bi });
        acR.push({ x1: bx + al + 5, y1: iy, x2: bx + al + 9, y2: iy });
      }
    } else {
      const iy = by + bH / 2;
      equip.push({ x: bx + al + 6, y: iy, t: "cent-inv", block: bi });
      equip.push({ x: bx + al + 6, y: iy + 6, t: "mv-xfmr", block: bi });
      acR.push({ x1: bx + al + 6, y1: iy, x2: bx + al + 6, y2: iy + 6 });
    }

    mvR.push({ x1: bx - 3, y1: by + bH + 1.5, x2: bx + bW + 3, y2: by + bH + 1.5 });
  }

  const subX = (cols * (bW + gap)) / 2, subY = gR * (bH + gap) + 12;
  equip.push({ x: subX, y: subY, t: "substation" });
  for (let g = 0; g < cols; g++)
    mvR.push({ x1: g * (bW + gap) + bW / 2, y1: 0, x2: g * (bW + gap) + bW / 2, y2: subY });

  return {
    rows, equip, dcR, acR, mvR, roads,
    stats: {
      totalMods: am * blockRows * blockCount,
      totalStrs: spr * blockRows * blockCount,
      totMW: tmw,
      invCnt: ic,
      blkKW: bkw,
      modsPerRow: am,
      strsPerRow: spr,
      actLen: al,
      numPosts: np
    },
    bounds: { w: cols * (bW + gap), h: gR * (bH + gap) + 25 }
  };
}
