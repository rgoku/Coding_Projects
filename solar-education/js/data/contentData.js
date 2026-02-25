// Educational content for each solar farm step
export const contentData = {
  module: {
    title: "1. Solar Panel Module",
    subtitle: "Step 1: The Basic Building Block",
    content: `
      <div class="info-box">
        <h3>What is a Solar Module?</h3>
        <p>A solar panel (module) converts sunlight into electricity using photovoltaic cells.</p>
      </div>
      <div class="info-box">
        <h3>Explanation</h3>
        <p>• Like a tile on your roof, but generates electricity</p>
        <p>• Made of silicon cells (like computer chips)</p>
        <p>• Produces DC electricity (like a battery)</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">600W</div><div class="stat-label">Power Output</div></div>
        <div class="stat-card"><div class="stat-value">22%</div><div class="stat-label">Efficiency</div></div>
      </div>
    `,
    stats: `<div class="stat-card"><div class="stat-value">Step 1 of 6</div><div class="stat-label">Module → String → Tracker → Combiner → Cabling → Inverter</div></div>`,
    cam: {x: 140, y: 11, z: -23},
    lookAt: {x: 140, y: 6, z: -27}
  },
  string: {
    title: "2. String Circuit",
    subtitle: "Step 2: Panel Interconnections",
    content: `
      <div class="info-box">
        <h3>How Panels Connect into Strings</h3>
        <p>Panels connect in series using <strong>MC4 connectors</strong> to form strings.</p>
      </div>
      <div class="info-box">
        <h3>The Connection Flow</h3>
        <p>1. <strong>Junction Box</strong> - On back of each panel (+/- terminals)</p>
        <p>2. <strong>Integrated Wires</strong> - Pre-attached DC cables with MC4 ends</p>
        <p>3. <strong>MC4 Interconnections</strong> - Connect panels together</p>
        <p>4. <strong>Routing</strong> - Cables run along mounting rails to inverter/combiner</p>
      </div>
      <button id="viewCablesBtn" class="view-demo-btn" style="background: linear-gradient(135deg, #cc3333, #ff5555); margin: 10px 0;">
        🔌 View DC Cables (Back of Panel)
      </button>
      <div class="info-box" style="background: rgba(0,80,80,0.3); border-left: 3px solid #0fa;">
        <h3>🔍 What You're Seeing (Highlight Guide)</h3>
        <p><span style="color:#0f8;">●</span> <strong style="color:#0f8;">Green dots</strong> = MC4 connection points</p>
        <p><span style="color:#ffdd00;">●</span> <strong style="color:#ffdd00;">Yellow boxes</strong> = Junction boxes on panel backs</p>
        <p><span style="color:#ff3333;">━</span> <strong style="color:#ff3333;">Red lines</strong> = DC+ cable interconnections</p>
        <p><span style="color:#333333;">━</span> <strong style="color:#666666;">Black lines</strong> = DC- cable interconnections</p>
        <p><span style="color:#0fa;">➤</span> <strong style="color:#0fa;">Arrows</strong> = Direction to inverter/combiner</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">24</div><div class="stat-label">Panels/String</div></div>
        <div class="stat-card"><div class="stat-value">MC4</div><div class="stat-label">Connector Type</div></div>
      </div>
    `,
    stats: `<div class="stat-card"><div class="stat-value">Step 2 of 6</div><div class="stat-label">Look for MC4 connections along the mounting rails</div></div>`,
    cam: {x: 148, y: 8, z: -40},
    lookAt: {x: 140, y: 6.0, z: -45}
  },
  tracker: {
    title: "3. Solar Tracker",
    subtitle: "Step 3: Following the Sun",
    content: `
      <div class="info-box" style="background: rgba(0,255,170,0.15); border-left: 3px solid #00ffaa;">
        <h3>👁️ The Tracker Bearing Plate is Highlighted</h3>
        <p>Look for the <strong style="color:#00ffaa;">glowing cyan curved plate</strong> on the tracker — this is the bearing that allows the panels to rotate!</p>
      </div>
      <div class="info-box">
        <h3>What is a Solar Tracker?</h3>
        <p>A device that orients solar panels to <strong>follow the sun's path</strong> across the sky, maximizing sunlight absorption and boosting energy production <strong>15-40%</strong> compared to fixed systems.</p>
      </div>
      <div class="info-box">
        <h3>How Trackers Work</h3>
        <p><strong>1. Sensing the Sun</strong> - Uses sensors or programmed algorithms (astronomical data) to know the sun's position</p>
        <p><strong>2. Movement</strong> - Motors slowly adjust the panel angle throughout the day to keep it facing the sun</p>
        <p><strong>3. Maximizing Output</strong> - By staying perpendicular, they reduce the "angle of incidence" = more light hits the panel</p>
      </div>
      <div class="info-box">
        <h3>Types of Trackers</h3>
        <p><strong>Single-Axis</strong> - Rotates east-to-west (common in large solar farms) ← <em>This is what you see here!</em></p>
        <p><strong>Dual-Axis</strong> - Rotates both east-west AND north-south (highest efficiency, higher cost)</p>
      </div>
      <div style="text-align:center; margin: 15px 0;">
        <button id="viewTrackerBtn" class="view-demo-btn">
          🔍 VIEW TRACKER CLOSE-UP
        </button>
      </div>
      <div class="info-box">
        <h3>Industry Leading Partners</h3>
        <p><strong style="color:#ffdd00;">Nextracker</strong> - NX Horizon with TrueCapture™</p>
        <p><strong style="color:#2255aa;">Array Technologies</strong> - DuraTrack HZ v3 with SmarTrack™</p>
      </div>
      <div class="info-box" style="background: rgba(0,80,80,0.3); border-left: 3px solid #0fa;">
        <h3>🔍 What You're Seeing</h3>
        <p><span style="color:#00ffaa;">▣</span> <strong style="color:#00ffaa;">Glowing cyan plate</strong> = Bearing plate (HIGHLIGHTED)</p>
        <p>The curved metal plate connects the torque tube to the post and allows rotation.</p>
        <p style="margin-top: 8px; font-size: 12px; color: #888;">Click "VIEW TRACKER CLOSE-UP" to see Nextracker & Array Technologies styles</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">+25%</div><div class="stat-label">More Power vs Fixed</div></div>
        <div class="stat-card"><div class="stat-value">±60°</div><div class="stat-label">Rotation Range</div></div>
      </div>
    `,
    stats: `<div class="stat-card"><div class="stat-value">Step 3 of 6</div><div class="stat-label">Single-axis tracker rotates east-to-west to follow the sun</div></div>`,
    cam: {x: 150, y: 7, z: -72},
    lookAt: {x: 140, y: 4, z: -63}
  },
  combiner: {
    title: "4. Combiner Box",
    subtitle: "Step 4: Combining Multiple Strings",
    content: `
      <div class="info-box">
        <h3>What is a Combiner Box?</h3>
        <p>An electrical enclosure that safely <strong>bundles multiple solar panel strings</strong> into a single, higher-current output for the inverter, adding crucial protection like fuses and surge suppression.</p>
      </div>
      <div class="info-box">
        <h3>Key Functions</h3>
        <p><strong>1. Aggregation</strong> - Combines multiple strings (parallel connections) into one output cable</p>
        <p><strong>2. Protection</strong> - Houses fuses, circuit breakers, and Surge Protection Devices (SPDs)</p>
        <p><strong>3. Organization</strong> - Centralized enclosure for wiring, improving safety & maintenance</p>
        <p><strong>4. Monitoring</strong> - Advanced boxes track string voltage, current, and temperature</p>
      </div>
      <div class="info-box">
        <h3>Types of Combiner Boxes</h3>
        <p><strong>DC Combiner</strong> - Most common, combines DC outputs before the inverter ← <em>This is what you see here!</em></p>
        <p><strong>AC Combiner</strong> - Combines AC outputs from multiple inverters</p>
      </div>
      <div style="text-align:center; margin: 15px 0;">
        <button id="viewCombinerBtn" class="view-demo-btn green">
          🔍 VIEW COMBINER CLOSE-UP
        </button>
      </div>
      <div class="info-box" style="background: rgba(0,255,170,0.15); border-left: 3px solid #00ffaa;">
        <h3>👁️ The Combiner Box is Highlighted</h3>
        <p>Look for the <strong style="color:#00ffaa;">glowing cyan box</strong> — this is the combiner that collects power from multiple panel strings!</p>
      </div>
      <div class="info-box" style="background: rgba(0,80,80,0.3); border-left: 3px solid #0fa;">
        <h3>🔍 What You're Seeing</h3>
        <p><span style="color:#00ffaa;">▢</span> <strong style="color:#00ffaa;">Glowing box</strong> = Combiner Box (HIGHLIGHTED)</p>
        <p><span style="color:#a33;">●</span> <strong style="color:#f66;">Red cables</strong> = DC+ inputs from strings</p>
        <p><span style="color:#ff0;">▮</span> <strong style="color:#ff0;">Yellow components</strong> = Fuses (overcurrent protection)</p>
        <p><span style="color:#0af;">▮</span> <strong style="color:#0af;">Blue device</strong> = Surge Protection Device (SPD)</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">24</div><div class="stat-label">String Inputs</div></div>
        <div class="stat-card"><div class="stat-value">1500V</div><div class="stat-label">Max Voltage</div></div>
      </div>
    `,
    stats: `<div class="stat-card"><div class="stat-value">Step 4 of 6</div><div class="stat-label">Strings combine here before going to inverter</div></div>`,
    cam: {x: 140, y: 3.5, z: -20},
    lookAt: {x: 140, y: 2.8, z: -24.5}
  },
  cabling: {
    title: "5. DC & AC Cabling",
    subtitle: "Step 5: Transporting the Power",
    content: `
      <div class="info-box">
        <h3>What is Cabling?</h3>
        <p>DC cables (red/blue) carry power from strings to inverters. Look for the cables running down the posts!</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">10 AWG</div><div class="stat-label">Wire Size</div></div>
        <div class="stat-card"><div class="stat-value">2000V</div><div class="stat-label">DC Rating</div></div>
      </div>
    `,
    stats: `<div class="stat-card"><div class="stat-value">Step 5 of 6</div><div class="stat-label">Cabling → Inverter</div></div>`,
    cam: {x: 155, y: 8, z: 60},
    lookAt: {x: 140, y: 3, z: 45}
  },
  inverter: {
    title: "6. String Inverters",
    subtitle: "Step 6: Converting to Grid Power",
    content: `
      <div class="info-box" style="background: rgba(0,255,170,0.15); border-left: 3px solid #00ffaa;">
        <h3>👁️ The Inverter is Highlighted</h3>
        <p>Look for the <strong style="color:#00ffaa;">glowing cyan boxes</strong> on the posts — these are the string inverters that convert DC to AC power!</p>
      </div>
      <div class="info-box">
        <h3>What is a String Inverter?</h3>
        <p>String inverters convert DC from panels to AC for the grid. They're mounted on each tracker post for distributed conversion.</p>
      </div>
      <div class="info-box">
        <h3>Why on Every Post?</h3>
        <p>• Reduces DC cable runs</p>
        <p>• Better monitoring per string</p>
        <p>• Easier maintenance access</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">15kW</div><div class="stat-label">Per Inverter</div></div>
        <div class="stat-card"><div class="stat-value">98.5%</div><div class="stat-label">Efficiency</div></div>
      </div>
    `,
    stats: `<div class="stat-card"><div class="stat-value">Step 6 of 6</div><div class="stat-label">Zoom in to see inverters on posts!</div></div>`,
    cam: {x: 138, y: 4, z: -17},
    lookAt: {x: 135, y: 2.5, z: -27}
  }
};
