/* ═══════════════════════════════════════════════════════════
   SolarTracker v1.0 — Client-side visitor analytics
   Stores all data in localStorage so the dashboard can read it.
   Usage: <script src="js/tracker.js"></script>
═══════════════════════════════════════════════════════════ */
(function () {
  if (!window.__solarConsent && !localStorage.getItem("solar_consent")) return;

  var DB_KEY = "solar_tracker_db";

  function getDB() {
    try { return JSON.parse(localStorage.getItem(DB_KEY)) || { sessions: [], pageviews: [], leads: [] }; }
    catch(e) { return { sessions: [], pageviews: [], leads: [] }; }
  }
  function saveDB(db) {
    try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch(e) {}
  }

  // UUID
  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  // Device detection
  function getDevice() {
    var ua = navigator.userAgent;
    if (/Mobi|Android/i.test(ua)) return "mobile";
    if (/Tablet|iPad/i.test(ua)) return "tablet";
    return "desktop";
  }

  // Session ID (tab-scoped)
  var sid = sessionStorage.getItem("solar_sid");
  var isNew = false;
  if (!sid) {
    sid = uuid();
    sessionStorage.setItem("solar_sid", sid);
    isNew = true;
  }
  window.__solarSessionId = sid;

  var pageStart = Date.now();
  var sessionStart = parseInt(sessionStorage.getItem("solar_session_start") || "0") || Date.now();
  if (isNew) sessionStorage.setItem("solar_session_start", String(sessionStart));

  // Start session
  if (isNew) {
    var db = getDB();
    db.sessions.push({
      id: sid,
      device: getDevice(),
      referrer: document.referrer || "",
      start_time: new Date().toISOString(),
      end_time: null,
      duration_seconds: 0,
      pages_viewed: 0,
      used_designer: false,
      page_list: []
    });
    // Keep only last 200 sessions to avoid localStorage overflow
    if (db.sessions.length > 200) db.sessions = db.sessions.slice(-200);
    saveDB(db);
  }

  // Track pageview
  function trackPageView() {
    var db = getDB();
    var pv = {
      id: uuid(),
      session_id: sid,
      page_url: location.pathname + location.search,
      page_title: document.title,
      timestamp: new Date().toISOString(),
      time_on_page: 0
    };
    db.pageviews.push(pv);
    // Keep only last 1000 pageviews
    if (db.pageviews.length > 1000) db.pageviews = db.pageviews.slice(-1000);

    // Update session
    var sess = db.sessions.find(function(s) { return s.id === sid; });
    if (sess) {
      sess.pages_viewed = (sess.pages_viewed || 0) + 1;
      if (!sess.page_list) sess.page_list = [];
      if (sess.page_list.indexOf(pv.page_url) === -1) sess.page_list.push(pv.page_url);
    }
    saveDB(db);
    return pv.id;
  }

  var currentPvId = trackPageView();

  // Designer-use detection
  function markDesigner() {
    sessionStorage.setItem("solar_designer", "1");
    var db = getDB();
    var sess = db.sessions.find(function(s) { return s.id === sid; });
    if (sess) sess.used_designer = true;
    saveDB(db);
  }
  document.addEventListener("click", function(e) {
    var el = e.target;
    while (el) {
      if (el.getAttribute && el.getAttribute("data-solar-designer")) { markDesigner(); return; }
      if (el.id === "site-gen-menu" || el.id === "create-site-btn") { markDesigner(); return; }
      el = el.parentElement;
    }
  });
  // Also detect if on a designer page
  var path = location.pathname.toLowerCase();
  if (path.indexOf("solar-farm") !== -1 || path.indexOf("hsat-site") !== -1 || path.indexOf("3d-models") !== -1) {
    markDesigner();
  }

  // Update session duration periodically
  function updateDuration() {
    var dur = (Date.now() - sessionStart) / 1000;
    var db = getDB();
    var sess = db.sessions.find(function(s) { return s.id === sid; });
    if (sess) {
      sess.duration_seconds = Math.round(dur);
      sess.end_time = new Date().toISOString();
    }
    // Update time_on_page for current pageview
    var pv = db.pageviews.find(function(p) { return p.id === currentPvId; });
    if (pv) pv.time_on_page = Math.round((Date.now() - pageStart) / 1000);
    saveDB(db);
  }

  setInterval(updateDuration, 5000);
  window.addEventListener("beforeunload", updateDuration);

  // Expose for lead modal
  window.solarTracker = {
    markDesigner: markDesigner,
    getSessionId: function() { return sid; },
    submitLead: function(data) {
      var db = getDB();
      var sess = db.sessions.find(function(s) { return s.id === sid; });
      var score = calculateScore(sess);
      var lead = {
        id: uuid(),
        session_id: sid,
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        company: data.company || "",
        score: score.score,
        score_label: score.label,
        created_at: new Date().toISOString()
      };
      // Dedup by email
      var exists = db.leads.find(function(l) { return l.email.toLowerCase() === lead.email.toLowerCase(); });
      if (exists) return { status: "exists", lead: exists };
      db.leads.push(lead);
      if (db.leads.length > 500) db.leads = db.leads.slice(-500);
      saveDB(db);
      return { status: "ok", lead: lead };
    }
  };

  function calculateScore(sess) {
    if (!sess) return { score: 10, label: "COLD" };
    var score = 0;
    var dur = sess.duration_seconds || 0;
    var pages = sess.pages_viewed || 0;
    var designer = sess.used_designer;

    if (dur >= 180) score += 35;
    else if (dur >= 60) score += 20;
    else if (dur >= 30) score += 10;

    if (pages >= 5) score += 25;
    else if (pages >= 3) score += 15;
    else if (pages >= 2) score += 8;

    if (designer) score += 30;
    score += 10; // form submitted

    score = Math.min(score, 100);
    var label = score >= 70 ? "HOT" : (score >= 40 ? "WARM" : "COLD");
    return { score: score, label: label };
  }

  // Boot signal
  window.__solarConsent = true;
})();
