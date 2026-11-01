/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS browser test runner. */
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { unzipSync, strFromU8 } = require('fflate');
require('@next/env').loadEnvConfig(process.cwd());

function pdfFixture() {
  const stream = 'BT /F1 20 Tf 72 740 Td (DOCFLOW LOCAL PDF TEST) Tj 0 -40 Td (Editable Word conversion) Tj ET';
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let text = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((obj, i) => { offsets.push(Buffer.byteLength(text)); text += `${i + 1} 0 obj\n${obj}\nendobj\n`; });
  const start = Buffer.byteLength(text);
  text += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return Buffer.from(text);
}
async function bytes(download) {
  const chunks = []; for await (const chunk of await download.createReadStream()) chunks.push(chunk);
  return Buffer.concat(chunks);
}
(async () => {
  const base = process.env.OCR_TEST_URL || 'http://localhost:3000';
  const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const browser = await chromium.launch({ headless: true, ...(fs.existsSync(edge) ? { executablePath: edge } : {}) });
  try {
    const context = await browser.newContext({ acceptDownloads: true });
    const response = await context.request.post(base + '/api/auth/login', { data: { password: process.env.DOCFLOW_PASSWORD } });
    assert.equal(response.status(), 200);
    const page = await context.newPage(); const issues = [];
    page.on('pageerror', error => { issues.push(error.message); console.error('Browser error:', error.message); });
    page.on('console', message => { if (message.type() === 'error') console.error('Browser console:', message.text()); });
    page.on('requestfailed', request => console.error('Request failed:', request.url(), request.failure()?.errorText));
    await page.goto(base + '/chuyen-doi');
    await page.getByRole('heading', { name: 'Chuyển đổi PDF / ảnh' }).waitFor();
    const uploads = [], external = [];
    page.on('request', request => {
      if (['POST', 'PUT', 'PATCH'].includes(request.method())) uploads.push(request.url());
      if (request.url().startsWith('http') && new URL(request.url()).origin !== base) external.push(request.url());
    });
    await page.getByLabel('Chọn tài liệu').setInputFiles({ name: 'sample.pdf', mimeType: 'application/pdf', buffer: pdfFixture() });
    await page.getByRole('button', { name: 'Nhận dạng tài liệu', exact: true }).click();
    await page.getByRole('button', { name: 'Tải text', exact: true }).waitFor({ timeout: 60000 });
    await page.waitForFunction(() => !Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tải text'))?.disabled);
    assert.match(await page.locator('#recognized-text').inputValue(), /DOCFLOW LOCAL PDF TEST/);
    let pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Word giữ vị trí chữ', exact: true }).click();
    const zip = unzipSync(await bytes(await pending));
    const xml = strFromU8(zip['word/document.xml']);
    assert.match(xml, /DOCFLOW LOCAL PDF TEST/); assert.match(xml, /w:framePr/); assert(!xml.includes('<w:drawing>'));
    await page.locator('#recognized-text').fill('Nội dung đã sửa trên máy người dùng.');
    pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Tải text', exact: true }).click();
    assert.match((await bytes(await pending)).toString('utf8'), /Nội dung đã sửa/);
    console.log('PASS digital PDF extraction, editable positioned Word and edited TXT download');

    const data = await page.evaluate(() => {
      const canvas = document.createElement('canvas'); canvas.width = 1400; canvas.height = 700;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0,0,1400,700); ctx.fillStyle = 'black'; ctx.font = '48px Arial';
      ctx.fillText('DOCFLOW OCR TEST 2026', 90, 170); ctx.fillText('Văn bản tiếng Việt', 90, 280);
      return canvas.toDataURL('image/png').split(',')[1];
    });
    const pasted = await page.getByRole('region', { name: 'Dán hoặc thả tài liệu' }).evaluate((element, base64) => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], 'pasted.png', { type: 'image/png' }));
      return !element.dispatchEvent(new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true }));
    }, data);
    assert.equal(pasted, true);
    await page.getByText('Đã chọn: pasted.png', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Nhận dạng tài liệu', exact: true }).click();
    await page.getByRole('button', { name: 'Tải text', exact: true }).waitFor({ timeout: 180000 });
    await page.waitForFunction(() => !Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tải text'))?.disabled, null, { timeout: 180000 });
    const ocr = await page.locator('#recognized-text').inputValue();
    assert.match(ocr, /DOCFLOW OCR TEST 2026/i); assert.match(ocr, /tiếng Việt/i);
    const textPasteAllowed = await page.locator('#recognized-text').evaluate(element => {
      const transfer = new DataTransfer(); transfer.setData('text/plain', 'Nội dung dán');
      return element.dispatchEvent(new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true }));
    });
    assert.equal(textPasteAllowed, true);
    console.log('PASS clipboard image input and ordinary text paste remains available');
    fs.mkdirSync('test-results', { recursive: true });
    await page.screenshot({ path: 'test-results/ocr-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.screenshot({ path: 'test-results/ocr-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByLabel('Chọn tài liệu').setInputFiles({ name: 'force-ocr.pdf', mimeType: 'application/pdf', buffer: pdfFixture() });
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Nhận dạng tài liệu', exact: true }).click();
    await page.getByRole('button', { name: 'Tải text', exact: true }).waitFor({ timeout: 180000 });
    await page.waitForFunction(() => !Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tải text'))?.disabled, null, { timeout: 180000 });
    assert.match(await page.locator('#recognized-text').inputValue(), /DOCFLOW LOCAL PDF TEST/i);
    console.log('PASS PDF render-to-OCR pipeline and responsive mobile layout');
    assert.equal(uploads.length, 0); assert.equal(external.length, 0);
    assert.deepEqual(issues, []);
    console.log('PASS Vietnamese/English image OCR; no uploads and no third-party requests');
    await page.getByLabel('Chọn tài liệu').setInputFiles({ name: 'bad.pdf', mimeType: 'application/pdf', buffer: Buffer.from('invalid') });
    await page.getByRole('button', { name: 'Nhận dạng tài liệu', exact: true }).click();
    await page.locator('p[role="alert"]').waitFor();
    assert.equal(await page.getByRole('button', { name: 'Tải text', exact: true }).count(), 0);
    console.log('PASS invalid file rejected and previous result cleared');
    await page.getByRole('region', { name: 'Dán hoặc thả tài liệu' }).evaluate((element, base64) => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], 'dropped.png', { type: 'image/png' }));
      element.dispatchEvent(new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true }));
    }, data);
    await page.getByText('Đã chọn: dropped.png', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Nhận dạng tài liệu', exact: true }).click();
    await page.getByRole('button', { name: 'Hủy xử lý', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Đã hủy' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Tải text', exact: true }).count(), 0);
    console.log('PASS cancellation clears partial output');
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
