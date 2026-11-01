'use client';
import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from 'pdfjs-dist';
import { Files, RotateCw, Trash2, Plus, Download, Undo2, Redo2, ArrowLeft, ArrowRight, Scissors } from 'lucide-react';
import { PdfPagePreview } from '@/components/documents/pdf-page-preview';
import { parsePageSelection } from '@/lib/pdf-page-selection';
type Page = { id: string; source: number; index: number; rotation: number; name: string };
type History = { pages: Page[]; past: Page[][]; future: Page[][] };
type Reply = { source: number; count: number; bytes: ArrayBuffer; error?: string };
export default function PdfEditorPage() {
  const [history, setHistory] = useState<History>({ pages: [], past: [], future: [] });
  const [selected, setSelected] = useState<string[]>([]), [active, setActive] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [range, setRange] = useState(''), [inserting, setInserting] = useState(false);
  const [insertSource, setInsertSource] = useState<{ source: number; count: number; name: string } | null>(null);
  const [insertRange, setInsertRange] = useState(''), [position, setPosition] = useState(0);
  const worker = useRef<Worker | null>(null), documents = useRef(new Map<number, PDFDocumentProxy>());
  const [sourceDocuments, setSourceDocuments] = useState(new Map<number, PDFDocumentProxy>());
  const pdfTasks = useRef(new Map<number, PDFDocumentLoadingTask>());
  const requests = useRef(new Map<number, { resolve: (value: Reply) => void; reject: (error: Error) => void }>());
  const sequence = useRef(0), session = useRef(0), totalBytes = useRef(0);
  const { pages } = history;
  const focused = pages.find(page => page.id === active) || pages[0];
  function dispose() {
    session.current++; worker.current?.terminate(); worker.current = null;
    for (const request of requests.current.values()) request.reject(new Error('Đã hủy phiên xử lý.'));
    requests.current.clear();
    for (const task of pdfTasks.current.values()) void task.destroy().catch(() => undefined);
    pdfTasks.current.clear();
    documents.current.clear(); totalBytes.current = 0;
  }
  useEffect(() => () => dispose(), []);
  function reset() {
    dispose(); setSourceDocuments(new Map()); setHistory({ pages: [], past: [], future: [] }); setSelected([]); setActive(''); setInsertSource(null); setInserting(false); setBusy(false); setError(''); setNotice('Đã đóng tài liệu.');
  }
  function request(payload: object) {
    if (!worker.current) {
      const instance = new Worker(new URL('../../../lib/pdf-tools.worker.ts', import.meta.url), { type: 'module' });
      instance.onmessage = event => { const entry = requests.current.get(event.data.id); if (!entry) return; requests.current.delete(event.data.id); if (event.data.error) entry.reject(new Error(event.data.error)); else entry.resolve(event.data); };
      instance.onerror = () => { for (const entry of requests.current.values()) entry.reject(new Error('Bộ xử lý PDF gặp lỗi. Đóng tài liệu và mở lại.')); requests.current.clear(); };
      worker.current = instance;
    }
    const id = ++sequence.current;
    return new Promise<Reply>((resolve, reject) => { requests.current.set(id, { resolve, reject }); worker.current!.postMessage({ ...payload, id }); });
  }
  function commit(next: Page[]) {
    setHistory(current => ({ pages: next, past: [...current.past.slice(-29), current.pages], future: [] }));
    setSelected([]); setError(''); setNotice('Thay đổi chưa lưu. Bản gốc không bị ghi đè.');
  }
  async function open(file: File, insert: boolean) {
    if (!insert) reset();
    const currentSession = session.current; setError(''); setNotice('');
    if (file.size === 0 || totalBytes.current + file.size > 50 * 1024 * 1024) { setError('Tổng dung lượng nguồn tối đa 50 MB, file không được rỗng.'); return; }
    setBusy(true);
    try {
      const buffer = await file.arrayBuffer(); if (currentSession !== session.current) return;
      const response = await request({ type: 'load', bytes: buffer.slice(0), reset: !insert }); if (currentSession !== session.current) return;
      const pdfjs = await import('pdfjs-dist'); pdfjs.GlobalWorkerOptions.workerSrc = '/ocr-assets/pdf/pdf.worker.min.mjs';
      if (currentSession !== session.current) return;
      const task = pdfjs.getDocument({ data: new Uint8Array(buffer), cMapUrl: '/ocr-assets/pdf/cmaps/', cMapPacked: true, standardFontDataUrl: '/ocr-assets/pdf/standard_fonts/', wasmUrl: '/ocr-assets/pdf/wasm/' });
      pdfTasks.current.set(response.source, task);
      const document = await task.promise;
      if (currentSession !== session.current) { await task.destroy(); return; }
      documents.current.set(response.source, document); setSourceDocuments(new Map(documents.current)); totalBytes.current += file.size;
      if (insert) { setInsertSource({ source: response.source, count: response.count, name: file.name }); setInsertRange(`1-${response.count}`); }
      else {
        const initial = Array.from({ length: response.count }, (_, index) => ({ id: crypto.randomUUID(), source: response.source, index, rotation: 0, name: file.name }));
        setHistory({ pages: initial, past: [], future: [] }); setActive(initial[0].id); setSelected([initial[0].id]);
      }
    } catch (err) { if (currentSession === session.current) setError(err instanceof Error ? err.message : 'Không đọc được PDF.'); }
    finally { if (currentSession === session.current) setBusy(false); }
  }
  function targets() { return selected.length ? selected : focused ? [focused.id] : []; }
  function rotate() { const ids = targets(); commit(pages.map(page => ids.includes(page.id) ? { ...page, rotation: (page.rotation + 90) % 360 } : page)); setSelected(ids); }
  function remove() {
    const ids = targets(), remaining = pages.filter(page => !ids.includes(page.id));
    if (!remaining.length) { setError('Phải giữ ít nhất một trang.'); return; }
    commit(remaining); if (ids.includes(active)) setActive(remaining[0].id);
  }
  function move(delta: number) {
    const index = pages.findIndex(page => page.id === focused?.id), to = index + delta; if (to < 0 || to >= pages.length) return;
    const next = [...pages]; [next[index], next[to]] = [next[to], next[index]]; commit(next);
  }
  function insertPages() {
    if (!insertSource) return;
    try {
      if (!Number.isInteger(position) || position < 0 || position > pages.length) throw new Error('Vị trí chèn không hợp lệ.');
      const indices = parsePageSelection(insertRange, insertSource.count);
      if (pages.length + indices.length > 300) throw new Error('Tài liệu kết quả tối đa 300 trang.');
      const additions = indices.map(index => ({ id: crypto.randomUUID(), source: insertSource.source, index, rotation: 0, name: insertSource.name }));
      commit([...pages.slice(0, position), ...additions, ...pages.slice(position)]); setActive(additions[0].id); setInsertSource(null); setInserting(false);
    } catch (err) { setError((err as Error).message); }
  }
  async function save(extract: boolean) {
    const output = extract ? pages.filter(page => targets().includes(page.id)) : pages;
    const currentSession = session.current; setBusy(true); setError('');
    try {
      const response = await request({ type: 'export', pages: output }); if (currentSession !== session.current) return;
      const url = URL.createObjectURL(new Blob([response.bytes], { type: 'application/pdf' })); const link = document.createElement('a');
      link.href = url; link.download = extract ? 'cac-trang-da-chon.pdf' : 'pdf-da-chinh-sua.pdf'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
      setNotice(`Đã xuất ${response.count} trang. ${extract ? 'Các trang vẫn được giữ trong tài liệu đang sửa.' : 'Bản gốc không thay đổi.'}`);
    } catch (err) { if (currentSession === session.current) setError((err as Error).message); }
    finally { if (currentSession === session.current) setBusy(false); }
  }
  const button = 'inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed';
  return <div className="space-y-4">
    <h1 className="flex items-center gap-2 text-2xl font-bold"><Files />Trình chỉnh sửa PDF</h1>
    <p className="text-sm text-slate-600">Mở một PDF và thao tác trực tiếp trên các trang. Xử lý trên máy bạn, không upload file.</p>
    <label className="block rounded-xl border bg-white p-4 text-sm font-semibold">Mở PDF<input aria-label="Mở PDF" type="file" accept=".pdf,application/pdf" disabled={busy} className="mt-2 block w-full font-normal" onChange={event => { const file = event.target.files?.[0]; if (file) void open(file, false); event.target.value = ''; }} /></label>
    {pages.length > 0 && <>
      <div className="sticky top-16 z-20 flex flex-wrap gap-2 rounded-xl border bg-slate-50 p-3">
        <button className={button} disabled={busy} onClick={rotate}><RotateCw size={16} />Xoay 90°</button>
        <button className={button} disabled={busy} onClick={remove}><Trash2 size={16} />Xóa trang</button>
        <button className={button} disabled={busy} onClick={() => { setPosition(pages.findIndex(page => page.id === focused.id) + 1); setInserting(!inserting); }}><Plus size={16} />Chèn từ PDF khác</button>
        <button className={button} disabled={busy} onClick={() => void save(true)}><Scissors size={16} />Tách trang đã chọn</button>
        <button aria-label="Hoàn tác" className={button} disabled={busy || !history.past.length} onClick={() => { setHistory(current => ({ pages: current.past.at(-1)!, past: current.past.slice(0,-1), future: [current.pages, ...current.future] })); setSelected([]); }}><Undo2 size={16} /></button>
        <button aria-label="Làm lại" className={button} disabled={busy || !history.future.length} onClick={() => { setHistory(current => ({ pages: current.future[0], past: [...current.past, current.pages], future: current.future.slice(1) })); setSelected([]); }}><Redo2 size={16} /></button>
        <button className={`${button} ml-auto !bg-blue-700 text-white`} disabled={busy} onClick={() => void save(false)}><Download size={16} />Lưu PDF</button>
      </div>
      {inserting && <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm">
        <label className="block">Chọn PDF để chèn<input aria-label="PDF để chèn" type="file" accept=".pdf" disabled={busy} className="mt-2 block" onChange={event => { const file = event.target.files?.[0]; if (file) void open(file, true); event.target.value = ''; }} /></label>
        {insertSource && <p>{insertSource.name} · {insertSource.count} trang</p>}
        <label className="block">Trang nguồn cần chèn<input aria-label="Trang nguồn cần chèn" value={insertRange} disabled={busy} onChange={event => setInsertRange(event.target.value)} placeholder="1,3-5" className="ml-2 rounded border bg-white p-2" /></label>
        <label className="block">Vị trí chèn<select aria-label="Vị trí chèn" value={position} disabled={busy} onChange={event => setPosition(Number(event.target.value))} className="ml-2 rounded border bg-white p-2"><option value={0}>Đầu tài liệu</option>{pages.map((page,index) => <option key={page.id} value={index + 1}>Sau trang {index + 1}{index === pages.length - 1 ? ' (cuối tài liệu)' : ''}</option>)}</select></label>
        <button className={button} disabled={busy || !insertSource} onClick={insertPages}>Chèn các trang</button>
      </div>}
      <div className="flex flex-wrap items-center gap-2 text-sm"><span>{pages.length} trang · đã chọn {selected.length}</span><input aria-label="Chọn theo số trang" placeholder="1,3,5-8" value={range} onChange={event => setRange(event.target.value)} className="w-36 rounded border p-2" /><button className={button} disabled={busy} onClick={() => { try { setSelected(parsePageSelection(range, pages.length).map(index => pages[index].id)); setError(''); } catch (err) { setError((err as Error).message); } }}>Chọn trang</button><button className={button} disabled={busy} onClick={() => setSelected(pages.map(page => page.id))}>Chọn tất cả</button><button className={button} disabled={busy} onClick={() => setSelected([])}>Bỏ chọn</button></div>
      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <div className="grid max-h-[800px] grid-cols-2 content-start items-start auto-rows-max gap-3 overflow-auto rounded-xl border bg-slate-100 p-3">{pages.map((page,index) => <div key={page.id} className={`rounded-lg border-2 p-2 ${focused.id === page.id ? 'border-blue-600 bg-blue-50' : 'border-transparent bg-white'}`}>
          <label className="mb-2 flex items-center gap-2 text-xs"><input aria-label={`Chọn trang ${index+1}`} type="checkbox" disabled={busy} checked={selected.includes(page.id)} onChange={event => { setActive(page.id); setSelected(previous => event.target.checked ? [...previous, page.id] : previous.filter(id => id !== page.id)); }} />Trang {index + 1}</label>
          <button aria-label={`Xem trang ${index+1}`} className="w-full cursor-pointer" onClick={() => setActive(page.id)}><PdfPagePreview document={sourceDocuments.get(page.source)!} index={page.index} rotation={page.rotation} width={150} /></button>
          <p className="mt-1 truncate text-[10px] text-slate-500" title={page.name}>{page.name} · gốc {page.index+1}</p>
        </div>)}</div>
        <div className="rounded-xl border bg-slate-200 p-3"><div className="mb-3 flex items-center justify-between gap-2 text-sm"><span>Trang {pages.findIndex(page => page.id === focused.id)+1} · xoay thêm {focused.rotation}°</span><div className="flex gap-2"><button aria-label="Di chuyển trang sang trái" className={button} disabled={busy || pages[0].id === focused.id} onClick={() => move(-1)}><ArrowLeft size={16} /></button><button aria-label="Di chuyển trang sang phải" className={button} disabled={busy || pages.at(-1)?.id === focused.id} onClick={() => move(1)}><ArrowRight size={16} /></button></div></div><PdfPagePreview key={focused.id} document={sourceDocuments.get(focused.source)!} index={focused.index} rotation={focused.rotation} width={760} /></div>
      </div>
    </>}
    {busy && <p role="status" className="text-sm text-blue-700">Đang xử lý trên máy bạn…</p>}
    {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    <button className={button} onClick={reset}>{busy ? 'Hủy và đóng tài liệu' : 'Đóng tài liệu'}</button>
    <p className="text-xs text-slate-500">Chọn nhiều trang bằng ô đánh dấu hoặc khoảng trang. Nếu không đánh dấu, thao tác áp dụng cho trang đang xem. Tối đa 50 MB, 20 file nguồn, 300 trang; hoàn tác 30 bước. Chưa hỗ trợ sửa chữ trong trang, PDF có mật khẩu hoặc bảo toàn chữ ký số/biểu mẫu/bookmark. Đóng trang sẽ mất thay đổi chưa tải xuống.</p>
  </div>;
}
