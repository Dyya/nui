// NUI core - universal glassmorphic UI panel. Attaches to window.PT for file:// compatibility.
// Minimal & responsive: TOP-CENTER = AD& (link to adidizdarevic.com) + tool name.
//                       BOTTOM     = legend (wraps, never overflows on phones).
// Usage:
//   const ui = PT.ui({ title:'MEASURE',
//                      hints:'drag carves the river · L R B edge · J justify · space play',
//                      theme:'dark' });            // theme: 'dark' | 'light'
//   ui.setTitle('…'); ui.setHints('…'); ui.hide(); ui.show(); ui.toggle();
// Keys handled for you: H = hide/show.
//
// Part of NUI - experiments in interface design and interaction.
// Adi Dizdarevic · AD& · https://adidizdarevic.com/  ·  © 2026. Licensed under CC BY-NC 4.0.
(function(){
  // Embedded in the showcase iframe: hide the experiment's standalone theme toggle
  // (the shell's nav switch drives theme). This runs while ui.js executes - a
  // render-blocking classic script loaded right after #toggle - so the rule lands
  // before the toggle's first paint: no flash on load or when switching projects.
  // Standalone / file:// opens (window.top === window.self) keep the dot.
  try {
    var _embedded; try { _embedded = window.top !== window.self; } catch (e) { _embedded = true; }
    if (_embedded && !document.getElementById('adui-embed-toggle')) {
      var _st = document.createElement('style');
      _st.id = 'adui-embed-toggle';
      _st.textContent = '#toggle{display:none!important}';
      (document.head || document.documentElement).appendChild(_st);
    }
  } catch (e) {}

  var STYLE_ID = 'adui-style';
  var CREDIT_URL = 'https://adidizdarevic.com/';
  var CREDIT_LABEL = 'AD&';

  // Load the lab UI face (FT Polar Mono) from the sibling fonts.css, resolving
  // the path from this script's own src so it works at any project depth and via file://.
  (function loadFonts(){
    try {
      if (document.getElementById('adui-fonts')) return;
      var s = document.currentScript ||
              document.querySelector('script[src$="ui.js"],script[src*="/core/ui.js"]');
      if (!s || !s.src) return;                       // can't locate - fall back to Plex Mono
      var href = s.src.replace(/[?#].*$/, '').replace(/ui\.js$/, 'fonts.css');
      var l = document.createElement('link');
      l.id = 'adui-fonts'; l.rel = 'stylesheet'; l.href = href;
      (document.head || document.documentElement).appendChild(l);
    } catch (e) {}
  })();

  function injectStyle(){
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      ".adui,.adui *{box-sizing:border-box;margin:0;}",
      ".adui{position:fixed;inset:0;z-index:9999;pointer-events:none;",
        "font-family:'FT Polar Mono','IBM Plex Mono',ui-monospace,monospace;transition:opacity .25s ease;}",
      ".adui.adui-hidden{opacity:0;}",
      ".adui.adui-hidden *{pointer-events:none!important;}",
      // shared glass
      ".adui-bar,.adui-pill{pointer-events:auto;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border-radius:20px;}",
      ".adui[data-theme=dark] .adui-bar,.adui[data-theme=dark] .adui-pill{",
        "background:rgba(10,10,10,.35);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.55);}",
      ".adui[data-theme=light] .adui-bar,.adui[data-theme=light] .adui-pill{",
        "background:rgba(255,255,255,.5);border:1px solid rgba(0,0,0,.06);color:rgba(0,0,0,.55);}",
      // top-center masthead: AD& · TOOL NAME
      ".adui-top{position:absolute;top:16px;left:50%;transform:translateX(-50%);}",
      ".adui-bar{padding:7px 16px;display:flex;align-items:center;white-space:nowrap;}",
      ".adui-mark{color:inherit;text-decoration:none;font-size:12px;font-weight:500;letter-spacing:.06em;",
        "opacity:.8;transition:opacity .2s,color .2s;}",
      ".adui-mark:hover{opacity:1;}",
      ".adui-div{opacity:.4;margin:0 10px;}",   /* '·' - same divider as the legend */
      ".adui-title{font-size:12px;font-weight:500;letter-spacing:.01em;opacity:.62;}",   /* sentence case - no text-transform */
      // embedded (e.g. the NUI showcase iframe): the shell rail already shows brand + tool name, so drop the masthead
      ".adui-embedded .adui-top{display:none;}",
      // bottom legend - WRAPS, never overflows
      ".adui-lg{position:absolute;bottom:14px;left:0;right:0;margin:0 auto;width:fit-content;max-width:min(1080px,calc(100vw - 24px));}",
      ".adui-pill{padding:8px 16px;font-size:9px;letter-spacing:.02em;line-height:1.5;",
        "display:flex;flex-wrap:wrap;justify-content:center;align-items:center;}",
      ".adui-pill:empty{display:none;}",
      ".adui-seg{white-space:nowrap;}",
      ".adui-seg + .adui-seg::before{content:'·';opacity:.4;margin:0 7px;}",
      ".adui-key{font-weight:600;}",   /* the key/gesture, auto-emphasized */
      ".adui[data-theme=dark] .adui-key{color:rgba(255,255,255,.92);}",
      ".adui[data-theme=light] .adui-key{color:rgba(0,0,0,.85);}",
      // phones
      "@media (max-width:560px){",
        ".adui-top{top:12px;}",
        ".adui-bar{padding:6px 13px;}",
        ".adui-mark,.adui-title{font-size:11px;}",
        ".adui-div{margin:0 8px;}",
        ".adui-lg{left:12px;right:12px;bottom:12px;width:auto;max-width:none;}",
        ".adui-pill{width:100%;font-size:9px;padding:8px 12px;}",
      "}",
    ].join('');
    var el = document.createElement('style');
    el.id = STYLE_ID; el.textContent = css;
    document.head.appendChild(el);
  }

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  // Emphasize the leading key/gesture: bold the run of leading tokens that don't start with a
  // lowercase letter (gesture words like "Drag"/"Space", single keys "L R B", digits "0", arrows),
  // up to the first lowercase descriptor word. Works with the sentence-case "Key action" format.
  function emphasize(seg){
    var toks = seg.split(' ');
    var i = 0;
    while (i < toks.length && !/^[a-z]/.test(toks[i])) i++;
    if (i === 0) i = 1;
    var key  = esc(toks.slice(0, i).join(' '));
    var rest = esc(toks.slice(i).join(' '));
    return '<b class="adui-key">' + key + '</b>' + (rest ? ' ' + rest : '');
  }
  function segHTML(hints){
    var arr = Array.isArray(hints) ? hints
            : String(hints || '').split(/\s*[·|]\s*/).filter(Boolean);
    return arr.map(function(s){ return '<span class="adui-seg">'+emphasize(s)+'</span>'; }).join('');
  }

  var current = null;

  function ui(opts){
    opts = opts || {};
    injectStyle();
    if (current) current.destroy();

    var root = document.createElement('div');
    root.className = 'adui';
    // In an embedded context (the NUI showcase iframe) the shell's rail already shows
    // the brand + tool name, so the top masthead is redundant - hide it. Standalone
    // opens (direct / file://) keep the full masthead and the AD& credit link.
    var embedded; try { embedded = window.top !== window.self; } catch (e) { embedded = true; }
    if (embedded) root.className += ' adui-embedded';
    root.setAttribute('data-theme', opts.theme === 'light' ? 'light' : 'dark');
    root.innerHTML =
      '<div class="adui-top"><div class="adui-bar">'
        + '<a class="adui-mark" href="'+CREDIT_URL+'" target="_blank" rel="noopener noreferrer">'+CREDIT_LABEL+'</a>'
        + '<span class="adui-div">·</span>'
        + '<span class="adui-title"></span>'
      + '</div></div>'
      + '<div class="adui-lg"><div class="adui-pill"></div></div>';
    document.body.appendChild(root);

    var elTitle = root.querySelector('.adui-title');
    var elPill  = root.querySelector('.adui-pill');
    elTitle.textContent = opts.title || '';
    elPill.innerHTML    = segHTML(opts.hints);

    function onKey(e){
      if (!e.key) return;
      if (e.key.toLowerCase() === 'h' && !e.metaKey && !e.ctrlKey && !e.altKey){
        var tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        root.classList.toggle('adui-hidden');
      }
    }
    window.addEventListener('keydown', onKey);

    var handle = {
      el: root,
      setTitle: function(s){ elTitle.textContent = s || ''; return handle; },
      setHints: function(h){ elPill.innerHTML = segHTML(h); return handle; },
      theme:    function(t){ root.setAttribute('data-theme', t === 'light' ? 'light':'dark'); return handle; },
      hide:     function(){ root.classList.add('adui-hidden'); return handle; },
      show:     function(){ root.classList.remove('adui-hidden'); return handle; },
      toggle:   function(){ root.classList.toggle('adui-hidden'); return handle; },
      destroy:  function(){ window.removeEventListener('keydown', onKey); root.remove(); if (current === handle) current = null; },
    };
    current = handle;
    return handle;
  }

  window.PT = Object.assign(window.PT || {}, { ui: ui });
})();
