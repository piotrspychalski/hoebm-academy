// Zamek studia: strona HTML zaszyfrowana hasłem (bez zależności).
// Budowa (Node): PBKDF2-SHA256 → AES-256-GCM; wynik to mała strona z polem hasła, która odszyfrowuje treść w przeglądarce
// (WebCrypto) i podmienia dokument (document.write). Adres studia nie jest tajny — tajne jest tylko hasło (sekret repo
// STUDIO_PASSWORD), więc publiczny artefakt GitHub Pages nie zdradza niczego poza zaszyfrowanym blokiem.
// Hasło zapamiętane: sessionStorage (karta) albo localStorage („zapamiętaj na tym urządzeniu”).
const crypto = require('crypto');
const ITER = 310000;

function lock(html, password, title = 'Studio', favicon = '') {
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(password, salt, ITER, 32, 'sha256');
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([c.update(html, 'utf8'), c.final(), c.getAuthTag()]);   // WebCrypto: szyfrogram || tag
  const payload = Buffer.concat([salt, iv, enc]).toString('base64');
  return `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><meta name="referrer" content="no-referrer"><title>${title}</title>${favicon ? `<link rel="icon" type="image/svg+xml" href="${favicon}">` : ''}
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#F2F0F1;color:#1B5996;font:15px/1.5 "IBM Plex Mono",ui-monospace,monospace}
form{display:grid;gap:10px;width:min(320px,90vw)} b{font-weight:600;letter-spacing:.08em}
input[type=password]{font:inherit;padding:10px 12px;border:1.5px solid #1B5996;background:#fff;color:#1B5996}
button{font:inherit;font-weight:600;padding:10px;border:0;background:#1B5996;color:#F2F0F1;cursor:pointer}
label{font-size:13px;color:#38305F} #e{color:#C2185B;min-height:1.5em;font-size:13px}
</style></head><body>
<form id="f"><b>SPORTS ACADEMY · STUDIO</b>
<input type="password" id="p" autocomplete="current-password" placeholder="hasło" aria-label="Hasło" autofocus>
<label><input type="checkbox" id="r"> zapamiętaj na tym urządzeniu</label>
<button>Otwórz</button><div id="e" role="status"></div></form>
<script>
const P = '${payload}', K = 'sa-studio-pass', ITER = ${ITER};
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const get = k => { try { return sessionStorage.getItem(k) || localStorage.getItem(k); } catch { return null; } };
const put = (k, v, keep) => { try { sessionStorage.setItem(k, v); if (keep) localStorage.setItem(k, v); } catch {} };
async function open(pass, keep) {
  const d = b64(P), salt = d.slice(0, 16), iv = d.slice(16, 28), data = d.slice(28);
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const html = new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data));
  put(K, pass, keep);
  document.open(); document.write(html); document.close();
}
const e = document.getElementById('e');
document.getElementById('f').onsubmit = ev => {
  ev.preventDefault(); e.textContent = 'Otwieram…';
  open(document.getElementById('p').value, document.getElementById('r').checked).catch(() => { e.textContent = 'Złe hasło.'; });
};
const saved = get(K); if (saved) open(saved, false).catch(() => { try { sessionStorage.removeItem(K); localStorage.removeItem(K); } catch {} });
</script></body></html>
`;
}
module.exports = { lock };
