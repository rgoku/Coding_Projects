/* ═══════════════════════════════════════════════════════════
   GDPR Consent Banner — No tracking fires until accepted
═══════════════════════════════════════════════════════════ */
(function () {
  // Already consented
  if (localStorage.getItem("solar_consent")) {
    window.__solarConsent = true;
    return;
  }

  var css = [
    "#solar-cb{position:fixed;bottom:0;left:0;right:0;z-index:999999;",
    "background:rgba(8,15,24,0.97);border-top:1px solid rgba(249,115,22,0.2);",
    "padding:14px 24px;display:flex;align-items:center;justify-content:space-between;",
    "font-family:system-ui,-apple-system,sans-serif;font-size:13px;color:#94a3b8;",
    "box-shadow:0 -8px 32px rgba(0,0,0,0.5);backdrop-filter:blur(12px);}",
    "#solar-cb a{color:#f97316;text-decoration:none;}",
    "#solar-cb-yes{background:#f97316;color:#fff;border:none;border-radius:8px;",
    "padding:8px 20px;cursor:pointer;font-weight:600;font-size:13px;transition:background .2s;}",
    "#solar-cb-yes:hover{background:#ea580c;}",
    "#solar-cb-no{background:transparent;color:#64748b;border:1px solid #1e2a3a;",
    "border-radius:8px;padding:8px 16px;cursor:pointer;font-size:13px;margin-left:8px;",
    "transition:color .2s;}",
    "#solar-cb-no:hover{color:#94a3b8;}"
  ].join("");

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var el = document.createElement("div");
  el.id = "solar-cb";
  el.innerHTML = '<span>We use cookies to understand how visitors engage with our solar education platform.</span>' +
    '<div style="display:flex;flex-shrink:0;margin-left:20px;">' +
    '<button id="solar-cb-yes">Accept</button>' +
    '<button id="solar-cb-no">Decline</button></div>';
  document.body.appendChild(el);

  document.getElementById("solar-cb-yes").onclick = function() {
    localStorage.setItem("solar_consent", "1");
    window.__solarConsent = true;
    el.remove();
    // Load tracker now
    var s = document.createElement("script");
    s.src = (document.currentScript ? document.currentScript.getAttribute("data-tracker") : null)
            || "js/tracker.js";
    document.body.appendChild(s);
  };

  document.getElementById("solar-cb-no").onclick = function() {
    el.remove();
  };
})();
