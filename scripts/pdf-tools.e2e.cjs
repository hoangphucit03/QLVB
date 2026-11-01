/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS browser regression runner. */
const { chromium, expect } = require('@playwright/test');
const { PDFDocument } = require('pdf-lib');
const assert = require('node:assert/strict');
const fs = require('node:fs');
require('@next/env').loadEnvConfig(process.cwd());
async function fixture(count, start) { const doc = await PDFDocument.create(); for(let i=0;i<count;i++){const p=doc.addPage([start+i,700]);p.drawText('PDF PAGE '+(i+1),{x:40,y:600,size:28});} return Buffer.from(await doc.save()); }
async function exported(page, button='Lưu PDF') {
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:button,exact:true}).click();
  const chunks=[];for await(const chunk of await (await pending).createReadStream())chunks.push(chunk);
  const doc=await PDFDocument.load(Buffer.concat(chunks));return doc.getPages().map(p=>({width:p.getWidth(),rotation:p.getRotation().angle}));
}
(async()=>{
  const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const browser=await chromium.launch({headless:true,...(fs.existsSync(edge)?{executablePath:edge}:{})});
  try {
    const context=await browser.newContext({acceptDownloads:true});const base='http://localhost:3000';
    assert.equal((await context.request.post(base+'/api/auth/login',{data:{password:process.env.DOCFLOW_PASSWORD}})).status(),200);
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/cong-cu-pdf');await page.getByRole('heading',{name:'Trình chỉnh sửa PDF'}).waitFor();
    const uploads=[],external=[];page.on('request',r=>{if(['POST','PUT'].includes(r.method()))uploads.push(r.url());if(r.url().startsWith('http')&&new URL(r.url()).origin!==base)external.push(r.url());});
    const a=await fixture(3,500),b=await fixture(2,600);
    await page.getByLabel('Mở PDF',{exact:true}).setInputFiles({name:'a.pdf',mimeType:'application/pdf',buffer:a});
    await page.getByRole('button',{name:'Xoay 90°',exact:true}).click();
    assert.deepEqual(await exported(page),[{width:500,rotation:90},{width:501,rotation:0},{width:502,rotation:0}]);
    await page.getByRole('button',{name:'Chèn từ PDF khác',exact:true}).click();
    await page.getByLabel('PDF để chèn',{exact:true}).setInputFiles({name:'b.pdf',mimeType:'application/pdf',buffer:b});
    await expect(page.getByLabel('Trang nguồn cần chèn')).toHaveValue('1-2');
    await page.getByLabel('Trang nguồn cần chèn').fill('2');await page.getByLabel('Vị trí chèn').selectOption('1');
    await page.getByRole('button',{name:'Chèn các trang',exact:true}).click();
    assert.deepEqual((await exported(page)).map(p=>p.width),[500,601,501,502]);
    console.log('PASS rotation and insertion of arbitrary source pages into the middle');
    await page.getByLabel('Chọn theo số trang').fill('3');await page.getByRole('button',{name:'Chọn trang',exact:true}).click();
    await page.getByRole('button',{name:'Xóa trang',exact:true}).click();
    assert.deepEqual((await exported(page)).map(p=>p.width),[500,601,502]);
    await page.getByRole('button',{name:'Hoàn tác',exact:true}).click();assert.equal((await exported(page)).length,4);
    await page.getByRole('button',{name:'Làm lại',exact:true}).click();assert.equal((await exported(page)).length,3);
    await page.getByLabel('Chọn theo số trang').fill('2-3');await page.getByRole('button',{name:'Chọn trang',exact:true}).click();
    assert.deepEqual((await exported(page,'Tách trang đã chọn')).map(p=>p.width),[601,502]);
    assert.equal((await exported(page)).length,3);
    console.log('PASS delete, undo/redo, extract selected pages without altering the working document');
    await page.getByRole('button',{name:'Bỏ chọn',exact:true}).click();
    await page.getByRole('button',{name:'Xem trang 2',exact:true}).click();
    await page.getByRole('button',{name:'Di chuyển trang sang trái',exact:true}).click();
    assert.deepEqual((await exported(page)).map(p=>p.width),[601,500,502]);
    await page.getByRole('button',{name:'Chọn tất cả',exact:true}).click();await page.getByRole('button',{name:'Xóa trang',exact:true}).click();
    await expect(page.locator('p[role="alert"]')).toHaveText('Phải giữ ít nhất một trang.');
    await page.getByRole('button',{name:'Bỏ chọn',exact:true}).click();
    await page.waitForFunction(()=>Array.from(document.querySelectorAll('canvas')).some(c=>c.width>500));
    fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/pdf-editor.png',fullPage:true});
    await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
    assert.equal((await PDFDocument.load(a)).getPageCount(),3);assert.equal(uploads.length,0);assert.equal(external.length,0);assert.deepEqual(errors,[]);
    console.log('PASS page reorder, prevent deleting all pages, mobile layout, thumbnails, no uploads/external calls');
    await context.close();
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
