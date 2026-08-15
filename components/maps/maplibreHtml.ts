/**
 * The HTML document rendered inside the maps WebView. It runs the exact same
 * MapLibre GL + Carto dark-matter basemap as the website (components/ui/map.tsx)
 * and replicates the site's marker/popup DOM + CSS 1:1 (globals.css keyframes
 * included), talking to React Native over postMessage.
 */
export const MAPLIBRE_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link href="https://unpkg.com/maplibre-gl@5.16.0/dist/maplibre-gl.css" rel="stylesheet" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script src="https://unpkg.com/maplibre-gl@5.16.0/dist/maplibre-gl.js"></script>
<style>
  html, body { margin: 0; padding: 0; height: 100%; width: 100%; background: #030405; }
  #map { position: absolute; inset: 0; }
  * { -webkit-tap-highlight-color: transparent; font-family: 'Geist', system-ui, sans-serif; }

  /* globals.css — popup chrome reset */
  .maplibregl-popup-content { background-color: transparent !important; box-shadow: none !important; padding: 0 !important; border-radius: 0 !important; }
  .maplibregl-popup-tip { display: none !important; }
  .maplibregl-ctrl-attrib { display: none !important; }

  /* globals.css — limited-time popup pulse */
  @keyframes place-popup-active-now {
    0%, 100% { box-shadow: 0 0 0 1px rgb(248 113 113 / 0.35), 0 0 10px rgb(239 68 68 / 0.12); }
    50% { box-shadow: 0 0 0 3px rgb(248 113 113 / 0.45), 0 0 22px rgb(239 68 68 / 0.22); }
  }
  .place-popup-active-now { animation: place-popup-active-now 2.2s ease-in-out infinite; }

  /* globals.css — places pop onto the map once their image loads */
  @keyframes place-pop-in {
    0% { opacity: 0; transform: scale(0.4) translateY(6px); }
    60% { transform: scale(1.08) translateY(0); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  .place-pop-in { animation: place-pop-in 0.42s cubic-bezier(0.34, 1.56, 0.64, 1); }

  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

  /* Radar ring (maps page user location marker) */
  .radar-ring {
    width: 14px; height: 14px; border: 2px solid #ff0000; border-radius: 50%;
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    animation: ripple 2s infinite ease-out; transform-origin: center;
  }
  @keyframes ripple { 0% { transform: translate(-50%,-50%) scale(1); opacity: 0.6; } 100% { transform: translate(-50%,-50%) scale(4); opacity: 0; } }

  /* --- place marker (dashboard/maps) --- */
  .m-place { position: relative; transition: transform 0.2s; border-radius: 6px; }
  .m-place.active { transform: scale(1.10); z-index: 10; }
  .m-place img, .m-place .grad {
    display: block; border: 2px solid #fff; border-radius: 6px;
    height: 48px; width: 40px; object-fit: cover;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }
  .m-place.active img, .m-place.active .grad { box-shadow: 0 0 0 2px transparent, 0 0 0 6px #ff2056; }
  .m-place .popup-dot { position: absolute; top: -8px; right: -8px; z-index: 10; }
  .m-place .popup-dot > div { width: 16px; height: 16px; background: #f6339a; border-radius: 9999px; border: 2px solid #fff; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
  .m-place .cat-emoji { position: absolute; top: -8px; left: -8px; z-index: 10; font-size: 24px; border-radius: 9999px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.11); box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }

  /* --- thumbnail marker (collection map) --- */
  .m-thumb { display: flex; flex-direction: column; align-items: center; position: relative; }
  .m-thumb .label {
    pointer-events: none; margin-bottom: 4px; max-width: 112px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    border-radius: 6px; padding: 2px 6px; font-size: 10px; font-weight: 600; line-height: 1.25;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); backdrop-filter: blur(4px);
    background: rgba(23,23,23,0.8); color: #fff; box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }
  .m-thumb.active .label { background: rgba(255,32,86,0.9); box-shadow: 0 0 0 1px rgba(255,161,173,0.6), 0 4px 6px -1px rgb(0 0 0 / 0.1); }
  .m-thumb .pic {
    width: 44px; height: 44px; overflow: hidden; border-radius: 16px; border: 2px solid #fff; background: #262626;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); transition: transform .2s;
  }
  .m-thumb.active .pic { border-color: #ff637e; transform: scale(1.10); }
  .m-thumb .pic img, .m-thumb .pic .grad { width: 100%; height: 100%; object-fit: cover; display: block; }
  .m-thumb .ptr { width: 8px; height: 8px; margin-top: -4px; transform: rotate(45deg); border-radius: 1px; background: #fff; border-bottom: 2px solid #fff; border-right: 2px solid #fff; }
  .m-thumb.active .ptr { background: #ff637e; border-color: #ff637e; }

  /* --- participant avatar marker --- */
  .m-part { position: relative; display: flex; align-items: center; justify-content: center; }
  .m-part .ring { position: absolute; width: 40px; height: 40px; border-radius: 9999px; opacity: 0.4; animation: partPing 1.8s ease-out infinite; }
  @keyframes partPing { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(2.2); opacity: 0; } }
  .m-part .av { position: relative; width: 32px; height: 32px; overflow: hidden; border-radius: 9999px; border: 2px solid #fff; box-shadow: 0 10px 15px -3px rgb(0 0 0/0.1); display:flex; align-items:center; justify-content:center; }
  .m-part .av.you { border-color: #74d4ff; }
  .m-part .av img { width: 100%; height: 100%; object-fit: cover; }
  .m-part .av span { font-size: 10px; font-weight: 700; color: #fff; }

  /* --- numbered recommendation pin --- */
  .m-num { display: flex; width: 24px; height: 24px; align-items: center; justify-content: center; border-radius: 9999px; border: 2px solid #fff; font-size: 11px; font-weight: 700; color: #fff; box-shadow: 0 4px 6px -1px rgb(0 0 0/0.1); background: #ff2056; transition: transform .15s; }
  .m-num.active { transform: scale(1.25); background: #ec003f; }

  /* --- small user dot (chat mini-map) --- */
  .m-dot { display: block; width: 14px; height: 14px; border-radius: 9999px; border: 2px solid #fff; background: #2b7fff; box-shadow: 0 4px 6px -1px rgb(0 0 0/0.1); }

  /* --- university marker --- */
  .m-uni { display: flex; align-items: center; justify-content: center; border-radius: 9999px; background: #7f22fe; border: 2px solid #fff; box-shadow: 0 10px 15px -3px rgb(0 0 0/0.1); width: 40px; height: 40px; }

  /* --- popup cards --- */
  .popup-card { overflow: hidden; border-radius: 6px; border: 1px solid rgba(255,255,255,0.11); background: #090a0c; width: 248px; }
  .popup-card .img-wrap { position: relative; height: 128px; overflow: hidden; border-top-left-radius: 6px; border-top-right-radius: 6px; }
  .popup-card .img-wrap img, .popup-card .img-wrap .grad { width: 100%; height: 100%; object-fit: cover; display:block; }
  .popup-card .badges { position: absolute; top: 8px; right: 8px; z-index: 10; display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
  .popup-card .badge-popup { padding: 2px 8px; border-radius: 9999px; background: #f6339a; font-size: 8px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 1px 2px rgb(0 0 0/0.05); border: 1px solid rgba(251,100,182,0.5); }
  .popup-card .badge-cat { padding: 2px 8px; border-radius: 9999px; background: #fff; font-size: 10px; font-weight: 700; color: #000; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 1px 2px rgb(0 0 0/0.05); border: 1px solid rgba(255,255,255,0.11); display:flex; align-items:center; justify-content:center; }
  .popup-card .body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
  .popup-card .cat { font-size: 12px; font-weight: 500; color: #868686; text-transform: uppercase; letter-spacing: 0.025em; }
  .popup-card h3 { margin: 0; font-weight: 600; color: #e8e8e8; line-height: 1.25; font-size: 16px; }
  .popup-card .hours { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #868686; }
  .popup-card .actions { display: flex; gap: 8px; padding-top: 4px; align-items: center; }
  .pbtn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 32px; border-radius: 6px; font-size: 12px; font-weight: 500; border: none; cursor: pointer; }
  .pbtn-primary { flex: 1; background: #e8e8e8; color: #050607; }
  .pbtn-outline { flex: 1; background: rgba(255,255,255,0.048); color: #e8e8e8; border: 1px solid rgba(255,255,255,0.16); }
  .pbtn-ghost { padding: 0 8px; background: transparent; color: #e8e8e8; }
  .pbtn-rose { width: 100%; background: #ff2056; color: #fff; }

  .popup-card.dark56 { width: 224px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.10); background: #171717; }
  .popup-card.dark56 .img-wrap { height: 112px; border-radius: 0; }
  .popup-card.dark56 .body { padding: 12px; gap: 8px; }
  .popup-card.dark56 .cat { font-size: 10px; color: #a1a1a1; letter-spacing: 0.025em; }
  .popup-card.dark56 h3 { font-size: 14px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .popup-card.dark56 .pbtn-white { width: 100%; height: 32px; border-radius: 6px; background: #fff; color: #000; font-size: 12px; font-weight: 700; }

  .popup-close { position: absolute; top: -10px; right: -10px; z-index: 20; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 9999px; background: #090a0c; border: 1px solid rgba(255,255,255,0.11); color: #e8e8e8; cursor: pointer; }
</style>
</head>
<body>
<div id="map"></div>
<script>
(function() {
  var RN = window.ReactNativeWebView;
  function send(msg) { RN && RN.postMessage(JSON.stringify(msg)); }
  window.onerror = function(m) { send({ type: 'error', message: String(m) }); };

  var DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
  var map = null;
  var markers = {}; // id -> { marker, spec, el }
  var popup = null;
  var pendingCmds = [];
  var loaded = false;

  var ICONS = {
    navigation: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
    externalLink: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    globe: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    clock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    x: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    gradCap: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function markerHtml(spec) {
    var el = document.createElement('div');
    if (spec.kind === 'place') {
      el.className = 'm-place' + (spec.active ? ' active' : '') + (spec.activePopup ? ' place-popup-active-now' : '');
      var inner = '';
      if (spec.image) {
        inner += '<img class="place-pop-in" src="' + esc(spec.image) + '" />';
      } else {
        inner += '<div class="grad" style="background:' + esc(spec.gradient || '#333') + '"></div>';
      }
      if (spec.popupDot) inner += '<div class="popup-dot"><div class="animate-pulse"></div></div>';
      if (spec.emoji) inner += '<div class="cat-emoji">' + esc(spec.emoji) + '</div>';
      el.innerHTML = inner;
    } else if (spec.kind === 'user') {
      el.innerHTML = '<div style="position:relative;width:48px;height:48px;pointer-events:none;">' +
        '<span class="radar-ring" style="animation-delay:0s"></span>' +
        '<span class="radar-ring" style="animation-delay:1s"></span>' +
        '<span style="position:absolute;border-radius:9999px;background:#ff2056;border:2px solid #fff;box-shadow:0 10px 15px -3px rgb(0 0 0/0.1);width:14px;height:14px;top:50%;left:50%;transform:translate(-50%,-50%);"></span></div>';
    } else if (spec.kind === 'thumb') {
      el.className = 'm-thumb' + (spec.active ? ' active' : '');
      var t = '';
      if (spec.name) t += '<span class="label">' + esc(spec.name) + '</span>';
      t += '<div class="pic">' + (spec.image ? '<img src="' + esc(spec.image) + '"/>' : '<div class="grad" style="background:' + esc(spec.gradient || '#333') + '"></div>') + '</div>';
      t += '<div class="ptr"></div>';
      el.innerHTML = t;
    } else if (spec.kind === 'participant') {
      el.className = 'm-part';
      var p = '';
      if (spec.isYou) p += '<span class="ring" style="background:' + esc(spec.color) + '"></span>';
      p += '<div class="av' + (spec.isYou ? ' you' : '') + '" style="background:' + esc(spec.color) + '">' +
        (spec.photo ? '<img src="' + esc(spec.photo) + '"/>' : '<span>' + esc(spec.initials || '??') + '</span>') + '</div>';
      el.innerHTML = p;
    } else if (spec.kind === 'numbered') {
      el.className = 'm-num' + (spec.active ? ' active' : '');
      el.textContent = String(spec.index);
    } else if (spec.kind === 'dot') {
      el.innerHTML = '<span class="m-dot"></span>';
    } else if (spec.kind === 'university') {
      el.innerHTML = '<div class="m-uni">' + ICONS.gradCap + '</div>';
    }
    if (spec.clickable) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        send({ type: 'markerClick', id: spec.id });
      });
    }
    return el;
  }

  function setMarkers(specs) {
    var next = {};
    specs.forEach(function(spec) {
      var existing = markers[spec.id];
      if (existing && existing.json === JSON.stringify(spec)) {
        next[spec.id] = existing;
        delete markers[spec.id];
        return;
      }
      if (existing) { existing.marker.remove(); delete markers[spec.id]; }
      var el = markerHtml(spec);
      var m = new maplibregl.Marker({ element: el, anchor: spec.kind === 'thumb' ? 'bottom' : 'center' })
        .setLngLat([spec.lng, spec.lat])
        .addTo(map);
      next[spec.id] = { marker: m, json: JSON.stringify(spec) };
    });
    Object.keys(markers).forEach(function(id) { markers[id].marker.remove(); });
    markers = next;
  }

  function popupHtml(spec) {
    var wrap = document.createElement('div');
    wrap.style.position = 'relative';
    var p = spec.place || {};
    if (spec.kindCard === 'placeCard') {
      var imgHtml = p.image
        ? '<img src="' + esc(p.image) + '"/>'
        : '<div class="grad" style="background:' + esc(p.gradient || '#333') + '"></div>';
      var badges = '<div class="badges">' +
        (p.popup ? '<span class="badge-popup">Popup</span>' : '') +
        (p.catEmoji ? '<span class="badge-cat">' + esc(p.catEmoji) + ' ' + esc(p.category) + '</span>' : '') +
        '</div>';
      var actions;
      if (spec.signedIn) {
        actions = '<button class="pbtn pbtn-primary" data-action="directions">' + ICONS.navigation + ' Directions</button>' +
          '<button class="pbtn pbtn-outline" data-action="expand">' + ICONS.externalLink + '</button>' +
          (p.website ? '<button class="pbtn pbtn-ghost" data-action="website">' + ICONS.globe + '</button>' : '');
      } else {
        actions = '<button class="pbtn pbtn-rose" data-action="createAccount">Create an account to see more</button>';
      }
      wrap.innerHTML =
        '<div class="popup-card' + (p.activePopup ? ' place-popup-active-now' : '') + '">' +
          '<div class="img-wrap">' + imgHtml + badges + '</div>' +
          '<div class="body">' +
            '<div><div class="cat">' + esc(p.category) + '</div><h3>' + esc(p.name) + '</h3></div>' +
            (p.hours ? '<div class="hours">' + ICONS.clock + '<span>' + esc(p.hours) + '</span></div>' : '') +
            '<div class="actions">' + actions + '</div>' +
          '</div>' +
        '</div>' +
        '<button class="popup-close" data-action="close">' + ICONS.x + '</button>';
    } else {
      // collection place preview card
      var img2 = p.image
        ? '<img src="' + esc(p.image) + '"/>'
        : '<div class="grad" style="background:' + esc(p.gradient || '#333') + '"></div>';
      wrap.innerHTML =
        '<div class="popup-card dark56">' +
          '<div class="img-wrap">' + img2 + '</div>' +
          '<div class="body">' +
            '<div>' + (p.category ? '<div class="cat">' + esc(p.category) + '</div>' : '') + '<h3>' + esc(p.name) + '</h3></div>' +
            '<button class="pbtn pbtn-white" data-action="expand">Show more details</button>' +
          '</div>' +
        '</div>' +
        '<button class="popup-close" data-action="close">' + ICONS.x + '</button>';
    }
    wrap.querySelectorAll('[data-action]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var action = btn.getAttribute('data-action');
        if (action === 'close') {
          send({ type: 'popupClose' });
        } else {
          send({ type: 'popupAction', action: action, id: spec.id });
        }
      });
    });
    return wrap;
  }

  function setPopup(spec) {
    if (popup) { popup.remove(); popup = null; }
    if (!spec) return;
    popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 32, maxWidth: 'none' })
      .setLngLat([spec.lng, spec.lat])
      .setDOMContent(popupHtml(spec))
      .addTo(map);
  }

  function handleCmd(cmd) {
    if (cmd.type === 'init') {
      if (map) return;
      map = new maplibregl.Map({
        container: 'map',
        style: DARK_STYLE,
        center: cmd.center,
        zoom: cmd.zoom,
        minZoom: cmd.minZoom,
        maxBounds: cmd.maxBounds || undefined,
        attributionControl: false,
        interactive: cmd.interactive !== false
      });
      map.on('load', function() {
        loaded = true;
        send({ type: 'loaded' });
        pendingCmds.forEach(handleCmd);
        pendingCmds = [];
      });
      return;
    }
    if (!map) return;
    if (!loaded && cmd.type !== 'init') { pendingCmds.push(cmd); return; }
    if (cmd.type === 'setMarkers') setMarkers(cmd.markers);
    else if (cmd.type === 'setPopup') setPopup(cmd.popup);
    else if (cmd.type === 'flyTo') {
      var zoom = cmd.zoom;
      if (cmd.minTargetZoom != null) zoom = Math.max(map.getZoom(), cmd.minTargetZoom);
      map.flyTo({ center: cmd.center, zoom: zoom, duration: cmd.duration == null ? 1000 : cmd.duration });
    }
    else if (cmd.type === 'easeTo') map.easeTo({ center: cmd.center, zoom: cmd.zoom, duration: cmd.duration || 0 });
    else if (cmd.type === 'fitBounds') {
      var pts = cmd.points;
      if (!pts || pts.length === 0) return;
      if (pts.length === 1) { map.easeTo({ center: pts[0], zoom: cmd.singleZoom || 13, duration: cmd.duration || 0 }); return; }
      var bounds = new maplibregl.LngLatBounds(pts[0], pts[0]);
      pts.forEach(function(pt) { bounds.extend(pt); });
      map.fitBounds(bounds, { padding: cmd.padding == null ? 48 : cmd.padding, maxZoom: cmd.maxZoom == null ? 15 : cmd.maxZoom, duration: cmd.duration == null ? 0 : cmd.duration });
    }
    else if (cmd.type === 'resize') { map.resize(); map.triggerRepaint(); }
  }

  window.__cmd = handleCmd;
  send({ type: 'ready' });
})();
</script>
</body>
</html>`;
