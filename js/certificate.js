(function () {

  // ====== SETUP ======
  // Google Sheet ka "Publish to web" CSV link yaha paste karo (steps: SHEET-SETUP.md).
  // (Link laga hua hai. Isko tabhi badlo jab nayi sheet use karni ho.)
  var SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSoTURQly4eubl9wLsMe5FQisehlnIJAx4mdYT6xGnzQfNidWvq3uRskolRcKB6nrq9QjXYslJqJ2nD/pub?gid=0&single=true&output=csv';
  var FALLBACK_JSON = '';
  // ===================

  // Sheet ke column ke naam - inme se kuch bhi likho, chalega (capital/small farak nahi padta)
  var COLS = {
    id:       ['certificate id', 'certificate no', 'certificate number', 'certificate', 'cert id', 'id'],
    name:     ['name', 'student name', 'student', 'candidate name'],
    course:   ['course', 'course name', 'training', 'program'],
    duration: ['duration', 'course duration', 'time', 'period'],
    date:     ['assigned date', 'date', 'issue date', 'issued', 'assigned on', 'issued on']
  };

  var form = document.getElementById('verify-form');
  var input = document.getElementById('cert-id');
  var stage = document.getElementById('verify-stage');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cache = null;
  var NL = String.fromCharCode(10);
  var CR = String.fromCharCode(13);

  function normalize(v) {
    return String(v || '').trim().toUpperCase().replace(/[^A-Z0-9\-_]/g, '');
  }

  function parseCSV(text) {
    var rows = [], row = [], cur = '', q = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text.charAt(i);
      if (q) {
        if (c === '"') {
          if (text.charAt(i + 1) === '"') { cur += '"'; i++; } else { q = false; }
        } else { cur += c; }
      } else if (c === '"') {
        q = true;
      } else if (c === ',') {
        row.push(cur); cur = '';
      } else if (c === NL || c === CR) {
        if (c === CR && text.charAt(i + 1) === NL) { i++; }
        row.push(cur); cur = ''; rows.push(row); row = [];
      } else {
        cur += c;
      }
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }

  function colIndex(header, names) {
    for (var n = 0; n < names.length; n++) {
      var k = header.indexOf(names[n]);
      if (k !== -1) { return k; }
    }
    return -1;
  }

  function sheetToMap(text) {
    var rows = parseCSV(text), map = {};
    if (!rows.length) { return map; }
    var header = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    var idx = {};
    Object.keys(COLS).forEach(function (k) { idx[k] = colIndex(header, COLS[k]); });
    if (idx.id === -1) { throw new Error('no id column'); }

    for (var r = 1; r < rows.length; r++) {
      var id = normalize(rows[r][idx.id]);
      if (!id) { continue; }
      var rec = {};
      ['name', 'course', 'duration', 'date'].forEach(function (k) {
        rec[k] = idx[k] === -1 ? '' : String(rows[r][idx[k]] || '').trim();
      });
      map[id] = rec;
    }
    return map;
  }

  function loadData() {
    if (cache) { return Promise.resolve(cache); }

    if (SHEET_CSV_URL) {
      return fetch(SHEET_CSV_URL).then(function (r) {
        if (!r.ok) { throw new Error('sheet'); }
        return r.text();
      }).then(function (t) { cache = sheetToMap(t); return cache; });
    }

    return fetch(FALLBACK_JSON, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) { throw new Error('data'); }
      return r.json();
    }).then(function (d) {
      var m = {};
      Object.keys(d).forEach(function (k) {
        if (k.charAt(0) === '_') { return; }
        var v = d[k];
        m[k] = { name: v.name || '', course: v.course || '', duration: v.duration || '', date: v.issued || '', demo: v.demo };
      });
      cache = m;
      return m;
    });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text !== undefined) { e.textContent = text; }
    return e;
  }

  // ISO date (2024-08-15) ko sundar format me dikhata hai, baaki jo sheet me likha ho wahi dikhata hai
  function fmtDate(v) {
    if (!v) { return ''; }
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      var d = new Date(v + 'T00:00:00');
      if (!isNaN(d)) { return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
    }
    return v;
  }

  function clear() { while (stage.firstChild) { stage.removeChild(stage.firstChild); } }

  function showScanning(id) {
    clear();
    var box = el('div', 'vr-scan');
    var ring = el('div', 'vr-ring');
    ring.appendChild(el('i', 'fa fa-shield'));
    box.appendChild(ring);
    box.appendChild(el('p', 'vr-scan-text', 'Verifying certificate ' + id + ' ...'));
    stage.appendChild(box);
  }

  function confetti(host) {
    if (reduceMotion) { return; }
    var colors = ['#f1c111', '#05668d', '#25d366', '#ffffff', '#e8505b'];
    for (var i = 0; i < 28; i++) {
      var s = el('span', 'vr-confetti');
      s.style.left = (Math.random() * 100) + '%';
      s.style.background = colors[i % colors.length];
      s.style.animationDelay = (Math.random() * 0.4) + 's';
      s.style.animationDuration = (1.2 + Math.random() * 1.2) + 's';
      s.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
      host.appendChild(s);
    }
  }

  function row(label, value) {
    var r = el('div', 'vr-row');
    r.appendChild(el('span', 'vr-label', label));
    r.appendChild(el('span', 'vr-value', value));
    return r;
  }

  function showValid(id, rec) {
    clear();
    var card = el('div', 'vr-card vr-valid');
    confetti(card);

    var badge = el('div', 'vr-badge');
    badge.innerHTML = '<svg viewBox="0 0 52 52" aria-hidden="true"><circle class="vr-circle" cx="26" cy="26" r="24" fill="none"/><path class="vr-tick" fill="none" d="M14 27l8 8 16-17"/></svg>';
    card.appendChild(badge);

    card.appendChild(el('h2', 'vr-title', 'Certificate Verified'));
    card.appendChild(el('p', 'vr-sub', 'This certificate is genuine and was issued by Autotech Nashik.'));

    // sirf wahi details dikhao jo sheet me bhari hui hain
    var rows = el('div', 'vr-rows');
    rows.appendChild(row('Certificate ID', id));
    if (rec.name)     { rows.appendChild(row('Issued To', rec.name)); }
    if (rec.course)   { rows.appendChild(row('Course', rec.course)); }
    if (rec.duration) { rows.appendChild(row('Duration', rec.duration)); }
    if (rec.date)     { rows.appendChild(row('Assigned On', fmtDate(rec.date))); }
    card.appendChild(rows);

    if (rec.demo) {
      card.appendChild(el('p', 'vr-demo', 'Demo record - Google Sheet connect karne par ye hat jayega'));
    }
    stage.appendChild(card);
  }

  function showInvalid(id, msg) {
    clear();
    var card = el('div', 'vr-card vr-invalid');
    var badge = el('div', 'vr-badge');
    badge.innerHTML = '<svg viewBox="0 0 52 52" aria-hidden="true"><circle class="vr-circle" cx="26" cy="26" r="24" fill="none"/><path class="vr-tick" fill="none" d="M17 17l18 18M35 17L17 35"/></svg>';
    card.appendChild(badge);
    card.appendChild(el('h2', 'vr-title', msg ? 'Something went wrong' : 'Certificate Not Found'));
    card.appendChild(el('p', 'vr-sub', msg || ('No certificate found for ID "' + id + '". Please check the ID and try again, or contact us on +91 88302 75071.')));
    stage.appendChild(card);
  }

  function verify(raw, updateUrl) {
    var id = normalize(raw);
    if (!id) {
      clear();
      input.focus();
      return;
    }
    input.value = id;
    if (updateUrl && window.history && history.replaceState) {
      history.replaceState(null, '', '?id=' + encodeURIComponent(id));
    }
    showScanning(id);
    var started = Date.now();
    var wait = reduceMotion ? 0 : 1400;

    loadData().then(function (data) {
      var rec = Object.prototype.hasOwnProperty.call(data, id) ? data[id] : null;
      setTimeout(function () { rec ? showValid(id, rec) : showInvalid(id); },
        Math.max(0, wait - (Date.now() - started)));
    }).catch(function () {
      setTimeout(function () { showInvalid(id, 'Verification service is not reachable right now. Please try again in a moment.'); }, 300);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    verify(input.value, true);
  });

  var q = new URLSearchParams(window.location.search).get('id');
  if (q) { verify(q, false); }
})();
