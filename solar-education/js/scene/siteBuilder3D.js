/**
 * siteBuilder3D.js
 * Massive 3D site generator - 1,135+ lines of solar farm construction
 * Extracted from Ampacity Renewables Solar Education platform
 */

import { mkPanelTex, mkGroundTex, mkGravelTex } from './textureGenerator.js';

export function svBuildSite(sc, inv, dc, comb, isBi) {
  const R=()=>Math.random();

  // ═══ REALISTIC TERRAIN - Natural Grading with Drainage ═══
  const gG=new THREE.PlaneGeometry(800,800,80,80); // Higher resolution for smoother terrain
  const gP=gG.attributes.position;

  // Natural terrain with realistic elevation changes
  for(let i=0;i<gP.count;i++){
    const gx=gP.getX(i);
    const gz=gP.getY(i);

    // Base elevation - gentle rolling hills
    let elevation=Math.sin(gx*.032)*Math.cos(gz*.042)*.45;

    // Add natural terrain variation
    elevation+=Math.sin(gx*.085+gz*.075)*.18;

    // Subtle micro-variations (soil texture)
    elevation+=Math.sin(gx*.52)*Math.cos(gz*.48)*.035;

    // Drainage slope away from array center
    const distFromCenter=Math.sqrt(gx*gx+gz*gz);
    if(distFromCenter>100){
      elevation-=(distFromCenter-100)*.002; // Gentle slope outward
    }

    gP.setZ(i,elevation);
  }

  gG.computeVertexNormals();

  // Ground material with realistic properties
  const groundMat=new THREE.MeshStandardMaterial({
    map:mkGroundTex(),
    roughness:.95,
    metalness:0,
    envMapIntensity:.05
  });

  const gnd=new THREE.Mesh(gG,groundMat);
  gnd.rotation.x=-Math.PI/2;
  gnd.receiveShadow=true;
  gnd.castShadow=false;
  sc.add(gnd);

  // Add subtle ground texture variations (worn paths, compacted soil)
  const pathMat=new THREE.MeshStandardMaterial({color:0x6a5a45,roughness:.98,metalness:0});
  for(let path=0;path<6;path++){
    const pathGeo=new THREE.PlaneGeometry(2.5+R()*.5,15+R()*10);
    const pathMesh=new THREE.Mesh(pathGeo,pathMat);
    pathMesh.rotation.x=-Math.PI/2;
    pathMesh.position.set(-50+R()*100,.085,- 60+path*20+R()*8);
    pathMesh.receiveShadow=true;
    sc.add(pathMesh);
  }

  // ═══ PHOTOREALISTIC MATERIALS - Industry-Grade Accuracy ═══
  const pTex=mkPanelTex(isBi);
  const M={
    // SOLAR PANELS - Museum-quality realism
    pnl:new THREE.MeshStandardMaterial({
      map:pTex,
      roughness:isBi?0.04:0.11, // Bifacial: polished glass, First Solar: textured
      metalness:isBi?0.75:0.22,
      envMapIntensity:isBi?1.3:0.35,
      emissive:isBi?0x0a0a16:0x000000,
      emissiveIntensity:0.018 // Subtle sun reflection glow
    }),
    // ALUMINUM FRAME - Anodized 6063-T5 alloy with UV aging
    frame:new THREE.MeshStandardMaterial({color:0xBEC2C6,roughness:.16,metalness:.94,envMapIntensity:.88}),
    // STRUCTURAL STEEL - Hot-rolled with rust prevention primer
    steel:new THREE.MeshStandardMaterial({color:0x8A8A92,roughness:.38,metalness:.90,envMapIntensity:.65,emissive:0x1C1814,emissiveIntensity:0.008}),
    // GALVANIZED STEEL - G90 zinc coating, realistic crystalline pattern
    galv:new THREE.MeshStandardMaterial({color:0xA8AEB2,roughness:.26,metalness:.84,envMapIntensity:.78}),
    // DC CABLES - UV-resistant XLPE insulation, sun-faded red
    dc:new THREE.MeshStandardMaterial({color:0xA81C1C,roughness:.64,metalness:.07,envMapIntensity:.12}),
    // AC CABLES - Heavy-gauge industrial THHN/THWN, orange jacket
    ac:new THREE.MeshStandardMaterial({color:0xCA6814,roughness:.60,metalness:.10,envMapIntensity:.18}),
    // INVERTER HOUSING - RAL 9005 powder coat on 14-gauge steel
    inv:new THREE.MeshStandardMaterial({color:0x1E1E1E,roughness:.30,metalness:.48,envMapIntensity:.52}),
    // INVERTER DETAILS - Textured matte black panels
    invD:new THREE.MeshStandardMaterial({color:0x272727,roughness:.36,metalness:.38,envMapIntensity:.42}),
    // CONCRETE - 3000 PSI mix, weathered/stained after 2-3 years
    conc:new THREE.MeshStandardMaterial({color:0x9C9C96,roughness:.94,metalness:0,emissive:0x0C0C0A,emissiveIntensity:0.012}),
    // TRANSFORMER - Industrial enamel RAL 5015 sky blue
    tx:new THREE.MeshStandardMaterial({color:0x2868EA,roughness:.20,metalness:.55,envMapIntensity:.68}),
    // TRANSFORMER FINS - Bare aluminum with oxidation
    txFin:new THREE.MeshStandardMaterial({color:0x2054B8,roughness:.23,metalness:.65,envMapIntensity:.72}),
    // CHAIN-LINK FENCE - 9-gauge galvanized steel mesh
    fence:new THREE.MeshStandardMaterial({color:0x9A9A9A,roughness:.36,metalness:.80,transparent:true,opacity:.36,side:THREE.DoubleSide,envMapIntensity:.45}),
    // FENCE POSTS - Schedule 40 galvanized pipe, weathered
    fP:new THREE.MeshStandardMaterial({color:0x888888,roughness:.33,metalness:.87,envMapIntensity:.68,emissive:0x121210,emissiveIntensity:0.006}),
    // COMBINER BOXES - Type 304 stainless steel, brushed finish
    comb:new THREE.MeshStandardMaterial({color:0x5C5C5C,roughness:.32,metalness:.72,envMapIntensity:.75}),
    // WARNING LABELS - 3M reflective yellow, ANSI Z535 compliant
    warn:new THREE.MeshStandardMaterial({color:0xFFD800,roughness:.12,metalness:.04,emissive:0xFFCC00,emissiveIntensity:.28}),
    // LED INDICATORS - Self-powered with light diffusion
    led:new THREE.MeshStandardMaterial({color:0x24FF48,roughness:.06,metalness:.12,emissive:0x22DD44,emissiveIntensity:.85}),
    ledRed:new THREE.MeshStandardMaterial({color:0xFF2424,roughness:.06,metalness:.12,emissive:0xDD2222,emissiveIntensity:.85}),
    ledBlue:new THREE.MeshStandardMaterial({color:0x2488FF,roughness:.06,metalness:.12,emissive:0x2268DD,emissiveIntensity:.75}),
    ledAmber:new THREE.MeshStandardMaterial({color:0xFFAA24,roughness:.06,metalness:.12,emissive:0xFF9922,emissiveIntensity:.78}),
    // VEGETATION - Native desert/grassland species
    bush:new THREE.MeshStandardMaterial({color:0x4D6F34,roughness:.96,metalness:0,envMapIntensity:.08}),
    bark:new THREE.MeshStandardMaterial({color:0x5E3F24,roughness:.99,metalness:0,envMapIntensity:0}),
    canopy:new THREE.MeshStandardMaterial({color:0x3F702C,roughness:.89,metalness:0,envMapIntensity:.13}),
    // SIGNAGE - Engineer-grade reflective sheeting
    white:new THREE.MeshStandardMaterial({color:0xF7F7F7,roughness:.32,metalness:.06,emissive:0xF0F0F0,emissiveIntensity:.04}),
    // BUILDING - Textured stucco with UV/weather fading
    bldg:new THREE.MeshStandardMaterial({color:0xC7BFB2,roughness:.87,metalness:.018,envMapIntensity:.04}),
    // ROOFING - 26-gauge corrugated steel, galvanized
    roof:new THREE.MeshStandardMaterial({color:0x6C6C6C,roughness:.33,metalness:.75,envMapIntensity:.58}),
    // GLASS - Low-iron tempered safety glass
    glass:new THREE.MeshStandardMaterial({color:0x8AAECC,roughness:.04,metalness:.12,transparent:true,opacity:.67,envMapIntensity:1.05}),
    // CERAMIC INSULATORS - High-voltage porcelain
    ceramic:new THREE.MeshStandardMaterial({color:0xE7DCCE,roughness:.26,metalness:.06,envMapIntensity:.38}),
    // COPPER - ETP grade with natural patina
    copper:new THREE.MeshStandardMaterial({color:0xBA7436,roughness:.36,metalness:.85,envMapIntensity:.72,emissive:0x24140A,emissiveIntensity:0.015}),
    // RUBBER/EPDM - Weather-resistant cable jacketing
    rubber:new THREE.MeshStandardMaterial({color:0x2C2C2C,roughness:.80,metalness:.04,envMapIntensity:.04})
  };

  // Constants — 1P Portrait Single-Axis Tracker
  const ROWS=16,RS=8.5,TILT=22*Math.PI/180,PW=1.13,PH=2.28,PD=.035,GAP=.04;
  const PPR=isBi?110:95;
  const RL=PPR*(PW+GAP),X0=-RL/2,Z0=-(ROWS*RS)/2,HUB=3.4;

  // Gravel pad helper
  const gvT=mkGravelTex();
  function gpad(cx,cz,w,d){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({map:gvT.clone(),roughness:.82,metalness:.05}));m.material.map.repeat.set(w/8,d/8);m.material.map.wrapS=m.material.map.wrapT=THREE.RepeatWrapping;m.rotation.x=-Math.PI/2;m.position.set(cx,.09,cz);m.receiveShadow=true;sc.add(m)}

  // ═══ SOLAR PANELS - Photorealistic with Mounting Hardware ═══
  const totP=ROWS*PPR;

  // Enhanced panel geometry with chamfered edges
  const pGeo=new THREE.BoxGeometry(PW,PH,PD);
  const panels=new THREE.InstancedMesh(pGeo,M.pnl,totP);
  panels.castShadow=true;
  panels.receiveShadow=true;

  const dm=new THREE.Object3D();
  let idx=0;

  for(let r=0;r<ROWS;r++){
    const rz=Z0+r*RS;
    for(let c=0;c<PPR;c++){
      const px=X0+c*(PW+GAP)+PW/2;
      const py=HUB+Math.sin(TILT)*PH*.5;

      dm.position.set(px,py,rz);
      dm.rotation.set(-TILT,0,0);
      dm.updateMatrix();
      panels.setMatrixAt(idx++,dm.matrix);

      // Add realistic mid-clamps every 5th panel for detail
      if(c%5===0 && c>0 && r%4===0){
        const clamp=new THREE.Mesh(new THREE.BoxGeometry(.035,.08,.02),M.frame);
        clamp.position.set(px-PW/2-.005,py,rz);
        clamp.rotation.x=-TILT;
        clamp.castShadow=true;
        sc.add(clamp);
        // Clamp bolt (M8 hex head)
        const bolt=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.03,6),M.steel);
        bolt.position.set(px-PW/2-.005,py-.04,rz);
        bolt.rotation.set(-TILT+Math.PI/2,0,0);
        sc.add(bolt);
      }
    }
  }

  panels.instanceMatrix.needsUpdate=true;
  sc.add(panels);

  // ═══ TRACKER RACKING - Professional-Grade Single-Axis System ═══
  for(let r=0;r<ROWS;r++){
    const rz=Z0+r*RS;

    // TORQUE TUBE - 4" square structural tube, hot-dip galvanized
    const tt=new THREE.Mesh(new THREE.CylinderGeometry(.058,.058,RL+1.5,8),M.galv);
    tt.rotation.z=Math.PI/2;
    tt.position.set(0,HUB,rz);
    tt.castShadow=true;
    tt.receiveShadow=true;
    sc.add(tt);

    // PILE FOUNDATIONS - W6x9 I-beam posts driven 8-10 feet deep
    const pSp=4*(PW+GAP);
    const nP=Math.floor(RL/pSp)+1;

    for(let p=0;p<nP;p++){
      const px=X0+p*pSp;

      // Main web of I-beam
      const pile=new THREE.Mesh(new THREE.BoxGeometry(.12,4.4,.065),M.steel);
      pile.position.set(px,HUB/2-.15,rz);
      pile.castShadow=true;
      pile.receiveShadow=true;
      sc.add(pile);

      // I-beam flanges (top and bottom)
      const flange1=new THREE.Mesh(new THREE.BoxGeometry(.045,4.15,.16),M.steel);
      flange1.position.set(px-.057,HUB/2-.15,rz);
      flange1.castShadow=true;
      sc.add(flange1);

      const flange2=new THREE.Mesh(new THREE.BoxGeometry(.045,4.15,.16),M.steel);
      flange2.position.set(px+.057,HUB/2-.15,rz);
      flange2.castShadow=true;
      sc.add(flange2);

      // Bearing assembly at top of pile
      const bearing=new THREE.Mesh(new THREE.BoxGeometry(.24,.08,.24),M.steel);
      bearing.position.set(px,HUB+.04,rz);
      bearing.castShadow=true;
      sc.add(bearing);

      // Grease fitting (Zerk fitting)
      const zerk=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.025,6),M.steel);
      zerk.position.set(px+.1,HUB+.04,rz);
      zerk.rotation.z=Math.PI/2;
      sc.add(zerk);

      // Mounting bolts (4x M20 grade 8.8 bolts per bearing)
      for(let b=0;b<4;b++){
        const bx=px+((b%2)-.5)*.15;
        const bz=rz+((Math.floor(b/2))-.5)*.15;
        // Hex bolt head
        const boltHead=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.012,6),M.galv);
        boltHead.position.set(bx,HUB+.085,bz);
        sc.add(boltHead);
        // Lock washer
        const washer=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.002,8),M.steel);
        washer.position.set(bx,HUB+.078,bz);
        sc.add(washer);
      }
    }

    // TRACKER MOTOR - Linear actuator with encoder
    const motor=new THREE.Mesh(new THREE.BoxGeometry(.65,.48,.38),M.invD);
    motor.position.set(0,HUB-.28,rz);
    motor.castShadow=true;
    motor.receiveShadow=true;
    sc.add(motor);

    // Motor mounting bracket
    const motorBracket=new THREE.Mesh(new THREE.BoxGeometry(.75,.06,.45),M.galv);
    motorBracket.position.set(0,HUB-.52,rz);
    motorBracket.castShadow=true;
    sc.add(motorBracket);

    // Motor shaft/actuator
    const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.25,8),M.steel);
    shaft.position.set(0,HUB-.55,rz);
    shaft.rotation.x=Math.PI/2;
    sc.add(shaft);

    // Status LED indicator
    const statusLED=new THREE.Mesh(new THREE.SphereGeometry(.032,8,8),M.led);
    statusLED.position.set(-.22,HUB-.12,rz-.19);
    sc.add(statusLED);

    // Communication antenna
    const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.12,4),M.steel);
    antenna.position.set(.25,HUB-.05,rz-.19);
    sc.add(antenna);

    // MOUNTING RAILS - Aluminum extrusion for panel attachment
    const railGeo=new THREE.CylinderGeometry(.022,.022,RL+.6,4);

    // Upper rail (north side of tilted panels)
    const rail1=new THREE.Mesh(railGeo,M.frame);
    rail1.rotation.z=Math.PI/2;
    rail1.position.set(0,HUB+Math.sin(TILT)*PH*.87,rz-Math.cos(TILT)*.42);
    rail1.castShadow=true;
    sc.add(rail1);

    // Lower rail (south side of tilted panels)
    const rail2=new THREE.Mesh(railGeo.clone(),M.frame);
    rail2.rotation.z=Math.PI/2;
    rail2.position.set(0,HUB-Math.sin(TILT)*PH*.08,rz+Math.cos(TILT)*.42);
    rail2.castShadow=true;
    sc.add(rail2);

    // Rail-to-torque-tube clamps (every 4 panels)
    for(let cl=0;cl<Math.floor(PPR/4);cl++){
      const clX=X0+cl*4*(PW+GAP)+(PW+GAP)*2;
      // Clamp body
      const clampBody=new THREE.Mesh(new THREE.BoxGeometry(.06,.08,.08),M.galv);
      clampBody.position.set(clX,HUB,rz);
      clampBody.castShadow=true;
      sc.add(clampBody);
      // Clamp bolt
      const clampBolt=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.04,6),M.steel);
      clampBolt.position.set(clX,HUB-.04,rz);
      sc.add(clampBolt);
    }
  }

  // ─── DC COLLECTION ───
  // Position depends on inverter type for proper routing
  const CE=RL/2+8; // Collection edge
  const DIX=X0-12; // Distributed inverter X position (west of array)
  const CIX=RL/2+35; // Central/Cluster inverter X position (east of array)
  
  // Wire materials
  const wireBlack=new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:.55,metalness:.15});
  const wireRed=new THREE.MeshStandardMaterial({color:0xaa2222,roughness:.55,metalness:.15});
  const conduitGray=new THREE.MeshStandardMaterial({color:0x606060,roughness:.4,metalness:.6});
  const conduitPVC=new THREE.MeshStandardMaterial({color:0x4a4a4a,roughness:.7,metalness:.1});
  
  // String sizing (available for all configs)
  const stringLen=isBi?28:6; // 28 modules/string for bifacial, 6 for First Solar
  const nStringsPerRow=Math.floor(PPR/stringLen);
  
  if(dc==='string-homeruns'){
    // ═══ STRING HOMERUNS ═══
    // Individual 10 AWG string wires from each string termination
    // Each string = 2 wires (+ and -) run as homerun pair
    // Routed via underground PVC conduits to inverter
    
    for(let r=0;r<ROWS;r++){
      const rz=Z0+r*RS;
      
      // ═══ STRING TERMINATION BOXES ═══
      for(let s=0;s<nStringsPerRow;s++){
        const sx=X0+s*(RL/nStringsPerRow)+RL/(nStringsPerRow*2);
        
        // String junction box mounted on tracker (weatherproof NEMA 4)
        const sjb=new THREE.Mesh(new THREE.BoxGeometry(.30,.18,.14),
          new THREE.MeshStandardMaterial({color:0x2a2a2a,roughness:.45,metalness:.5}));
        sjb.position.set(sx,HUB-.55,rz+.22);sjb.castShadow=true;sc.add(sjb);
        // Junction box lid
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.28,.16,.01),
          new THREE.MeshStandardMaterial({color:0x3a3a3a,roughness:.35,metalness:.55})).translateX(sx).translateY(HUB-.55).translateZ(rz+.15));
        // Screws on lid (4 corners)
        for(let scr=0;scr<4;scr++){
          const scrX=sx+((scr%2)-.5)*.2;
          const scrY=HUB-.55+((Math.floor(scr/2))-.5)*.12;
          sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.02,6),M.steel).translateX(scrX).translateY(scrY).translateZ(rz+.14));
        }
        // Cable entry glands (top - from panels)
        for(let g=0;g<2;g++){
          sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.018,.022,.06,6),M.steel).translateX(sx-.08+g*.16).translateY(HUB-.45).translateZ(rz+.22));
        }
        
        // Module interconnect cables (coming from panels above)
        const mCable1=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.35,4),wireRed);
        mCable1.position.set(sx-.06,HUB-.28,rz+.15);mCable1.rotation.x=.2;sc.add(mCable1);
        const mCable2=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.35,4),wireBlack);
        mCable2.position.set(sx+.06,HUB-.28,rz+.15);mCable2.rotation.x=.2;sc.add(mCable2);
        
        // Flex conduit drop from junction box to ground
        const flexH=HUB-.7;
        const flex=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,flexH,8),conduitGray);
        flex.position.set(sx,flexH/2+.05,rz+.28);sc.add(flex);
        // Conduit connector at top
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.032,.028,.05,8),M.steel).translateX(sx).translateY(HUB-.65).translateZ(rz+.28));
        
        // ═══ HOMERUN ROUTING ═══
        if(inv==='distributed'){
          // Route WEST to distributed inverters
          const hrLen=sx-DIX;
          
          // Underground PVC conduit (visible as slight raised bump)
          const conduit=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,hrLen,6),conduitPVC);
          conduit.rotation.z=Math.PI/2;conduit.position.set(sx-hrLen/2,.04,rz+.35);sc.add(conduit);
          
          // Positive wire inside (partially visible at ends)
          const wireP=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,hrLen*.98,4),wireRed);
          wireP.rotation.z=Math.PI/2;wireP.position.set(sx-hrLen/2,.04,rz+.33);sc.add(wireP);
          // Negative wire
          const wireN=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,hrLen*.98,4),wireBlack);
          wireN.rotation.z=Math.PI/2;wireN.position.set(sx-hrLen/2,.04,rz+.37);sc.add(wireN);
          
          // Conduit sweep at junction box (90° elbow)
          sc.add(new THREE.Mesh(new THREE.TorusGeometry(.08,.025,6,8,Math.PI/2),conduitPVC).translateX(sx-.08).translateY(.12).translateZ(rz+.28).rotateZ(Math.PI).rotateY(Math.PI/2));
        }else{
          // Route EAST to centralized combiners
          const hrLen=CE-sx+8;
          const conduit=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,hrLen,6),conduitPVC);
          conduit.rotation.z=Math.PI/2;conduit.position.set(sx+hrLen/2,.04,rz+.35);sc.add(conduit);
          const wireP=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,hrLen*.98,4),wireRed);
          wireP.rotation.z=Math.PI/2;wireP.position.set(sx+hrLen/2,.04,rz+.33);sc.add(wireP);
          const wireN=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,hrLen*.98,4),wireBlack);
          wireN.rotation.z=Math.PI/2;wireN.position.set(sx+hrLen/2,.04,rz+.37);sc.add(wireN);
        }
      }
      
      // ═══ DC TRENCH (visible gravel cover) ═══
      if(inv==='distributed'){
        // Trench runs from array to inverter row (west)
        const trenchLen=X0-DIX+15;
        const trenchMat=new THREE.MeshStandardMaterial({color:0x6b5c4a,roughness:.92,metalness:0});
        const trench=new THREE.Mesh(new THREE.BoxGeometry(trenchLen,.03,1.8),trenchMat);
        trench.position.set(DIX+trenchLen/2-5,.015,rz+.35);trench.receiveShadow=true;sc.add(trench);
        // Trench warning tape (yellow stripe)
        if(r%4===0){
          sc.add(new THREE.Mesh(new THREE.BoxGeometry(trenchLen,.005,.15),M.warn).translateX(DIX+trenchLen/2-5).translateY(.035).translateZ(rz+.35));
        }
      }
    }
    
    // ═══ GROUND ROD & EQUIPMENT GROUNDING ═══
    if(inv==='distributed'){
      // Ground rods near each inverter position
      for(let r=0;r<ROWS;r+=2){
        const rz=Z0+r*RS+RS/2;
        // Ground rod (copper-clad steel)
        const gRod=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,1.2,6),
          new THREE.MeshStandardMaterial({color:0xb87333,roughness:.4,metalness:.7}));
        gRod.position.set(DIX-2.5,.6,rz+1);sc.add(gRod);
        // Ground wire to rod
        const gWire=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,1.5,4),
          new THREE.MeshStandardMaterial({color:0x00aa00,roughness:.5,metalness:.3}));
        gWire.rotation.z=Math.PI/4;gWire.position.set(DIX-1.8,.4,rz+.8);sc.add(gWire);
      }
    }
    
    // Main DC collection conduit (for centralized only)
    if(inv!=='distributed'){
      const mainConduit=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,ROWS*RS+12,10),conduitPVC);
      mainConduit.position.set(CE+5,(ROWS*RS+12)/2*.02+.15,0);sc.add(mainConduit);
    }
    
  }else if(dc==='harnesses'){
    // ═══ HARNESSES (Y-CONNECTORS) ═══
    // Pre-fabricated cable assemblies mounted ON the tracker structure
    // Y-connectors combine strings at source before routing
    // Cables run along torque tube
    
    for(let r=0;r<ROWS;r++){
      const rz=Z0+r*RS;
      
      // Main harness cables running along torque tube
      // Positive conductor (red)
      const harnP=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,RL*.94,6),M.dc);
      harnP.rotation.z=Math.PI/2;harnP.position.set(0,HUB-.42,rz+.28);harnP.castShadow=true;sc.add(harnP);
      // Negative conductor (black)
      const harnN=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,RL*.94,6),
        new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:.5,metalness:.15}));
      harnN.rotation.z=Math.PI/2;harnN.position.set(0,HUB-.50,rz+.28);sc.add(harnN);
      
      // Y-connector junction boxes along harness (combine 2 strings each)
      const nYconn=Math.floor(PPR/14); // ~7-8 Y-connectors per row
      for(let y=0;y<nYconn;y++){
        const yx=X0+RL*.06+y*(RL*.88/nYconn);
        // Y-connector box
        const ybox=new THREE.Mesh(new THREE.BoxGeometry(.22,.14,.14),
          new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.45,metalness:.5}));
        ybox.position.set(yx,HUB-.46,rz+.32);sc.add(ybox);
        // Input cables from string (small wires going up to panels)
        for(let inp=0;inp<2;inp++){
          const icable=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.35,3),M.dc);
          icable.position.set(yx-.06+inp*.12,HUB-.28,rz+.1);sc.add(icable);
        }
        // Cable tie/support
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.04,.02,.18),M.steel).translateX(yx).translateY(HUB-.38).translateZ(rz+.28));
      }
      
      // Harness termination box (end of row)
      const termX=inv==='distributed'?X0-.5:RL/2+1.5;
      const termBox=new THREE.Mesh(new THREE.BoxGeometry(.35,.25,.2),
        new THREE.MeshStandardMaterial({color:0x252525,roughness:.4,metalness:.45}));
      termBox.position.set(termX,HUB-.45,rz+.28);sc.add(termBox);
      
      // Drop cable from harness termination to ground/inverter
      const dropH=inv==='distributed'?HUB-.2:HUB-.3;
      const dropCable=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,dropH,6),M.dc);
      dropCable.position.set(termX,HUB-.45-dropH/2,rz+.3);sc.add(dropCable);
      
      // Ground routing
      if(inv!=='distributed'){
        // Route east to combiner area
        const groundRun=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,CE-termX+5,6),M.dc);
        groundRun.rotation.z=Math.PI/2;groundRun.position.set((termX+CE)/2+2,.15,rz+.4);sc.add(groundRun);
      }
    }
    
    // Main DC collection riser (for centralized configs)
    if(inv!=='distributed'){
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,ROWS*RS+12,8),M.dc).translateX(CE+4).translateY(.3));
      // Horizontal feed to combiner/inverter area
      const hFeed=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,CIX-CE-5,8),M.dc);
      hFeed.rotation.z=Math.PI/2;hFeed.position.set((CE+CIX)/2,.3,0);sc.add(hFeed);
    }
    
  }else if(dc==='trunk-bus'){
    // ═══ TRUNK BUS ═══
    // Elevated DC bus bars running along array rows
    // Strings tap into trunk via tap boxes
    // High-capacity copper/aluminum bus system on steel supports
    
    const bLen=ROWS*RS+14;
    const busY=2.2; // Bus height
    
    // ═══ MAIN BUS BARS (center of array) ═══
    // Positive bus (red/copper)
    const busP=new THREE.Mesh(new THREE.BoxGeometry(.12,bLen,.08),
      new THREE.MeshStandardMaterial({color:0xCC3333,roughness:.2,metalness:.75}));
    busP.rotation.x=Math.PI/2;busP.position.set(-.25,busY,0);busP.castShadow=true;sc.add(busP);
    // Negative bus (black/aluminum)
    const busN=new THREE.Mesh(new THREE.BoxGeometry(.12,bLen,.08),
      new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.2,metalness:.7}));
    busN.rotation.x=Math.PI/2;busN.position.set(.25,busY,0);busN.castShadow=true;sc.add(busN);
    
    // Bus support structures
    const nSupp=Math.ceil(bLen/5);
    for(let s=0;s<nSupp;s++){
      const sz=Z0-5+s*5;
      // Steel H-frame support
      const postL=new THREE.Mesh(new THREE.BoxGeometry(.1,busY,.08),M.steel);
      postL.position.set(-.6,busY/2,sz);postL.castShadow=true;sc.add(postL);
      const postR=new THREE.Mesh(new THREE.BoxGeometry(.1,busY,.08),M.steel);
      postR.position.set(.6,busY/2,sz);postR.castShadow=true;sc.add(postR);
      // Cross beam
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.4,.08,.08),M.steel).translateY(busY+.06).translateZ(sz));
      // Insulator standoffs (ceramic)
      const insulatorMat=new THREE.MeshStandardMaterial({color:0xE8DCC0,roughness:.35,metalness:.1});
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04,.06,.2,8),insulatorMat).translateX(-.25).translateY(busY+.16).translateZ(sz));
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04,.06,.2,8),insulatorMat).translateX(.25).translateY(busY+.16).translateZ(sz));
    }
    
    // Tap boxes for each row (where strings connect to bus)
    for(let r=0;r<ROWS;r++){
      const rz=Z0+r*RS;
      // Tap box (fused connection point)
      const tapBox=new THREE.Mesh(new THREE.BoxGeometry(.45,.35,.25),M.comb);
      tapBox.position.set(0,busY+.35,rz);tapBox.castShadow=true;sc.add(tapBox);
      // Status indicator
      sc.add(new THREE.Mesh(new THREE.SphereGeometry(.025,6,6),M.led).translateX(.15).translateY(busY+.55).translateZ(rz-.1));
      // Warning label
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.15,.08,.01),M.warn).translateX(-.1).translateY(busY+.55).translateZ(rz-.13));
      
      // String tap cables running from tracker to bus
      const nTaps=4; // 4 tap points per row
      for(let t=0;t<nTaps;t++){
        const tx=X0+RL*.15+t*(RL*.7/nTaps);
        // Vertical drop from bus to ground level at tap point
        const tapCable=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,busY-.3,4),M.dc);
        tapCable.position.set(tx,(busY-.3)/2+.15,rz-.2);sc.add(tapCable);
        // Horizontal run along ground from tap to bus center
        const horizTap=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,Math.abs(tx),4),M.dc);
        horizTap.rotation.z=Math.PI/2;horizTap.position.set(tx/2,.12,rz-.2);sc.add(horizTap);
      }
    }
    
    // Bus extension to LBD area
    const busExtLen=CE+15;
    const busExtP=new THREE.Mesh(new THREE.BoxGeometry(busExtLen,.08,.1),
      new THREE.MeshStandardMaterial({color:0xCC3333,roughness:.2,metalness:.75}));
    busExtP.position.set(busExtLen/2-5,1.5,Z0-8);busExtP.castShadow=true;sc.add(busExtP);
    const busExtN=new THREE.Mesh(new THREE.BoxGeometry(busExtLen,.08,.1),
      new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.2,metalness:.7}));
    busExtN.position.set(busExtLen/2-5,1.5,Z0-9);busExtN.castShadow=true;sc.add(busExtN);
    // Extension supports
    for(let es=0;es<Math.floor(busExtLen/8);es++){
      const esx=es*8+3;
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,1.6,6),M.steel).translateX(esx).translateY(.8).translateZ(Z0-8.5));
    }
  }

  // ─── DC COMBINATION ───
  // Equipment placement depends on configuration
  
  if(comb==='combiner-boxes'){
    // ═══ COMBINER BOXES ═══
    // SolarBOS / Shoals style NEMA 4X combiner boxes
    // Pole-mounted, stainless steel enclosures
    // Fused inputs with monitoring
    
    const nCB=inv==='central'?14:10; // Combiners based on config
    const cbX=CE+8; // Combiner X position
    
    for(let i=0;i<nCB;i++){
      const cbZ=Z0+4+(i/(nCB-1))*(ROWS-2)*RS;
      
      // ═══ MOUNTING STRUCTURE ═══
      // Concrete pier foundation
      const pier=new THREE.Mesh(new THREE.CylinderGeometry(.2,.25,.6,8),M.conc);
      pier.position.set(cbX,.3,cbZ);sc.add(pier);
      
      // Galvanized steel pole (Schedule 40)
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,3.8,8),
        new THREE.MeshStandardMaterial({color:0x909498,roughness:.35,metalness:.7}));
      pole.position.set(cbX,2.5,cbZ);pole.castShadow=true;sc.add(pole);
      
      // Pole cap
      sc.add(new THREE.Mesh(new THREE.SphereGeometry(.07,8,6,0,Math.PI*2,0,Math.PI/2),
        new THREE.MeshStandardMaterial({color:0x909498,roughness:.35,metalness:.7})).translateX(cbX).translateY(4.42).translateZ(cbZ));
      
      // Mounting bracket (unistrut)
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.9,.08,.12),
        new THREE.MeshStandardMaterial({color:0x909498,roughness:.4,metalness:.65})).translateX(cbX).translateY(4.1).translateZ(cbZ));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.08,.35,.08),
        new THREE.MeshStandardMaterial({color:0x909498,roughness:.4,metalness:.65})).translateX(cbX-.38).translateY(3.95).translateZ(cbZ));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.08,.35,.08),
        new THREE.MeshStandardMaterial({color:0x909498,roughness:.4,metalness:.65})).translateX(cbX+.38).translateY(3.95).translateZ(cbZ));
      
      // ═══ COMBINER BOX ENCLOSURE ═══
      // Main body (304 stainless steel)
      const cbBody=new THREE.Mesh(new THREE.BoxGeometry(.95,.75,.45),
        new THREE.MeshStandardMaterial({color:0x8a8a8a,roughness:.28,metalness:.72}));
      cbBody.position.set(cbX,3.55,cbZ);cbBody.castShadow=true;sc.add(cbBody);
      
      // Lid/door (with drip edge)
      const lid=new THREE.Mesh(new THREE.BoxGeometry(.92,.72,.025),
        new THREE.MeshStandardMaterial({color:0x7a7a7a,roughness:.25,metalness:.75}));
      lid.position.set(cbX,3.55,cbZ-.238);sc.add(lid);
      
      // Drip edge (rain hood)
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.96,.08,.06),
        new THREE.MeshStandardMaterial({color:0x7a7a7a,roughness:.25,metalness:.75})).translateX(cbX).translateY(3.95).translateZ(cbZ-.27));
      
      // Piano hinge (left side)
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.04,.68,.03),
        new THREE.MeshStandardMaterial({color:0x606060,roughness:.4,metalness:.6})).translateX(cbX-.44).translateY(3.55).translateZ(cbZ-.24));
      
      // Quarter-turn latches (2)
      for(let lt=0;lt<2;lt++){
        // Latch body
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.04,8),M.steel).translateX(cbX+.35).translateY(3.35+lt*.4).translateZ(cbZ-.26).rotateX(Math.PI/2));
        // Latch handle
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.06,.015,.02),M.steel).translateX(cbX+.35).translateY(3.35+lt*.4).translateZ(cbZ-.28));
      }
      
      // Padlock hasp
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.04,.1,.02),M.steel).translateX(cbX+.35).translateY(3.55).translateZ(cbZ-.27));
      
      // ═══ FRONT PANEL DETAILS ═══
      // Manufacturer logo plate
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.35,.08,.002),M.white).translateX(cbX-.15).translateY(3.85).translateZ(cbZ-.252));
      
      // Rating/data plate
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.25,.15,.002),
        new THREE.MeshStandardMaterial({color:0xd0d0d0,roughness:.3,metalness:.5})).translateX(cbX+.25).translateY(3.25).translateZ(cbZ-.252));
      
      // ═══ STATUS INDICATORS ═══
      // Monitoring module window
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.4,.12,.01),
        new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.1,metalness:.3})).translateX(cbX-.1).translateY(3.7).translateZ(cbZ-.252));
      
      // String status LEDs (8 inputs shown)
      for(let led=0;led<8;led++){
        const ledColor = led < 7 ? 0x22dd44 : 0xffaa00; // One amber for visual interest
        sc.add(new THREE.Mesh(new THREE.SphereGeometry(.012,6,6),
          new THREE.MeshBasicMaterial({color:ledColor})).translateX(cbX-.28+led*.045).translateY(3.7).translateZ(cbZ-.26));
      }
      
      // ═══ SAFETY LABELS ═══
      // Arc flash warning (orange)
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.2,.12,.002),
        new THREE.MeshStandardMaterial({color:0xff6600,roughness:.5,metalness:.1})).translateX(cbX-.25).translateY(3.4).translateZ(cbZ-.252));
      
      // High voltage warning (yellow)
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.15,.1,.002),M.warn).translateX(cbX+.05).translateY(3.4).translateZ(cbZ-.252));
      
      // ═══ CABLE ENTRIES ═══
      // Bottom cable glands (liquidtight connectors) - 8 DC inputs
      for(let g=0;g<8;g++){
        // Gland body
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.022,.028,.08,8),
          new THREE.MeshStandardMaterial({color:0x404040,roughness:.5,metalness:.4})).translateX(cbX-.35+g*.1).translateY(3.12).translateZ(cbZ));
        // Gland nut
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.02,6),M.steel).translateX(cbX-.35+g*.1).translateY(3.06).translateZ(cbZ));
        // Input cable (coming from ground)
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.6,4),wireRed).translateX(cbX-.35+g*.1).translateY(2.78).translateZ(cbZ));
      }
      
      // Output cable glands (bottom, larger for combined output)
      for(let out=0;out<2;out++){
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.035,.04,.1,8),
          new THREE.MeshStandardMaterial({color:0x404040,roughness:.5,metalness:.4})).translateX(cbX-.08+out*.16).translateY(3.1).translateZ(cbZ+.18));
        // Output cables
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.65,6),
          out===0?wireRed:wireBlack).translateX(cbX-.08+out*.16).translateY(2.75).translateZ(cbZ+.18));
      }
      
      // ═══ GROUNDING ═══
      // Ground lug (green/yellow)
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.05,.03,.03),
        new THREE.MeshStandardMaterial({color:0x44aa44,roughness:.4,metalness:.5})).translateX(cbX+.42).translateY(3.2).translateZ(cbZ));
      // Ground wire down pole
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,2.5,4),
        new THREE.MeshStandardMaterial({color:0x00aa00,roughness:.5,metalness:.3})).translateX(cbX+.08).translateY(2.0).translateZ(cbZ+.05));
      
      // ═══ SURGE PROTECTION ═══
      // SPD module on side
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.08,.15,.06),
        new THREE.MeshStandardMaterial({color:0x2255aa,roughness:.4,metalness:.35})).translateX(cbX+.5).translateY(3.55).translateZ(cbZ));
      sc.add(new THREE.Mesh(new THREE.SphereGeometry(.012,5,5),M.led).translateX(cbX+.5).translateY(3.65).translateZ(cbZ-.03));
    }
    
    // ═══ DC OUTPUT TRENCH TO INVERTER ═══
    const trenchLen=CIX-cbX;
    // Main trench
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(trenchLen,.04,2.5),
      new THREE.MeshStandardMaterial({color:0x5a5045,roughness:.9,metalness:0})).translateX(cbX+trenchLen/2).translateY(.02).translateZ(0));
    // Conduit runs in trench
    for(let run=0;run<3;run++){
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,trenchLen,6),conduitPVC).translateX(cbX+trenchLen/2).translateY(.08).translateZ(-.6+run*.6).rotateZ(Math.PI/2));
    }
    
  }else if(comb==='lbds'){
    // ═══ LBDs (LOAD BREAK DISCONNECTS) ═══
    // Large DC disconnect enclosures
    // Aggregate trunk bus feeds before inverters
    // Include visible disconnect handles and safety equipment
    
    const nLBD=6;
    const lbdX=CE+12;
    
    for(let i=0;i<nLBD;i++){
      const lbdZ=Z0+4+(i/(nLBD-1))*(ROWS-2)*RS;
      
      // Concrete equipment pad
      gpad(lbdX,lbdZ,5,4);
      
      // LBD enclosure (large industrial cabinet)
      const lbdBody=new THREE.Mesh(new THREE.BoxGeometry(1.8,2.2,1.3),
        new THREE.MeshStandardMaterial({color:0x3a3a3a,roughness:.4,metalness:.55}));
      lbdBody.position.set(lbdX,1.2,lbdZ);lbdBody.castShadow=true;sc.add(lbdBody);
      
      // Ventilation louvers (top)
      for(let v=0;v<5;v++){
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.4,.05,.02),M.invD).translateX(lbdX).translateY(1.85+v*.1).translateZ(lbdZ-.67));
      }
      
      // Main disconnect handle (RED - visible safety feature)
      const handleGrp=new THREE.Group();
      const handleBase=new THREE.Mesh(new THREE.BoxGeometry(.2,.12,.08),M.steel);
      handleBase.position.set(.75,1.5,-.6);handleGrp.add(handleBase);
      const handleArm=new THREE.Mesh(new THREE.BoxGeometry(.1,.55,.12),
        new THREE.MeshStandardMaterial({color:0xDD0000,roughness:.35,metalness:.4}));
      handleArm.position.set(.75,1.8,-.65);handleArm.rotation.z=-.25;handleGrp.add(handleArm);
      const handleGrip=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.18,8),
        new THREE.MeshStandardMaterial({color:0xDD0000,roughness:.4,metalness:.35}));
      handleGrip.rotation.x=Math.PI/2;handleGrip.position.set(.75,2.05,-.72);handleGrp.add(handleGrip);
      handleGrp.position.set(lbdX,0,lbdZ);sc.add(handleGrp);
      
      // Position indicator (ON/OFF)
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.15,.25,.02),
        new THREE.MeshStandardMaterial({color:0x00aa00,roughness:.3,metalness:.2})).translateX(lbdX+.55).translateY(1.4).translateZ(lbdZ-.67));
      
      // Warning stripes (yellow/black)
      for(let w=0;w<4;w++){
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.82,.06,.01),M.warn).translateX(lbdX).translateY(.3+w*.55).translateZ(lbdZ-.67));
      }
      
      // Arc flash warning label
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.5,.35,.01),
        new THREE.MeshStandardMaterial({color:0xff6600,roughness:.5,metalness:.1})).translateX(lbdX-.45).translateY(1.9).translateZ(lbdZ-.67));
      
      // Nameplate
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.6,.2,.01),M.white).translateX(lbdX-.4).translateY(.7).translateZ(lbdZ-.67));
      
      // Cable entry points (bottom)
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.15,8),M.steel).translateX(lbdX-.5).translateY(.08).translateZ(lbdZ));
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.15,8),M.steel).translateX(lbdX+.5).translateY(.08).translateZ(lbdZ));
      
      // Output conduit to inverter
      const outConduit=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,CIX-lbdX-8,6),M.dc);
      outConduit.rotation.z=Math.PI/2;outConduit.position.set((lbdX+CIX)/2,.2,lbdZ);sc.add(outConduit);
    }
  }
  // comb==='none' — DC goes directly to inverter (distributed configs)

  // ─── INVERTERS ───
  const IX=CIX; // Use centralized position variable
  
  if(inv==='distributed'){
    // ═══ DISTRIBUTED STRING INVERTERS ═══
    // Commercial string inverters (like SMA Sunny Tripower 50/60)
    // Mounted on galvanized steel stands near each tracker row pair
    // DC combining happens INSIDE the inverter (4-6 MPPT inputs)
    
    for(let r=0;r<ROWS;r+=2){
      const rz=Z0+r*RS+RS/2;
      const ix=DIX; // West side of array
      
      // ═══ EQUIPMENT PAD ═══
      gpad(ix,rz,5,4);
      
      // Concrete equipment pad edge/curb
      const padEdge=new THREE.Mesh(new THREE.BoxGeometry(5.2,.15,4.2),
        new THREE.MeshStandardMaterial({color:0x888880,roughness:.85,metalness:.05}));
      padEdge.position.set(ix,.075,rz);sc.add(padEdge);
      
      // ═══ INVERTER MOUNTING STAND ═══
      // Galvanized steel unistrut frame
      const standMat=new THREE.MeshStandardMaterial({color:0x8a9090,roughness:.35,metalness:.75});
      // Vertical posts (4 corners)
      for(let p=0;p<4;p++){
        const px=ix+((p%2)-.5)*1.4;
        const pz=rz+((Math.floor(p/2))-.5)*.6;
        const post=new THREE.Mesh(new THREE.BoxGeometry(.06,1.6,.06),standMat);
        post.position.set(px,.85,pz);post.castShadow=true;sc.add(post);
        // Base plate
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.15,.02,.15),standMat).translateX(px).translateY(.12).translateZ(pz));
        // Anchor bolt
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.08,6),M.steel).translateX(px).translateY(.08).translateZ(pz));
      }
      // Horizontal rails (top)
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.5,.05,.05),standMat).translateX(ix).translateY(1.62).translateZ(rz-.28));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.5,.05,.05),standMat).translateX(ix).translateY(1.62).translateZ(rz+.28));
      // Cross bracing
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.04,.04,.7),standMat).translateX(ix-.65).translateY(.9).translateZ(rz));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.04,.04,.7),standMat).translateX(ix+.65).translateY(.9).translateZ(rz));
      
      // ═══ INVERTER ENCLOSURE ═══
      const invBody=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.0,.55),M.inv);
      invBody.position.set(ix,1.15,rz);invBody.castShadow=true;sc.add(invBody);
      
      // Heat sink fins (extruded aluminum - both sides)
      for(let f=0;f<15;f++){
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.018,.85,.52),M.invD).translateX(ix+.58+f*.008).translateY(1.15).translateZ(rz));
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.018,.85,.52),M.invD).translateX(ix-.58-f*.008).translateY(1.15).translateZ(rz));
      }
      
      // Front panel (powder coated steel)
      const frontPanel=new THREE.Mesh(new THREE.BoxGeometry(1.25,.92,.02),
        new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.2,metalness:.5}));
      frontPanel.position.set(ix,1.15,rz-.285);sc.add(frontPanel);
      
      // LCD display with bezel
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.48,.28,.015),
        new THREE.MeshStandardMaterial({color:0x151515,roughness:.15,metalness:.4})).translateX(ix-.25).translateY(1.28).translateZ(rz-.295));
      // LCD screen (slight blue glow)
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.42,.22,.005),
        new THREE.MeshStandardMaterial({color:0x0a2848,roughness:.05,metalness:.1,emissive:0x051525,emissiveIntensity:.3})).translateX(ix-.25).translateY(1.28).translateZ(rz-.3));
      
      // Status LED indicators (5 LEDs with labels)
      const ledData=[{c:0x22dd44,l:'RUN'},{c:0x22dd44,l:'GRID'},{c:0x22dd44,l:'DC'},{c:0x2288ff,l:'COM'},{c:0xffaa00,l:'WARN'}];
      for(let l=0;l<5;l++){
        // LED
        sc.add(new THREE.Mesh(new THREE.SphereGeometry(.015,6,6),
          new THREE.MeshBasicMaterial({color:ledData[l].c})).translateX(ix-.38+l*.09).translateY(1.52).translateZ(rz-.295));
        // LED housing ring
        sc.add(new THREE.Mesh(new THREE.TorusGeometry(.018,.004,6,12),
          new THREE.MeshStandardMaterial({color:0x333333,roughness:.3,metalness:.6})).translateX(ix-.38+l*.09).translateY(1.52).translateZ(rz-.295));
      }
      
      // DC Disconnect switch (RED rotary handle)
      const dcDisc=new THREE.Group();
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.14,.18,.03),
        new THREE.MeshStandardMaterial({color:0x2a2a2a,roughness:.4,metalness:.45})).translateX(ix-.48).translateY(1.05).translateZ(rz-.295));
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.025,12),
        new THREE.MeshStandardMaterial({color:0xcc0000,roughness:.35,metalness:.4})).translateX(ix-.48).translateY(1.05).translateZ(rz-.31).rotateX(Math.PI/2));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.06,.02,.04),
        new THREE.MeshStandardMaterial({color:0xcc0000,roughness:.35,metalness:.4})).translateX(ix-.48).translateY(1.08).translateZ(rz-.32));
      // "DC DISCONNECT" label
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.12,.03,.002),M.warn).translateX(ix-.48).translateY(.93).translateZ(rz-.296));
      
      // AC Disconnect switch (BLACK handle)
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.14,.18,.03),
        new THREE.MeshStandardMaterial({color:0x2a2a2a,roughness:.4,metalness:.45})).translateX(ix+.48).translateY(1.05).translateZ(rz-.295));
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.025,12),
        new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.35,metalness:.4})).translateX(ix+.48).translateY(1.05).translateZ(rz-.31).rotateX(Math.PI/2));
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.06,.02,.04),
        new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.35,metalness:.4})).translateX(ix+.48).translateY(1.08).translateZ(rz-.32));
      
      // Manufacturer logo plate
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.35,.08,.002),M.white).translateX(ix+.3).translateY(.78).translateZ(rz-.296));
      
      // Rating/nameplate
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.25,.12,.002),
        new THREE.MeshStandardMaterial({color:0xc0c0c0,roughness:.3,metalness:.6})).translateX(ix-.3).translateY(.78).translateZ(rz-.296));
      
      // ═══ DC INPUT CONDUITS (from string homeruns) ═══
      const nInputs=Math.min(nStringsPerRow,6);
      for(let d=0;d<Math.min(nInputs,6);d++){
        // PVC conduit stub-up from ground
        const condX=ix-.4+d*.15;
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.45,6),conduitPVC).translateX(condX).translateY(.32).translateZ(rz+.15));
        // Conduit connector (liquidtight)
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.032,.028,.06,8),M.steel).translateX(condX).translateY(.56).translateZ(rz+.15));
        // Flex conduit to inverter bottom
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.18,6),conduitGray).translateX(condX).translateY(.66).translateZ(rz+.05).rotateX(.4));
      }
      
      // ═══ AC OUTPUT CONDUIT ═══
      // Rigid metal conduit from inverter to AC trench
      const acCondLen=3;
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,acCondLen,8),conduitGray).translateX(ix+acCondLen/2+1).translateY(.25).translateZ(rz).rotateZ(Math.PI/2));
      // Conduit supports
      for(let cs=0;cs<2;cs++){
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.06,.15,.1),standMat).translateX(ix+1.5+cs*1.2).translateY(.18).translateZ(rz));
      }
      // LB conduit body (junction)
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.08),conduitGray).translateX(ix+.7).translateY(.62).translateZ(rz));
      // Vertical conduit from inverter to LB
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.35,6),conduitGray).translateX(ix+.7).translateY(.42).translateZ(rz));
      
      // ═══ SURGE PROTECTION DEVICE ═══
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.12,.18,.08),
        new THREE.MeshStandardMaterial({color:0x2255aa,roughness:.4,metalness:.35})).translateX(ix+.2).translateY(1.05).translateZ(rz+.25));
      sc.add(new THREE.Mesh(new THREE.SphereGeometry(.015,5,5),M.led).translateX(ix+.2).translateY(1.16).translateZ(rz+.21));
    }
    
    // ═══ AC COLLECTION TRENCH (runs east to AC panel) ═══
    const acTrenchMat=new THREE.MeshStandardMaterial({color:0x5a5045,roughness:.88,metalness:0});
    for(let r=0;r<ROWS;r+=2){
      const rz=Z0+r*RS+RS/2;
      // Individual AC run from each inverter
      const acRunLen=IX-DIX-20;
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(acRunLen,.025,1),acTrenchMat).translateX(DIX+5+acRunLen/2).translateY(.015).translateZ(rz));
      // AC cable (480V 3-phase)
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,acRunLen,6),M.ac).translateX(DIX+5+acRunLen/2).translateY(.08).translateZ(rz).rotateZ(Math.PI/2));
    }
    // Main AC collection trench (north-south)
    const mainAcTrench=new THREE.Mesh(new THREE.BoxGeometry(2,.03,ROWS*RS+8),acTrenchMat);
    mainAcTrench.position.set(IX-18,.015,0);sc.add(mainAcTrench);
    // Main AC conduit bundle
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,ROWS*RS+6,8),M.ac).translateX(IX-18).translateY(.15));
    
    // ═══ AC COLLECTION PANEL / RECOMBINER ═══
    gpad(IX-12,0,12,16);
    
    // AC recombiner enclosure (NEMA 3R outdoor)
    const acPanel=new THREE.Mesh(new THREE.BoxGeometry(4,2.8,1.6),
      new THREE.MeshStandardMaterial({color:0x454545,roughness:.4,metalness:.55}));
    acPanel.position.set(IX-12,1.5,0);acPanel.castShadow=true;sc.add(acPanel);
    
    // Panel doors (2 sections)
    for(let door=0;door<2;door++){
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.8,2.5,.03),
        new THREE.MeshStandardMaterial({color:0x3a3a3a,roughness:.35,metalness:.5})).translateX(IX-12.9+door*1.9).translateY(1.4).translateZ(-.82));
      // Door handles
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.08,.25,.06),M.steel).translateX(IX-12.1+door*1.9).translateY(1.4).translateZ(-.86));
      // Padlock hasps
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.06,.12,.03),M.steel).translateX(IX-12.1+door*1.9).translateY(1.0).translateZ(-.86));
    }
    
    // Ventilation louvers (top)
    for(let v=0;v<6;v++){
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(3.5,.06,.02),M.invD).translateX(IX-12).translateY(2.55+v*.08).translateZ(-.82));
    }
    
    // Status indicators
    for(let l=0;l<4;l++){
      sc.add(new THREE.Mesh(new THREE.SphereGeometry(.025,6,6),M.led).translateX(IX-13.5+l*.35).translateY(2.65).translateZ(-.84));
    }
    
    // Warning label
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(.6,.25,.01),M.warn).translateX(IX-11).translateY(2.0).translateZ(-.82));
    
    // Nameplate
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(.8,.2,.01),M.white).translateX(IX-12.8).translateY(.5).translateZ(-.82));
    
    // AC output to step-up transformer
    const toXfmr=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,12,8),M.ac);
    toXfmr.rotation.z=Math.PI/2;toXfmr.position.set(IX-6,.2,0);sc.add(toXfmr);
    
    // ═══ STEP-UP TRANSFORMER (480V to 34.5kV) ═══
    gpad(IX+5,0,14,12);
    
    // Transformer pad
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(10,.4,8),M.conc).translateX(IX+5).translateY(.2).translateZ(0));
    
    // Transformer tank
    const stepUpTx=new THREE.Mesh(new THREE.BoxGeometry(5,3.5,3.5),M.tx);
    stepUpTx.position.set(IX+5,2.0,0);stepUpTx.castShadow=true;sc.add(stepUpTx);
    
    // Transformer cooling radiators
    for(let side=-1;side<=1;side+=2){
      for(let f=0;f<8;f++){
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.06,2.8,.08),M.txFin).translateX(IX+7.8+f*.18).translateY(1.8).translateZ(side*2));
      }
    }
    
    // Conservator tank
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,3,10),M.tx).translateX(IX+5).translateY(4.5).translateZ(0).rotateZ(Math.PI/2));
    
    // HV bushings
    for(let b=0;b<3;b++){
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,2,10),
        new THREE.MeshStandardMaterial({color:0xDDCCA0,roughness:.35,metalness:.2})).translateX(IX+4+b*1).translateY(4.8).translateZ(-2.2));
      for(let shed=0;shed<4;shed++){
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.22,.18,.08,12),
          new THREE.MeshStandardMaterial({color:0xDDCCA0,roughness:.35,metalness:.2})).translateX(IX+4+b*1).translateY(4.0+shed*.45).translateZ(-2.2));
      }
    }
    
    // LV bushings
    for(let b=0;b<3;b++){
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,1.2,8),
        new THREE.MeshStandardMaterial({color:0xDDCCA0,roughness:.35,metalness:.2})).translateX(IX+4+b*1).translateY(4.2).translateZ(2.2));
    }
    
  }else if(inv==='centralized-cluster'){
    // ═══ CENTRALIZED STRING INVERTER CLUSTERS ═══
    // String inverters grouped on common skid/pad
    // 6 inverter units arranged 2 rows × 3 columns
    // Includes MV step-up transformer
    
    gpad(IX,0,40,32);
    
    // Inverter skids (6 units in 2×3 arrangement)
    for(let row=0;row<2;row++){
      for(let col=0;col<3;col++){
        const skidX=IX-12+col*12;
        const skidZ=-8+row*16;
        
        // Main inverter cabinet
        const cabinet=new THREE.Mesh(new THREE.BoxGeometry(6.5,3.0,3.5),M.inv);
        cabinet.position.set(skidX,1.6,skidZ);cabinet.castShadow=true;sc.add(cabinet);
        
        // Vertical cooling fins
        for(let f=0;f<14;f++){
          sc.add(new THREE.Mesh(new THREE.BoxGeometry(.04,2.7,3.52),M.invD).translateX(skidX-2.8+f*.45).translateY(1.6).translateZ(skidZ));
        }
        
        // Control panel section (door)
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.4,2.4,.04),
          new THREE.MeshStandardMaterial({color:0x252525,roughness:.3,metalness:.45})).translateX(skidX-2.0).translateY(1.4).translateZ(skidZ-1.78));
        
        // HMI touchscreen
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.7,.5,.02),
          new THREE.MeshStandardMaterial({color:0x0a2040,roughness:.05,metalness:.1})).translateX(skidX-2.0).translateY(2.0).translateZ(skidZ-1.8));
        
        // Ventilation louver panel
        for(let v=0;v<4;v++){
          sc.add(new THREE.Mesh(new THREE.BoxGeometry(4,.08,.03),M.invD).translateX(skidX+.8).translateY(2.5+v*.15).translateZ(skidZ-1.78));
        }
        
        // Status beacon (tower light)
        const beacon=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.2,8),M.led);
        beacon.position.set(skidX+2.8,3.25,skidZ-1.5);sc.add(beacon);
        
        // AC output terminal box
        sc.add(new THREE.Mesh(new THREE.BoxGeometry(.9,.7,.6),M.comb).translateX(skidX+2.5).translateY(.45).translateZ(skidZ+1.5));
      }
    }
    
    // Medium voltage transformer (step-up)
    const mvtX=IX+12;
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(.15,4,.15),M.conc).translateX(mvtX).translateY(0).translateZ(0));
    const mvt=new THREE.Mesh(new THREE.BoxGeometry(4.5,3.2,2.8),M.tx);
    mvt.position.set(mvtX,1.7,0);mvt.castShadow=true;sc.add(mvt);
    // Transformer cooling radiators
    for(let f=0;f<8;f++){
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.1,2.5,2.85),M.txFin).translateX(mvtX+2.5+f*.22).translateY(1.7).translateZ(0));
    }
    // HV bushings
    const bushMat=new THREE.MeshStandardMaterial({color:0xE0D4B0,roughness:.35,metalness:.15});
    for(let b=0;b<3;b++){
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12,.16,1.8,8),bushMat).translateX(mvtX-1+b*1).translateY(4.2).translateZ(0));
    }
    
  }else if(inv==='central'){
    // ═══ CENTRAL INVERTER ═══
    // Large single inverter station
    // Utility-scale central inverter building
    // Typically 2-4 MW capacity per unit
    
    gpad(IX,0,36,26);
    
    // Main inverter building/enclosure
    const invBldg=new THREE.Mesh(new THREE.BoxGeometry(22,5.5,12),M.inv);
    invBldg.position.set(IX,2.85,0);invBldg.castShadow=true;sc.add(invBldg);
    
    // Cooling fins (full length)
    for(let f=0;f<20;f++){
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.05,5.0,12.02),M.invD).translateX(IX-9.5+f*1.0).translateY(2.85).translateZ(0));
    }
    
    // Access doors (3 along front)
    for(let d=0;d<3;d++){
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(2.0,3.5,.06),
        new THREE.MeshStandardMaterial({color:0x252525,roughness:.35,metalness:.4})).translateX(IX-7+d*7).translateY(1.85).translateZ(-6.04));
      // Door handles
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.3,4),M.steel).translateX(IX-7+d*7+.7).translateY(1.7).translateZ(-6.08));
    }
    
    // Roof-mounted cooling units (6 units)
    for(let c=0;c<6;c++){
      const cuX=IX-8+c*3.2;
      const cu=new THREE.Mesh(new THREE.BoxGeometry(2.8,1.4,2.8),
        new THREE.MeshStandardMaterial({color:0x454545,roughness:.35,metalness:.5}));
      cu.position.set(cuX,6.3,0);cu.castShadow=true;sc.add(cu);
      // Fan shroud
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.95,.95,.12,16),
        new THREE.MeshStandardMaterial({color:0x555555,roughness:.3,metalness:.55})).translateX(cuX).translateY(7.05).translateZ(0));
    }
    
    // Control room section (attached)
    const ctrlRoom=new THREE.Mesh(new THREE.BoxGeometry(6,5,5),M.bldg);
    ctrlRoom.position.set(IX+14,2.6,0);ctrlRoom.castShadow=true;sc.add(ctrlRoom);
    // Control room window
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.5,1.8,.06),
      new THREE.MeshStandardMaterial({color:0x88AACC,roughness:.1,metalness:.2,transparent:true,opacity:.6})).translateX(IX+14).translateY(3.0).translateZ(-2.54));
    // Control room door
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.2,2.4,.06),
      new THREE.MeshStandardMaterial({color:0x445566,roughness:.5,metalness:.35})).translateX(IX+16.5).translateY(1.3).translateZ(-2.54));
    
    // DC input cable tray (from combiners/LBDs)
    const dcTray=new THREE.Mesh(new THREE.BoxGeometry(CE,.25,2.5),
      new THREE.MeshStandardMaterial({color:0x505050,roughness:.55,metalness:.4}));
    dcTray.position.set(IX-CE/2-.5,.15,7);sc.add(dcTray);
    
    // AC output to substation (large cables)
    const acMain=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,20,8),M.ac);
    acMain.rotation.z=Math.PI/2;acMain.position.set(IX+27,.25,0);sc.add(acMain);
  }

  // ─── SUBSTATION ───
  const SX=IX+55,SZ=-35;
  gpad(SX,SZ,50,45);
  
  // ═══ SUBSTATION GRAVEL BASE ═══
  const subGravel=new THREE.Mesh(new THREE.BoxGeometry(48,.08,42),
    new THREE.MeshStandardMaterial({color:0x9a9085,roughness:.9,metalness:0}));
  subGravel.position.set(SX,.04,SZ);subGravel.receiveShadow=true;sc.add(subGravel);
  
  // ═══ MAIN POWER TRANSFORMER (34.5kV/115kV) ═══
  // Concrete foundation with oil containment
  const txFoundation=new THREE.Mesh(new THREE.BoxGeometry(14,1.2,12),M.conc);
  txFoundation.position.set(SX,.6,SZ);sc.add(txFoundation);
  // Oil containment berm
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(16,.3,14),
    new THREE.MeshStandardMaterial({color:0x888880,roughness:.85,metalness:.05})).translateX(SX).translateY(.15).translateZ(SZ));
  
  // Transformer main tank
  const txfTank=new THREE.Mesh(new THREE.BoxGeometry(8,7,6),M.tx);
  txfTank.position.set(SX,4.7,SZ);txfTank.castShadow=true;sc.add(txfTank);
  
  // Transformer tank details (welds, ribs)
  for(let rib=0;rib<5;rib++){
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(8.02,.08,.15),M.tx).translateX(SX).translateY(2+rib*1.4).translateZ(SZ-3.02));
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(8.02,.08,.15),M.tx).translateX(SX).translateY(2+rib*1.4).translateZ(SZ+3.02));
  }
  
  // Transformer cooling radiators (ONAN type)
  for(let side=-1;side<=1;side+=2){
    // Radiator bank housing
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(3,.3,2.2),M.txFin).translateX(SX+5.8).translateY(5).translateZ(SZ+side*3.2));
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(3,.3,2.2),M.txFin).translateX(SX+5.8).translateY(2).translateZ(SZ+side*3.2));
    // Individual radiator fins
    for(let f=0;f<12;f++){
      const fin=new THREE.Mesh(new THREE.BoxGeometry(.08,5.5,.08),M.txFin);
      fin.position.set(SX+4.5+f*.22,4,SZ+side*3.2);sc.add(fin);
    }
    // Oil headers (top and bottom pipes)
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,3,8),M.tx).translateX(SX+5.8).translateY(6.8).translateZ(SZ+side*3.2).rotateZ(Math.PI/2));
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,3,8),M.tx).translateX(SX+5.8).translateY(1.5).translateZ(SZ+side*3.2).rotateZ(Math.PI/2));
  }
  
  // Conservator tank (oil expansion) with accessories
  const consv=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,5,12),M.tx);
  consv.rotation.z=Math.PI/2;consv.position.set(SX,9.5,SZ);consv.castShadow=true;sc.add(consv);
  // Conservator end caps
  sc.add(new THREE.Mesh(new THREE.SphereGeometry(.6,10,10,0,Math.PI),M.tx).translateX(SX-2.5).translateY(9.5).translateZ(SZ).rotateZ(-Math.PI/2));
  sc.add(new THREE.Mesh(new THREE.SphereGeometry(.6,10,10,0,Math.PI),M.tx).translateX(SX+2.5).translateY(9.5).translateZ(SZ).rotateZ(Math.PI/2));
  // Buchholz relay
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.4,8),M.steel).translateX(SX-1).translateY(8.8).translateZ(SZ));
  // Oil level indicator
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(.2,.3,.15),M.white).translateX(SX+1.5).translateY(9.8).translateZ(SZ-.62));
  
  // ═══ HV BUSHINGS (115kV side) ═══
  const bushM=new THREE.MeshStandardMaterial({color:0xE0D4B8,roughness:.32,metalness:.18});
  for(let b=0;b<3;b++){
    const bx=SX-1.8+b*1.8;
    // Main bushing column
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.18,.25,4.5,12),bushM).translateX(bx).translateY(10.5).translateZ(SZ-3.5));
    // Bushing sheds (porcelain skirts)
    for(let s=0;s<8;s++){
      const shedR=.4-.02*s;
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(shedR,shedR-.05,.12,14),bushM).translateX(bx).translateY(8.5+s*.55).translateZ(SZ-3.5));
    }
    // Bushing top terminal
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.3,8),M.steel).translateX(bx).translateY(13).translateZ(SZ-3.5));
  }
  
  // ═══ LV BUSHINGS (34.5kV side) ═══
  for(let b=0;b<3;b++){
    const bx=SX-1.8+b*1.8;
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,2.5,10),bushM).translateX(bx).translateY(9.5).translateZ(SZ+4));
    for(let s=0;s<4;s++){
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.28,.24,.1,12),bushM).translateX(bx).translateY(8.5+s*.5).translateZ(SZ+4));
    }
  }
  
  // ═══ TRANSFORMER NAMEPLATE & ACCESSORIES ═══
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(1,.6,.02),M.white).translateX(SX-3.5).translateY(3).translateZ(SZ-3.02));
  // Pressure relief device
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.15,.12,.25,8),M.steel).translateX(SX+3).translateY(8.2).translateZ(SZ-2.8));
  // Temperature gauges
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.08,10),M.white).translateX(SX-2.5).translateY(5).translateZ(SZ-3.05));
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.08,10),M.white).translateX(SX-2).translateY(5).translateZ(SZ-3.05));
  
  // ═══ SWITCHGEAR / RELAY BUILDING ═══
  const swgBldg=new THREE.Mesh(new THREE.BoxGeometry(8,4,5),M.bldg);
  swgBldg.position.set(SX-16,2.1,SZ);swgBldg.castShadow=true;sc.add(swgBldg);
  // Roof
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(8.4,.2,5.4),M.roof).translateX(SX-16).translateY(4.2).translateZ(SZ));
  // Door
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.2,2.8,.06),
    new THREE.MeshStandardMaterial({color:0x445566,roughness:.45,metalness:.4})).translateX(SX-16).translateY(1.5).translateZ(SZ-2.54));
  // Door handle
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.2,4),M.steel).translateX(SX-15.4).translateY(1.5).translateZ(SZ-2.58));
  // Windows
  for(let w=0;w<2;w++){
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.2,1,.06),
      new THREE.MeshStandardMaterial({color:0x88AACC,roughness:.1,metalness:.2,transparent:true,opacity:.6})).translateX(SX-18+w*4).translateY(2.8).translateZ(SZ-2.54));
  }
  // HVAC unit
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.5,1,1.2),
    new THREE.MeshStandardMaterial({color:0x888888,roughness:.4,metalness:.5})).translateX(SX-12.5).translateY(.6).translateZ(SZ+2));
  
  // ═══ HIGH VOLTAGE BUS STRUCTURE ═══
  const busColors=[0xCC0000,0xFFCC00,0x0066CC]; // R-Y-B phase colors
  
  // A-frame bus supports
  for(let sup=0;sup<4;sup++){
    const supX=SX-12+sup*6;
    // Steel columns
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,10,6),M.steel).translateX(supX-.8).translateY(5).translateZ(SZ-8));
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,10,6),M.steel).translateX(supX+.8).translateY(5).translateZ(SZ-8));
    // Cross beam
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(2,.2,.2),M.steel).translateX(supX).translateY(10).translateZ(SZ-8));
    // Diagonal bracing
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,4,4),M.steel).translateX(supX).translateY(7).translateZ(SZ-8).rotateZ(.4));
  }
  
  // 3-phase bus bars
  for(let phase=0;phase<3;phase++){
    const busBar=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,24,6),
      new THREE.MeshStandardMaterial({color:busColors[phase],roughness:.25,metalness:.75}));
    busBar.rotation.z=Math.PI/2;busBar.position.set(SX,10.5+phase*.8,SZ-8-phase*.5);sc.add(busBar);
    
    // Suspension insulators
    for(let ins=0;ins<4;ins++){
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,.6,8),bushM).translateX(SX-12+ins*6).translateY(10+phase*.8).translateZ(SZ-8-phase*.5));
    }
  }
  
  // ═══ CIRCUIT BREAKERS (SF6) ═══
  for(let cb=0;cb<2;cb++){
    const cbX=SX-6+cb*10;
    const cbZ=SZ+12;
    
    // Breaker foundation
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(3,.4,2),M.conc).translateX(cbX).translateY(.2).translateZ(cbZ));
    
    // Breaker tank/mechanism
    const cbTank=new THREE.Mesh(new THREE.BoxGeometry(2,2.8,1.5),
      new THREE.MeshStandardMaterial({color:0x4a4a4a,roughness:.4,metalness:.55}));
    cbTank.position.set(cbX,1.8,cbZ);cbTank.castShadow=true;sc.add(cbTank);
    
    // Breaker operating mechanism
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(1,1.2,.8),M.comb).translateX(cbX).translateY(.9).translateZ(cbZ-.9));
    
    // Breaker bushings (3 phase)
    for(let bp=0;bp<3;bp++){
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.1,.14,1.5,8),bushM).translateX(cbX-.6+bp*.6).translateY(3.8).translateZ(cbZ));
    }
    
    // Nameplate
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(.5,.3,.01),M.white).translateX(cbX).translateY(1.5).translateZ(cbZ-.77));
  }
  
  // ═══ DISCONNECT SWITCHES ═══
  for(let ds=0;ds<3;ds++){
    const dsX=SX+8;
    const dsZ=SZ-6+ds*6;
    // Switch base
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(.8,.4,.6),M.conc).translateX(dsX).translateY(.2).translateZ(dsZ));
    // Insulator stack
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.1,.14,2,8),bushM).translateX(dsX).translateY(1.4).translateZ(dsZ));
    // Switch blade (open position)
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(.08,1.5,.04),M.steel).translateX(dsX).translateY(2.8).translateZ(dsZ).rotateZ(.6));
  }
  
  // ═══ AC CABLE TRENCH FROM INVERTER/TRANSFORMER ═══
  const acTrenchLen=SX-IX-20;
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(acTrenchLen,.08,2),
    new THREE.MeshStandardMaterial({color:0x5a5045,roughness:.88,metalness:0})).translateX(IX+10+acTrenchLen/2).translateY(.04).translateZ(SZ+20));
  // Cable tray covers
  for(let cov=0;cov<Math.floor(acTrenchLen/3);cov++){
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(2.8,.04,1.8),M.steel).translateX(IX+12+cov*3).translateY(.1).translateZ(SZ+20));
  }
  // Cables in trench
  for(let cab=0;cab<3;cab++){
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,acTrenchLen,6),M.ac).translateX(IX+10+acTrenchLen/2).translateY(.08).translateZ(SZ+19.4+cab*.3).rotateZ(Math.PI/2));
  }
  
  // ═══ TRANSMISSION STRUCTURES (DEAD-END) ═══
  for(let tower=0;tower<3;tower++){
    const tX=SX+22+tower*28;
    
    // Steel lattice tower (simplified)
    // Main legs
    for(let leg=0;leg<4;leg++){
      const legX=tX+((leg%2)-.5)*1.5;
      const legZ=SZ+((Math.floor(leg/2))-.5)*1.5;
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.08,.15,22,6),M.steel).translateX(legX).translateY(11).translateZ(legZ));
    }
    // Cross bracing (X pattern)
    for(let h=0;h<4;h++){
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,3.5,4),M.steel).translateX(tX).translateY(4+h*5).translateZ(SZ-.75).rotateY(Math.PI/4).rotateX(.5));
      sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,3.5,4),M.steel).translateX(tX).translateY(4+h*5).translateZ(SZ+.75).rotateY(-Math.PI/4).rotateX(.5));
    }
    // Cross arm
    const crossArm=new THREE.Mesh(new THREE.BoxGeometry(14,.25,.3),M.steel);
    crossArm.position.set(tX,21,SZ);crossArm.castShadow=true;sc.add(crossArm);
    // Vertical arm extensions
    for(let ext=-1;ext<=1;ext++){
      sc.add(new THREE.Mesh(new THREE.BoxGeometry(.2,2,.2),M.steel).translateX(tX+ext*5).translateY(22).translateZ(SZ));
    }
    
    // Strain insulators on cross arm
    for(let ins=0;ins<3;ins++){
      // Insulator string
      for(let disc=0;disc<6;disc++){
        sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.15,.12,.12,10),bushM).translateX(tX-5+ins*5).translateY(20-disc*.2).translateZ(SZ));
      }
    }
    
    // Transmission conductors (between towers)
    if(tower<2){
      for(let cond=0;cond<3;cond++){
        // Slight sag in conductor
        const condWire=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,28,4),
          new THREE.MeshBasicMaterial({color:0x333333}));
        condWire.rotation.z=Math.PI/2;
        condWire.position.set(tX+14,19.5-cond*.1,SZ-5+cond*5);
        sc.add(condWire);
      }
    }
  }
  
  // ═══ METERING EQUIPMENT ═══
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.5,2.2,1),
    new THREE.MeshStandardMaterial({color:0x606060,roughness:.4,metalness:.5})).translateX(SX-10).translateY(1.2).translateZ(SZ+8));
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(.4,.3,.02),M.white).translateX(SX-10).translateY(1.8).translateZ(SZ+7.48));
  
  // (Substation is within main site perimeter - no separate fence needed)

  // Site boundary reference (used for roads, buildings, vegetation placement)
  const F={x1:X0-22,x2:SX+75,z1:Z0-22,z2:-Z0+22};

  // ─── ROADS ───
  const rdT=mkGravelTex();rdT.repeat.set(1,15);
  const rd1=new THREE.Mesh(new THREE.PlaneGeometry(5,F.z2-F.z1+30),new THREE.MeshStandardMaterial({map:rdT,roughness:.8,metalness:0}));rd1.rotation.x=-Math.PI/2;rd1.position.set(F.x1-5,.07,0);rd1.receiveShadow=true;sc.add(rd1);
  const rdT2=mkGravelTex();rdT2.repeat.set(15,1);
  const rd2=new THREE.Mesh(new THREE.PlaneGeometry(F.x2-F.x1-10,4),new THREE.MeshStandardMaterial({map:rdT2,roughness:.8,metalness:0}));rd2.rotation.x=-Math.PI/2;rd2.position.set((F.x1+F.x2)/2,.06,F.z2-6);rd2.receiveShadow=true;sc.add(rd2);

  // ─── O&M BUILDING ───
  const omX=F.x1+12,omZ=F.z2-10;gpad(omX,omZ,16,12);
  const om=new THREE.Mesh(new THREE.BoxGeometry(12,3.8,8),M.bldg);om.position.set(omX,1.9,omZ);om.castShadow=true;sc.add(om);
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(12.4,.2,8.4),M.roof).translateX(omX).translateY(3.9).translateZ(omZ));
  for(let w=0;w<3;w++)sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.2,1.0,.06),new THREE.MeshStandardMaterial({color:0x88AACC,roughness:.1,metalness:.2,transparent:true,opacity:.6})).translateX(omX-4+w*3).translateY(2.2).translateZ(omZ-4.04));
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(1.6,2.6,.06),new THREE.MeshStandardMaterial({color:0x445566,roughness:.5,metalness:.3})).translateX(omX+3).translateY(1.3).translateZ(omZ-4.04));

  // ─── WEATHER STATION ───
  const wsX=F.x1+6,wsZ=F.z1+6;
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,7,6),M.steel).translateX(wsX).translateY(3.5).translateZ(wsZ));
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.06,10),M.white).translateX(wsX).translateY(7.1).translateZ(wsZ));
  sc.add(new THREE.Mesh(new THREE.SphereGeometry(.1,8,6,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.4,roughness:.05,metalness:.1})).translateX(wsX).translateY(7.16).translateZ(wsZ));
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(.4,.6,.25),M.white).translateX(wsX).translateY(2.2).translateZ(wsZ));
  const rc=new THREE.Mesh(new THREE.BoxGeometry(.8,.4,.025),M.pnl);rc.position.set(wsX+1.5,4.5,wsZ);rc.rotation.x=-TILT;sc.add(rc);

  // ─── PERIMETER FENCING ───
  // Chain-link fence with barbed wire (standard for solar farms)
  const fenceH=2.4; // 8 feet tall
  const fPosts=[];

  // North fence
  for(let fx=F.x1;fx<=F.x2;fx+=3){
    const post=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,fenceH,6),M.fP);
    post.position.set(fx,fenceH/2,F.z1);post.castShadow=true;sc.add(post);
    if(fx<F.x2){
      const panel=new THREE.Mesh(new THREE.PlaneGeometry(3,fenceH),M.fence);
      panel.position.set(fx+1.5,fenceH/2,F.z1);sc.add(panel);
    }
  }
  // South fence
  for(let fx=F.x1;fx<=F.x2;fx+=3){
    const post=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,fenceH,6),M.fP);
    post.position.set(fx,fenceH/2,F.z2);post.castShadow=true;sc.add(post);
    if(fx<F.x2){
      const panel=new THREE.Mesh(new THREE.PlaneGeometry(3,fenceH),M.fence);
      panel.position.set(fx+1.5,fenceH/2,F.z2);panel.rotation.y=Math.PI;sc.add(panel);
    }
  }
  // West fence
  for(let fz=F.z1;fz<=F.z2;fz+=3){
    const post=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,fenceH,6),M.fP);
    post.position.set(F.x1,fenceH/2,fz);post.castShadow=true;sc.add(post);
    if(fz<F.z2){
      const panel=new THREE.Mesh(new THREE.PlaneGeometry(3,fenceH),M.fence);
      panel.position.set(F.x1,fenceH/2,fz+1.5);panel.rotation.y=Math.PI/2;sc.add(panel);
    }
  }
  // East fence
  for(let fz=F.z1;fz<=F.z2;fz+=3){
    const post=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,fenceH,6),M.fP);
    post.position.set(F.x2,fenceH/2,fz);post.castShadow=true;sc.add(post);
    if(fz<F.z2){
      const panel=new THREE.Mesh(new THREE.PlaneGeometry(3,fenceH),M.fence);
      panel.position.set(F.x2,fenceH/2,fz+1.5);panel.rotation.y=-Math.PI/2;sc.add(panel);
    }
  }

  // Barbed wire on top of fence
  const bwMat=new THREE.MeshStandardMaterial({color:0x555555,roughness:.6,metalness:.7});
  for(let side=0;side<4;side++){
    const len=side%2===0?(F.x2-F.x1):(F.z2-F.z1);
    const bw=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,len,3),bwMat);
    if(side===0){bw.rotation.z=Math.PI/2;bw.position.set((F.x1+F.x2)/2,fenceH+.1,F.z1);}
    else if(side===1){bw.position.set(F.x2,fenceH+.1,(F.z1+F.z2)/2);}
    else if(side===2){bw.rotation.z=Math.PI/2;bw.position.set((F.x1+F.x2)/2,fenceH+.1,F.z2);}
    else{bw.position.set(F.x1,fenceH+.1,(F.z1+F.z2)/2);}
    sc.add(bw);
  }

  // Main entrance gate (south side)
  const gateX=(F.x1+F.x2)/2;
  const gateW=6; // Double gate
  // Gate posts (larger)
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,3,8),M.fP).translateX(gateX-gateW/2).translateY(1.5).translateZ(F.z2));
  sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,3,8),M.fP).translateX(gateX+gateW/2).translateY(1.5).translateZ(F.z2));
  // Gate frame
  const gateFrame=new THREE.Mesh(new THREE.BoxGeometry(gateW,.05,2.2),
    new THREE.MeshStandardMaterial({color:0x666666,roughness:.4,metalness:.75}));
  gateFrame.position.set(gateX,1.1,F.z2-.3);gateFrame.castShadow=true;sc.add(gateFrame);
  // Gate mesh panels
  sc.add(new THREE.Mesh(new THREE.PlaneGeometry(gateW/2-.2,2),M.fence).translateX(gateX-gateW/4).translateY(1.1).translateZ(F.z2-.3));
  sc.add(new THREE.Mesh(new THREE.PlaneGeometry(gateW/2-.2,2),M.fence).translateX(gateX+gateW/4).translateY(1.1).translateZ(F.z2-.3));

  // ─── SITE SIGNAGE ───
  // Main entrance sign
  const signPost=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,2.5,6),M.fP);
  signPost.position.set(gateX-4,1.25,F.z2+3);signPost.castShadow=true;sc.add(signPost);
  const signBoard=new THREE.Mesh(new THREE.BoxGeometry(3,1.5,.08),M.white);
  signBoard.position.set(gateX-4,2.3,F.z2+3);signBoard.castShadow=true;sc.add(signBoard);
  // Company logo area (blue)
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(2.8,.6,.01),
    new THREE.MeshStandardMaterial({color:0x2563EB,roughness:.3,metalness:.2})).translateX(gateX-4).translateY(2.6).translateZ(F.z2+3.05));

  // Warning signs around perimeter
  const warnSigns=[
    {x:F.x1+10,z:F.z1+.5,r:0},{x:F.x2-10,z:F.z1+.5,r:0},
    {x:F.x1+.5,z:0,r:Math.PI/2},{x:F.x2-.5,z:0,r:-Math.PI/2}
  ];
  warnSigns.forEach(ws=>{
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.8,6),M.fP).translateX(ws.x).translateY(.9).translateZ(ws.z));
    const wSign=new THREE.Mesh(new THREE.BoxGeometry(.6,.6,.02),M.warn);
    wSign.position.set(ws.x,1.6,ws.z);wSign.rotation.y=ws.r;sc.add(wSign);
    // "HIGH VOLTAGE" text area
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(.5,.15,.01),
      new THREE.MeshStandardMaterial({color:0x000000,roughness:.5})).translateX(ws.x).translateY(1.3).translateZ(ws.z+.015));
  });

  // ─── SITE LIGHTING ───
  // Light poles for nighttime security
  const lightPoles=[
    {x:F.x1+15,z:F.z2-10},{x:F.x2-15,z:F.z2-10},
    {x:F.x1+15,z:F.z1+10},{x:F.x2-15,z:F.z1+10},
    {x:gateX,z:F.z2+5}
  ];
  lightPoles.forEach(lp=>{
    // Pole
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,8,8),
      new THREE.MeshStandardMaterial({color:0x2a2a2a,roughness:.4,metalness:.6}));
    pole.position.set(lp.x,4,lp.z);pole.castShadow=true;sc.add(pole);
    // Pole base
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.15,.18,.3,8),M.conc).translateX(lp.x).translateY(.15).translateZ(lp.z));
    // Light fixture (LED)
    const fixture=new THREE.Mesh(new THREE.BoxGeometry(.4,.15,.25),
      new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.3,metalness:.5}));
    fixture.position.set(lp.x,7.9,lp.z);sc.add(fixture);
    // Light lens
    sc.add(new THREE.Mesh(new THREE.BoxGeometry(.35,.05,.2),
      new THREE.MeshStandardMaterial({color:0xffffee,roughness:.1,metalness:.1,transparent:true,opacity:.3})).translateX(lp.x).translateY(7.82).translateZ(lp.z));
  });

  // ─── PARKING AREA ───
  const parkX=F.x1+20,parkZ=F.z2-18;
  // Asphalt parking lot
  const parking=new THREE.Mesh(new THREE.PlaneGeometry(14,10),
    new THREE.MeshStandardMaterial({color:0x2a2a2a,roughness:.85,metalness:.05}));
  parking.rotation.x=-Math.PI/2;parking.position.set(parkX,.05,parkZ);parking.receiveShadow=true;sc.add(parking);
  // Parking lines (white)
  for(let ps=0;ps<4;ps++){
    sc.add(new THREE.Mesh(new THREE.PlaneGeometry(.15,8),
      new THREE.MeshStandardMaterial({color:0xeeeeee,roughness:.7})).translateX(parkX-5+ps*3.5).translateY(.06).translateZ(parkZ).rotateX(-Math.PI/2));
  }
  // Parking curb
  const curbMat=new THREE.MeshStandardMaterial({color:0x888880,roughness:.8,metalness:.05});
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(14.2,.15,.2),curbMat).translateX(parkX).translateY(.075).translateZ(parkZ-5.1));
  sc.add(new THREE.Mesh(new THREE.BoxGeometry(14.2,.15,.2),curbMat).translateX(parkX).translateY(.075).translateZ(parkZ+5.1));

  // ─── DRAINAGE FEATURES ───
  // Drainage swales along roads
  const swaleGeo=new THREE.PlaneGeometry(2,F.z2-F.z1);
  const swaleMat=new THREE.MeshStandardMaterial({color:0x5a4a3a,roughness:.95,metalness:0});
  const swale1=new THREE.Mesh(swaleGeo,swaleMat);
  swale1.rotation.x=-Math.PI/2;swale1.rotation.z=.08;swale1.position.set(F.x1-8,.02,0);swale1.receiveShadow=true;sc.add(swale1);

  // Culverts under main road
  for(let cu=-20;cu<=20;cu+=40){
    const culvert=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,5,8),
      new THREE.MeshStandardMaterial({color:0x3a3a3a,roughness:.5,metalness:.3}));
    culvert.rotation.z=Math.PI/2;culvert.position.set(F.x1-5,.2,cu);sc.add(culvert);
  }

  // ─── VEGETATION ───
  // Helper function for pine trees
  function makePine(x,z,scale){
    const trunkH=4*scale;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.08*scale,.12*scale,trunkH,6),M.bark);
    trunk.position.set(x,trunkH/2,z);trunk.castShadow=true;sc.add(trunk);
    // Pine cone shape (3 layers)
    for(let layer=0;layer<3;layer++){
      const rad=(.5-layer*.12)*scale;
      const cone=new THREE.Mesh(new THREE.ConeGeometry(rad,.8*scale,8),M.canopy);
      cone.position.set(x,trunkH+.3+layer*.6*scale,z);cone.castShadow=true;sc.add(cone);
    }
  }

  // Helper function for bushes
  function makeBush(x,z,scale){
    const bush=new THREE.Mesh(new THREE.SphereGeometry(.3*scale,6,5),M.bush);
    bush.position.set(x,.2*scale,z);bush.castShadow=true;bush.scale.y=.7;sc.add(bush);
  }

  // Plant trees along fence perimeter (not blocking view)
  for(let tx=F.x1+8;tx<F.x2-8;tx+=12+R()*6){
    if(Math.abs(tx-gateX)<15)continue; // Skip near gate
    makePine(tx,F.z1-2,.8+R()*.4);
    makePine(tx,F.z2+2,.8+R()*.4);
  }
  for(let tz=F.z1+8;tz<F.z2-8;tz+=12+R()*6){
    makePine(F.x1-2,tz,.8+R()*.4);
    makePine(F.x2+2,tz,.8+R()*.4);
  }

  // Bushes around buildings
  for(let b=0;b<6;b++){
    makeBush(omX-6+R()*2,omZ+4+R()*2,.8+R()*.4);
    makeBush(omX+6+R()*-2,omZ+4+R()*2,.8+R()*.4);
  }

  // Random vegetation patches (native plants)
  for(let vp=0;vp<25;vp++){
    const vx=F.x1+R()*(F.x2-F.x1);
    const vz=F.z1+R()*(F.z2-F.z1);
    // Avoid panel areas and roads
    if(vx>X0-5&&vx<RL/2+5&&vz>Z0-5&&vz<-Z0+5)continue;
    if(Math.abs(vx-F.x1+5)<3)continue;
    makeBush(vx,vz,.4+R()*.3);
  }

  // ─── ROCKS & TERRAIN DETAIL ───
  // Add some rocks for realism
  for(let rk=0;rk<40;rk++){
    const rx=F.x1+R()*(F.x2-F.x1);
    const rz=F.z1+R()*(F.z2-F.z1);
    if(rx>X0-5&&rx<RL/2+5&&rz>Z0-5&&rz<-Z0+5)continue;
    const rockSize=.1+R()*.25;
    const rock=new THREE.Mesh(
      new THREE.DodecahedronGeometry(rockSize,0),
      new THREE.MeshStandardMaterial({color:0x6a6560,roughness:.95,metalness:0})
    );
    rock.position.set(rx,rockSize*.5,rz);
    rock.rotation.set(R()*Math.PI,R()*Math.PI,R()*Math.PI);
    rock.castShadow=true;sc.add(rock);
  }

  // ─── DUST/DIRT PATCHES ───
  // Add some dirt patches where vehicles drive
  const dirtMat=new THREE.MeshStandardMaterial({color:0x7a6a55,roughness:.98,metalness:0});
  for(let dp=0;dp<8;dp++){
    const dpatch=new THREE.Mesh(new THREE.CircleGeometry(1.5+R()*1,8),dirtMat);
    dpatch.rotation.x=-Math.PI/2;
    dpatch.position.set(F.x1-6+R()*2,Z0+dp*RS+R()*3,.08);
    dpatch.receiveShadow=true;sc.add(dpatch);
  }

  // ─── SECURITY CAMERAS ───
  // Cameras on light poles
  lightPoles.slice(0,3).forEach(lp=>{
    const camArm=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.8,6),M.steel);
    camArm.rotation.z=Math.PI/3;camArm.position.set(lp.x+.35,7.5,lp.z);sc.add(camArm);
    const camera=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,.2,8),
      new THREE.MeshStandardMaterial({color:0xeeeeee,roughness:.2,metalness:.6}));
    camera.rotation.z=Math.PI/2;camera.rotation.y=-.5;
    camera.position.set(lp.x+.65,7.2,lp.z);sc.add(camera);
  });

  // ─── WEATHER MONITORING STATIONS ───
  // Additional weather sensors
  const wsSensors=[
    {x:F.x1+30,z:F.z1+30,type:'wind'},
    {x:F.x2-30,z:F.z2-30,type:'rain'}
  ];
  wsSensors.forEach(ws=>{
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,4,6),M.steel);
    pole.position.set(ws.x,2,ws.z);sc.add(pole);
    if(ws.type==='wind'){
      // Anemometer
      for(let cup=0;cup<3;cup++){
        const arm=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.3,4),M.steel);
        arm.rotation.z=Math.PI/2;arm.rotation.y=cup*Math.PI*2/3;
        arm.position.set(ws.x,4,ws.z);sc.add(arm);
        const cupMesh=new THREE.Mesh(new THREE.SphereGeometry(.04,6,6),M.white);
        cupMesh.scale.x=.5;
        const cupX=ws.x+Math.cos(cup*Math.PI*2/3)*.3;
        const cupZ=ws.z+Math.sin(cup*Math.PI*2/3)*.3;
        cupMesh.position.set(cupX,4,cupZ);sc.add(cupMesh);
      }
    }else{
      // Rain gauge
      const gauge=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.3,8),M.white);
      gauge.position.set(ws.x,4.15,ws.z);sc.add(gauge);
    }
  });

  // ─── TIRE TRACKS ON DIRT ROADS ───
  // Add some tire track texture to roads
  const trackMat=new THREE.MeshStandardMaterial({color:0x4a3a2a,roughness:.95,metalness:0});
  for(let tr=0;tr<15;tr++){
    const track=new THREE.Mesh(new THREE.PlaneGeometry(.3,2),trackMat);
    track.rotation.x=-Math.PI/2;
    track.position.set(F.x1-6.5,Z0+tr*5,.085);
    sc.add(track);
    const track2=new THREE.Mesh(new THREE.PlaneGeometry(.3,2),trackMat);
    track2.rotation.x=-Math.PI/2;
    track2.position.set(F.x1-4.5,Z0+tr*5,.085);
    sc.add(track2);
  }

  // ─── UTILITY BOXES ───
  // Communication/monitoring boxes
  for(let ub=0;ub<4;ub++){
    const ubX=F.x1+25+ub*30;
    const ubZ=F.z1+8;
    const utilBox=new THREE.Mesh(new THREE.BoxGeometry(.6,.8,.4),
      new THREE.MeshStandardMaterial({color:0x4a4a4a,roughness:.4,metalness:.5}));
    utilBox.position.set(ubX,.4,ubZ);utilBox.castShadow=true;sc.add(utilBox);
    // Antenna on top
    sc.add(new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,1.2,4),M.steel).translateX(ubX).translateY(1.4).translateZ(ubZ));
  }

  // ─── SITE MARKER POSTS ───
  // Row identification markers
  for(let r=0;r<ROWS;r++){
    const rz=Z0+r*RS;
    const marker=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.5,6),M.warn);
    marker.position.set(X0-3,.75,rz);sc.add(marker);
    const markerTop=new THREE.Mesh(new THREE.BoxGeometry(.15,.15,.02),
      new THREE.MeshStandardMaterial({color:0xffffff,roughness:.4}));
    markerTop.position.set(X0-3,1.5,rz);sc.add(markerTop);
  }
}
