// Round-trip probe: register -> login -> auth/me with a REAL token against
// the deployed backend, to find where the post-login validation diverges.
const BASE = 'https://simpus-backend.vercel.app';
const stamp = Date.now().toString(36);
const USER = {
  username: `probe_${stamp}`,
  password: 'ProbePass123',
  name: 'Claude Probe (temporary)',
  role: 'STAFF',
};

const j = async (label, path, opts = {}) => {
  const res = await fetch(BASE + path, opts);
  let body;
  try {
    body = await res.json();
  } catch {
    body = '(non-JSON)';
  }
  console.log(`${label}: HTTP ${res.status} ${JSON.stringify(body).slice(0, 300)}`);
  return { status: res.status, body };
};

// 1. Register a throwaway account (ignore 409 if a rerun)
const reg = await j('REGISTER', '/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(USER),
});
if (reg.status >= 400 && reg.status !== 409) {
  console.log('Register unavailable — stopping.');
  process.exit(0);
}

// 2. Login with it
const login = await j('LOGIN   ', '/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: USER.username, password: USER.password }),
});

if (!login.body?.token) {
  console.log('No token — stopping.');
  process.exit(0);
}
console.log(`TOKEN first-chars: ${String(login.body.token).slice(0, 24)}…`);

// 3. auth/me with the fresh token — THE decisive call
await j('ME(https)', '/auth/me', {
  headers: { Authorization: `Bearer ${login.body.token}` },
});
