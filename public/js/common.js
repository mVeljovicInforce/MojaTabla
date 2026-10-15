// Shared helpers. User-provided text must only be inserted with textContent.

const CATEGORY_LABELS = {
  obavestenje: 'Obaveštenje',
  pomoc: 'Pomoć',
  poklanjam_prodajem: 'Poklanjam / Prodajem',
  izgubljeno_nadjeno: 'Izgubljeno / Nađeno',
  problem_u_kraju: 'Problem u kraju',
  dogadjaj: 'Događaj',
};

function getStreetId() {
  return new URLSearchParams(window.location.search).get('street');
}

function boardUrl(streetId) {
  return '/board.html?street=' + encodeURIComponent(streetId);
}

async function api(path, options) {
  const init = { headers: { Accept: 'application/json' } };
  if (options && options.body) {
    init.method = options.method || 'POST';
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(options.body);
  }
  const response = await fetch('/api' + path, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Došlo je do greške. Pokušajte ponovo.');
  return data;
}

function showMessage(text) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.hidden = !text;
}

// The server stores UTC as "YYYY-MM-DD HH:MM:SS". Shown as "15.10.2026. u 13:19" in Belgrade time.
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Belgrade',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function formatDate(value) {
  const parts = {};
  for (const { type, value: v } of dateFormat.formatToParts(new Date(value.replace(' ', 'T') + 'Z'))) {
    parts[type] = v;
  }
  return `${parts.day}.${parts.month}.${parts.year}. u ${parts.hour}:${parts.minute}`;
}

function element(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
