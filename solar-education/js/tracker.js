/* ═══════════════════════════════════════════════════════════════════════════
   SolarTracker v2.0 — Production-grade analytics with Supabase backend

   ARCHITECTURE:
   - Persistent user_id across sessions (localStorage + cookie backup)
   - Single session across multiple tabs (BroadcastChannel + localStorage lock)
   - Lightweight device fingerprinting (non-invasive)
   - Heartbeat system with 30-min inactivity timeout
   - Active tab counting
   - Supabase backend: all data synced to cloud database so ANY visitor
     from ANY browser is tracked and visible on the dashboard

   PRIVACY LIMITATIONS (by design):
   - Cannot reliably identify a specific person or physical device
   - IP addresses can change or be shared (NAT, VPN, mobile networks)
   - Browsers restrict cross-site tracking for privacy
   - Incognito/private mode resets all identity — this is expected
   - localStorage can be cleared by the user at any time
   - Cookie backup is first-party only, no cross-domain tracking

   DATA STORAGE:
   - Primary: Supabase PostgreSQL (cloud — tracks ALL visitors)
   - Cache: localStorage key "solar_tracker_db" (local browser only)

   Usage: <script src="js/tracker.js"></script>
═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  // ── CONSTANTS ──────────────────────────────────────────────────────────
  var DB_KEY           = "solar_tracker_db";
  var USER_KEY         = "solar_user_id";
  var SESSION_KEY      = "solar_active_session";
  var LAST_ACTIVITY    = "solar_last_activity";
  var TAB_KEY          = "solar_tab_";
  var TAB_COUNT_KEY    = "solar_tab_count";
  var COOKIE_NAME      = "solar_uid";
  var HEARTBEAT_MS     = 5000;       // 5 seconds
  var SESSION_TIMEOUT  = 30 * 60000; // 30 minutes of inactivity
  var MAX_SESSIONS     = 200;
  var MAX_PAGEVIEWS    = 1000;
  var MAX_LEADS        = 500;
  var CHANNEL_NAME     = "solar_tracker_sync";

  // ── SUPABASE CONFIG ────────────────────────────────────────────────────
  var SUPABASE_URL     = "https://ifxsjddrnlyqvixjymkb.supabase.co";
  var SUPABASE_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmeHNqZGRybmx5cXZpeGp5bWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTcyNzEsImV4cCI6MjA5MTE3MzI3MX0.pi9jWOSzWZe0I_P5a-pY_4JvTqKtsRF1Bn0zLW3coSM";

  // Fire-and-forget POST to Supabase REST API
  function supaPost(table, data) {
    try {
      fetch(SUPABASE_URL + "/rest/v1/" + table, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + SUPABASE_KEY,
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  // Fire-and-forget PATCH to Supabase REST API
  function supaPatch(table, matchCol, matchVal, data) {
    try {
      fetch(SUPABASE_URL + "/rest/v1/" + table + "?" + matchCol + "=eq." + encodeURIComponent(matchVal), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + SUPABASE_KEY
        },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  // ── GUARD: consent required ────────────────────────────────────────────
  if (!window.__solarConsent && !localStorage.getItem("solar_consent")) return;

  // ── UTILITIES ──────────────────────────────────────────────────────────

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function now() { return Date.now(); }
  function isoNow() { return new Date().toISOString(); }

  // ── DATABASE LAYER ─────────────────────────────────────────────────────

  function getDB() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEY)) || freshDB();
    } catch (e) {
      return freshDB();
    }
  }

  function freshDB() {
    return { users: [], sessions: [], pageviews: [], leads: [] };
  }

  function saveDB(db) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (e) {
      // localStorage full — prune old data and retry
      pruneDB(db);
      try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e2) {}
    }
  }

  function pruneDB(db) {
    if (db.sessions.length > MAX_SESSIONS) db.sessions = db.sessions.slice(-MAX_SESSIONS);
    if (db.pageviews.length > MAX_PAGEVIEWS) db.pageviews = db.pageviews.slice(-MAX_PAGEVIEWS);
    if (db.leads.length > MAX_LEADS) db.leads = db.leads.slice(-MAX_LEADS);
  }

  // ══════════════════════════════════════════════════════════════════════
  // 1. UNIQUE USER IDENTIFICATION
  //    Priority: localStorage → cookie → generate new
  //    The user_id persists across sessions, tabs, and page reloads.
  //    In incognito mode, a new user_id is generated (expected behavior).
  // ══════════════════════════════════════════════════════════════════════

  function setCookie(name, val, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie = name + "=" + val + ";expires=" + d.toUTCString() + ";path=/;SameSite=Lax";
  }

  function getCookie(name) {
    var m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return m ? m[2] : null;
  }

  function getUserId() {
    // Check localStorage first (primary store)
    var uid = localStorage.getItem(USER_KEY);
    if (uid) {
      // Sync to cookie backup
      setCookie(COOKIE_NAME, uid, 365);
      return uid;
    }
    // Check cookie backup (survives localStorage clear)
    uid = getCookie(COOKIE_NAME);
    if (uid) {
      localStorage.setItem(USER_KEY, uid);
      return uid;
    }
    // New user — generate and persist
    uid = uuid();
    localStorage.setItem(USER_KEY, uid);
    setCookie(COOKIE_NAME, uid, 365);
    return uid;
  }

  var userId = getUserId();
  window.__solarUserId = userId;

  // ── A/B VARIANT ASSIGNMENT ────────────────────────────────────────────
  var AB_KEY = "solar_ab_variant";
  var abVariant = localStorage.getItem(AB_KEY);
  if (!abVariant) {
    abVariant = Math.random() < 0.5 ? "control" : "variant_a";
    localStorage.setItem(AB_KEY, abVariant);
  }
  window.__solarABVariant = abVariant;

  // Register user in DB if not already present
  function ensureUser(db) {
    var existing = db.users.find(function (u) { return u.id === userId; });
    if (!existing) {
      var userData = {
        user_id: userId,
        first_seen: isoNow(),
        last_seen: isoNow(),
        device_id: deviceId,
        device_type: getDeviceType(),
        total_sessions: 0,
        total_pageviews: 0
      };
      db.users.push({ id: userId, first_seen: userData.first_seen, last_seen: userData.last_seen, device_id: deviceId, device_type: userData.device_type, total_sessions: 0, total_pageviews: 0 });
      if (db.users.length > 500) db.users = db.users.slice(-500);
      // Sync to Supabase
      supaPost("tracked_users", userData);
    }
    return existing || db.users[db.users.length - 1];
  }

  // ══════════════════════════════════════════════════════════════════════
  // 2. LIGHTWEIGHT DEVICE FINGERPRINTING
  //    Uses only non-invasive signals: userAgent, screen, timezone, language.
  //    Hashed into a device_id using a simple string hash.
  //    NOT unique per device — collisions are expected and acceptable.
  //    This is for device-type analytics, NOT for cross-site tracking.
  // ══════════════════════════════════════════════════════════════════════

  function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash = hash & hash; // Convert to 32-bit int
    }
    // Convert to hex string
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function buildDeviceId() {
    var signals = [
      navigator.userAgent || "",
      screen.width + "x" + screen.height,
      screen.colorDepth || "",
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      navigator.language || "",
      navigator.hardwareConcurrency || "",
      navigator.platform || ""
    ].join("|");
    return "dev_" + simpleHash(signals);
  }

  function getDeviceType() {
    var ua = navigator.userAgent;
    if (/Mobi|Android/i.test(ua) && !/Tablet|iPad/i.test(ua)) return "mobile";
    if (/Tablet|iPad/i.test(ua)) return "tablet";
    return "desktop";
  }

  var deviceId = buildDeviceId();

  // ══════════════════════════════════════════════════════════════════════
  // 3. SINGLE SESSION ACROSS MULTIPLE TABS
  //    Uses localStorage as a shared lock so all tabs share one session.
  //    BroadcastChannel keeps tabs in sync for real-time coordination.
  //
  //    Logic:
  //    - On load, check if an active session exists in localStorage
  //    - If session exists AND last activity < 30 min → reuse it
  //    - If session is stale (>30 min) → create new session
  //    - If no session → create new session
  //    - Each tab registers itself with a unique tab_id for counting
  // ══════════════════════════════════════════════════════════════════════

  var tabId = uuid();  // Unique per tab instance
  var bc = null;       // BroadcastChannel (if supported)

  // Try to set up BroadcastChannel for cross-tab sync
  try {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = function (ev) {
      if (ev.data.type === "session_created" && ev.data.sessionId) {
        // Another tab created a session — adopt it
        sessionId = ev.data.sessionId;
      }
      if (ev.data.type === "activity") {
        // Another tab is active — update our last-activity view
        localStorage.setItem(LAST_ACTIVITY, String(now()));
      }
    };
  } catch (e) {
    // BroadcastChannel not supported — localStorage fallback is sufficient
  }

  // Register this tab
  function registerTab() {
    localStorage.setItem(TAB_KEY + tabId, String(now()));
    updateTabCount();
  }

  // Unregister this tab
  function unregisterTab() {
    localStorage.removeItem(TAB_KEY + tabId);
    updateTabCount();
  }

  // Count active tabs (tabs that updated within last 15 seconds)
  function updateTabCount() {
    var count = 0;
    var cutoff = now() - 15000;
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(TAB_KEY) === 0) {
        var ts = parseInt(localStorage.getItem(key) || "0");
        if (ts > cutoff) {
          count++;
        } else {
          // Stale tab — clean up
          localStorage.removeItem(key);
        }
      }
    }
    localStorage.setItem(TAB_COUNT_KEY, String(count));
    return count;
  }

  function getActiveTabCount() {
    return parseInt(localStorage.getItem(TAB_COUNT_KEY) || "1");
  }

  // Session resolution: reuse or create
  function resolveSession() {
    var existingId = localStorage.getItem(SESSION_KEY);
    var lastAct = parseInt(localStorage.getItem(LAST_ACTIVITY) || "0");
    var elapsed = now() - lastAct;

    // Reuse existing session if active within timeout
    if (existingId && lastAct > 0 && elapsed < SESSION_TIMEOUT) {
      return { id: existingId, isNew: false };
    }

    // Session expired or doesn't exist — create new
    var newId = uuid();
    localStorage.setItem(SESSION_KEY, newId);
    localStorage.setItem(LAST_ACTIVITY, String(now()));

    // Broadcast to other tabs
    if (bc) {
      try { bc.postMessage({ type: "session_created", sessionId: newId }); } catch (e) {}
    }

    return { id: newId, isNew: true };
  }

  var resolved = resolveSession();
  var sessionId = resolved.id;
  var isNewSession = resolved.isNew;
  window.__solarSessionId = sessionId;

  registerTab();

  // ══════════════════════════════════════════════════════════════════════
  // 4. SESSION LIFECYCLE & HEARTBEAT
  //    - Heartbeat fires every 5 seconds
  //    - Updates last_activity timestamp
  //    - Updates session duration, active tab count
  //    - Session auto-expires after 30 min inactivity
  //    - beforeunload does a final flush
  // ══════════════════════════════════════════════════════════════════════

  var pageEnteredAt = now();

  // Create session record in DB
  if (isNewSession) {
    var db = getDB();
    ensureUser(db);

    var sessionData = {
      session_id: sessionId,
      user_id: userId,
      device_id: deviceId,
      device_type: getDeviceType(),
      referrer: document.referrer || "",
      start_time: isoNow(),
      end_time: null,
      duration_seconds: 0,
      pages_viewed: 0,
      used_designer: false,
      page_list: [],
      active_tabs: 1,
      is_active: true,
      ab_variant: abVariant
    };

    db.sessions.push({ id: sessionId, user_id: userId, device_id: deviceId, device_type: sessionData.device_type, referrer: sessionData.referrer, start_time: sessionData.start_time, end_time: null, duration_seconds: 0, pages_viewed: 0, used_designer: false, page_list: [], active_tabs: 1, is_active: true });

    // Update user stats
    var user = db.users.find(function (u) { return u.id === userId; });
    if (user) {
      user.total_sessions = (user.total_sessions || 0) + 1;
      user.last_seen = isoNow();
    }

    pruneDB(db);
    saveDB(db);

    // Sync to Supabase
    supaPost("sessions", sessionData);
    supaPatch("tracked_users", "user_id", userId, { total_sessions: user ? user.total_sessions : 1, last_seen: isoNow() });
  }

  // ── PAGEVIEW TRACKING ─────────────────────────────────────────────────

  function trackPageView() {
    var db = getDB();
    var pageUrl = location.pathname + location.search;
    var pvId = uuid();
    var pv = {
      id: pvId,
      session_id: sessionId,
      user_id: userId,
      page_url: pageUrl,
      page_title: document.title,
      timestamp: isoNow(),
      time_on_page: 0
    };
    db.pageviews.push(pv);

    // Update session
    var sess = db.sessions.find(function (s) { return s.id === sessionId; });
    if (sess) {
      sess.pages_viewed = (sess.pages_viewed || 0) + 1;
      if (!sess.page_list) sess.page_list = [];
      if (sess.page_list.indexOf(pageUrl) === -1) sess.page_list.push(pageUrl);
    }

    // Update user
    var user = db.users.find(function (u) { return u.id === userId; });
    if (user) {
      user.total_pageviews = (user.total_pageviews || 0) + 1;
      user.last_seen = isoNow();
    }

    pruneDB(db);
    saveDB(db);

    // Sync to Supabase
    supaPost("pageviews", { session_id: sessionId, user_id: userId, page_url: pageUrl, page_title: pv.page_title, time_on_page: 0 });
    if (sess) {
      supaPatch("sessions", "session_id", sessionId, { pages_viewed: sess.pages_viewed, page_list: sess.page_list });
    }

    return pvId;
  }

  var currentPvId = trackPageView();

  // ── DESIGNER DETECTION ────────────────────────────────────────────────

  function markDesigner() {
    var db = getDB();
    var sess = db.sessions.find(function (s) { return s.id === sessionId; });
    if (sess && !sess.used_designer) {
      sess.used_designer = true;
      saveDB(db);
      supaPatch("sessions", "session_id", sessionId, { used_designer: true });
    }
  }

  document.addEventListener("click", function (e) {
    var el = e.target;
    while (el) {
      if (el.getAttribute && el.getAttribute("data-solar-designer")) { markDesigner(); return; }
      if (el.id === "site-gen-menu" || el.id === "create-site-btn") { markDesigner(); return; }
      el = el.parentElement;
    }
  });

  // Auto-detect designer pages by URL
  var pagePath = location.pathname.toLowerCase();
  if (pagePath.indexOf("solar-farm") !== -1 ||
      pagePath.indexOf("hsat-site") !== -1 ||
      pagePath.indexOf("3d-models") !== -1) {
    markDesigner();
  }

  // ── HEARTBEAT ─────────────────────────────────────────────────────────
  // Fires every 5 seconds:
  //   1. Marks this tab as alive
  //   2. Updates last_activity timestamp (shared across tabs)
  //   3. Updates session duration and active tab count
  //   4. Checks if session has timed out
  //   5. Broadcasts activity to other tabs

  function heartbeat() {
    var ts = now();

    // Check if session timed out (another tab may have let it expire)
    var lastAct = parseInt(localStorage.getItem(LAST_ACTIVITY) || "0");
    if (lastAct > 0 && (ts - lastAct) > SESSION_TIMEOUT) {
      // Session expired — close old session, start new one
      closeCurrentSession();
      var newResolved = resolveSession();
      sessionId = newResolved.id;
      isNewSession = newResolved.isNew;
      if (isNewSession) {
        var db2 = getDB();
        db2.sessions.push({
          id: sessionId,
          user_id: userId,
          device_id: deviceId,
          device_type: getDeviceType(),
          referrer: "",
          start_time: isoNow(),
          end_time: null,
          duration_seconds: 0,
          pages_viewed: 1,
          used_designer: false,
          page_list: [location.pathname],
          active_tabs: 1,
          is_active: true
        });
        var user2 = db2.users.find(function (u) { return u.id === userId; });
        if (user2) { user2.total_sessions++; user2.last_seen = isoNow(); }
        saveDB(db2);
      }
      return;
    }

    // Update shared last_activity
    localStorage.setItem(LAST_ACTIVITY, String(ts));

    // Register tab heartbeat
    localStorage.setItem(TAB_KEY + tabId, String(ts));
    var tabCount = updateTabCount();

    // Update session in DB
    var db = getDB();
    var sess = db.sessions.find(function (s) { return s.id === sessionId; });
    if (sess) {
      var sessionStartTs = new Date(sess.start_time).getTime();
      sess.duration_seconds = Math.round((ts - sessionStartTs) / 1000);
      sess.end_time = isoNow();
      sess.active_tabs = tabCount;
      sess.is_active = true;
    }

    // Update time_on_page for current pageview
    var pv = db.pageviews.find(function (p) { return p.id === currentPvId; });
    if (pv) pv.time_on_page = Math.round((ts - pageEnteredAt) / 1000);

    saveDB(db);

    // Sync to Supabase every 30 seconds (not every heartbeat, to avoid API spam)
    if (!heartbeat._lastSync || (ts - heartbeat._lastSync) > 30000) {
      heartbeat._lastSync = ts;
      if (sess) {
        supaPatch("sessions", "session_id", sessionId, {
          duration_seconds: sess.duration_seconds,
          end_time: sess.end_time,
          active_tabs: tabCount,
          is_active: true
        });
      }
    }

    // Broadcast activity
    if (bc) {
      try { bc.postMessage({ type: "activity", tabId: tabId }); } catch (e) {}
    }
  }

  function closeCurrentSession() {
    var db = getDB();
    var sess = db.sessions.find(function (s) { return s.id === sessionId; });
    if (sess) {
      sess.end_time = isoNow();
      sess.is_active = false;
      sess.active_tabs = 0;
    }
    saveDB(db);
    // Sync final state to Supabase
    supaPatch("sessions", "session_id", sessionId, {
      end_time: isoNow(),
      is_active: false,
      active_tabs: 0,
      duration_seconds: sess ? sess.duration_seconds : 0
    });
  }

  var heartbeatTimer = setInterval(heartbeat, HEARTBEAT_MS);

  // ── CLEANUP ON TAB CLOSE ──────────────────────────────────────────────

  window.addEventListener("beforeunload", function () {
    // Final heartbeat flush
    heartbeat();
    // Unregister this tab
    unregisterTab();
    // If this was the last tab, mark session inactive
    if (getActiveTabCount() <= 0) {
      closeCurrentSession();
    }
  });

  // ── VISIBILITY CHANGE (tab background/foreground) ──────────────────────

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      // Tab came back — immediate heartbeat
      heartbeat();
    }
  });

  // ── LEAD SCORING ENGINE ───────────────────────────────────────────────

  function calculateScore(sess) {
    if (!sess) return { score: 10, label: "COLD" };
    var score = 0;
    var dur = sess.duration_seconds || 0;
    var pages = sess.pages_viewed || 0;
    var designer = sess.used_designer;

    // Time on site
    if (dur >= 180) score += 35;        // 3+ min
    else if (dur >= 60) score += 20;    // 1–3 min
    else if (dur >= 30) score += 10;    // 30–60 sec

    // Pages viewed
    if (pages >= 5) score += 25;
    else if (pages >= 3) score += 15;
    else if (pages >= 2) score += 8;

    // Used designer/generator tool
    if (designer) score += 30;

    // Form submitted bonus
    score += 10;

    score = Math.min(score, 100);
    var label = score >= 70 ? "HOT" : (score >= 40 ? "WARM" : "COLD");
    return { score: score, label: label };
  }

  // ── EVENT TRACKING ────────────────────────────────────────────────────

  function trackEvent(name, props) {
    supaPost("events", {
      session_id: sessionId,
      user_id: userId,
      event_name: name,
      properties: props || {},
      ab_variant: abVariant,
      created_at: isoNow()
    });
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────

  window.solarTracker = {
    markDesigner: markDesigner,
    trackEvent: trackEvent,
    getVariant: function () { return abVariant; },
    getUserId: function () { return userId; },
    getSessionId: function () { return sessionId; },
    getDeviceId: function () { return deviceId; },
    getActiveTabCount: getActiveTabCount,

    submitLead: function (data) {
      var db = getDB();
      var sess = db.sessions.find(function (s) { return s.id === sessionId; });
      var sc = calculateScore(sess);
      var lead = {
        id: uuid(),
        session_id: sessionId,
        user_id: userId,
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        company: data.company || "",
        score: sc.score,
        score_label: sc.label,
        created_at: isoNow()
      };
      // Deduplicate by email
      var exists = db.leads.find(function (l) {
        return l.email.toLowerCase() === lead.email.toLowerCase();
      });
      if (exists) return { status: "exists", lead: exists };
      db.leads.push(lead);
      pruneDB(db);
      saveDB(db);
      return { status: "ok", lead: lead };
    }
  };

  // Boot signal
  window.__solarConsent = true;
})();
