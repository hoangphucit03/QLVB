/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness loads isolated transpiled server modules with mock dependencies. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, mocks = {}) {
  const filename = path.resolve(file);
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const localRequire = name => {
    if (name in mocks) return mocks[name];
    if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), name + '.ts'), mocks);
    return require(name);
  };
  new Function('require', 'module', 'exports', code)(localRequire, mod, mod.exports);
  return mod.exports;
}
test('Logout: JSON requests can clear expired sessions; cross-origin requests remain blocked', async () => {
  const { NextRequest } = require('next/server');
  const { middleware } = load('src/middleware.ts', {
    './lib/session': { SESSION_COOKIE_NAME: 'docflow_session', verifySessionToken: async () => null },
  });
  const request = (path, headers = {}) => new NextRequest('http://localhost:3000' + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: 'docflow_session=expired', ...headers }, body: '{}',
  });
  assert.equal((await middleware(request('/api/auth/logout'))).status, 200);
  assert.equal((await middleware(request('/api/auth/logout', { Origin: 'https://untrusted.example' }))).status, 403);
  assert.equal((await middleware(request('/api/documents/incoming'))).status, 401);
  const nonJson = new NextRequest('http://localhost:3000/api/auth/logout', { method: 'POST' });
  assert.equal((await middleware(nonJson)).status, 415);
});
test('Statistics: >1000 rows, overdue, urgency, completed, year and prototype keys', () => {
  const { calculateStatistics } = load('src/lib/statistics.ts');
  const base = { nam: 2026, ngay_den: '2026-10-31', ngay_tao: '2026-10-31', trang_thai: 'Chưa xử lý', han_xu_ly: '', muc_do_uu_tien: 'Thường', loai_van_ban: '__proto__', co_quan_gui: 'A', nguoi_xu_ly: '' };
  const rows = Array.from({ length: 1002 }, () => ({ ...base }));
  rows[0] = { ...base, trang_thai: 'Đang xử lý', han_xu_ly: '2026-10-30' };
  rows[1] = { ...base, trang_thai: 'Đã hoàn thành', han_xu_ly: '2026-10-20' };
  rows[2] = { ...base, muc_do_uu_tien: 'Khẩn' };
  rows.push({ ...base, nam: 2025 });
  const { stats, breakdown } = calculateStatistics(rows, [], 2026, new Date('2026-10-30T18:00:00Z'));
  assert.equal(stats.tong_den, 1002); assert.equal(stats.qua_han, 1); assert.equal(stats.da_hoan_thanh, 1); assert.equal(stats.can_xu_ly_gap, 1);
  assert.equal(stats.chua_xu_ly + stats.dang_xu_ly + stats.qua_han + stats.da_hoan_thanh, stats.tong_den);
  assert.equal(breakdown.types.__proto__, 1002); assert.equal(breakdown.assignees['Chưa phân công'], 1002);
  assert.equal(stats.thong_ke_thang[9].van_ban_den, 1002);
});
test('Attachment protocols reject executable URLs', () => {
  const { vanBanDenSchema } = load('src/lib/schema.ts');
  const doc = { nam: 2026, so_den: 1, ngay_den: '2026-10-31', so_ky_hieu: '1/CV', ngay_ban_hanh: '2026-10-31', co_quan_gui: 'A', loai_van_ban: 'A', trich_yeu: 'Test' };
  assert.equal(vanBanDenSchema.safeParse({ ...doc, link_dinh_kem: 'javascript:alert(1)' }).success, false);
  assert.equal(vanBanDenSchema.safeParse({ ...doc, link_dinh_kem: 'https://example.com' }).success, true);
});
test('Sheets outage: reads reject, deletes fail, no demo success; writes use RAW', async () => {
  process.env.GOOGLE_CLIENT_EMAIL = 'test@example.com'; process.env.GOOGLE_PRIVATE_KEY = 'test';
  let failing = true, captured;
  const values = { get: async () => { if (failing) throw new Error('sensitive upstream error'); return { data: { values: [] } }; }, clear: async () => { throw new Error('sensitive'); }, append: async args => { captured = args; } };
  const mock = { google: { auth: { JWT: class {} }, sheets: () => ({ spreadsheets: { values } }) } };
  const sheets = load('src/lib/google-sheets.ts', { googleapis: mock, './utils': { generateDocumentId: () => 'TEST' } });
  await assert.rejects(sheets.getVanBanDenList()); await assert.rejects(sheets.getVanBanDiList());
  await assert.rejects(sheets.addVanBanDi({ nam: 2026, so_di: 0 }));
  assert.equal((await sheets.deleteVanBanDen('missing')).success, false);
  assert.equal((await sheets.deleteVanBanDi('missing')).success, false);
  failing = false;
  await sheets.addVanBanDi({ nam: 2026, so_di: 0, trich_yeu: '=IMPORTXML("https://example.com")' });
  assert.equal(captured.valueInputOption, 'RAW'); assert.equal(captured.requestBody.values[0][2], '');
});
test('Session: no fallback secret, reject wrong role, missing expiry and wrong signature', async () => {
  const { SignJWT } = require('jose');
  process.env.SESSION_SECRET = 'test-session-secret-of-at-least-32-characters';
  const { verifySessionToken, getSecretKey } = load('src/lib/session.ts');
  const key = getSecretKey();
  const claims = { username: 'admin', role: 'Quản trị viên', name: 'Admin', unit: 'Test' };
  const token = data => new SignJWT(data).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1h').sign(key);
  assert.ok(await verifySessionToken(await token(claims)));
  const forged = await new SignJWT(claims).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1h').sign(new TextEncoder().encode('different-key-that-is-at-least-32-characters'));
  assert.equal(await verifySessionToken(forged), null);
  assert.equal(await verifySessionToken(await token({ ...claims, role: 'reader' })), null);
  assert.equal(await verifySessionToken(await new SignJWT(claims).setProtectedHeader({ alg: 'HS256' }).sign(key)), null);
  assert.equal(await verifySessionToken('invalid'), null);
  const expired = await new SignJWT(claims).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(1).sign(key);
  assert.equal(await verifySessionToken(expired), null);
  delete process.env.SESSION_SECRET; assert.throws(getSecretKey);
});

test('Login enforces process-wide request ceiling', async () => {
  const route = load('src/app/api/auth/login/route.ts', {
    '@/lib/schema': { loginSchema: { safeParse: () => ({ success: true, data: { password: 'wrong' } }) } },
    '@/lib/auth': { verifyAdminPassword: () => false, setSessionCookie: async () => {} },
  });
  for (let i = 0; i < 30; i++) assert.equal((await route.POST({ json: async () => ({}) })).status, 401);
  const blocked = await route.POST({ json: async () => ({}) });
  assert.equal(blocked.status, 429); assert.equal(blocked.headers.get('retry-after'), '60');
});
