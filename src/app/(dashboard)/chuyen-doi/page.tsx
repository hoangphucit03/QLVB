'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FileText, Download, ScanText, X, ShieldCheck } from 'lucide-react';
import { BrowserConverter, buildWord, MAX_FILE_BYTES, type ConvertedPage } from '@/lib/browser-converter';

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<ConvertedPage[]>([]);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [forceOcr, setForceOcr] = useState(false);
  const [message, setMessage] = useState('Chọn PDF hoặc ảnh để bắt đầu.');
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const engine = useRef<BrowserConverter | null>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const mounted = useRef(true);
  const currentPage = pages[active];

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; void engine.current?.cancel(); };
  }, []);
  useEffect(() => {
    if (!currentPage) { setPreview(''); return; }
    const url = URL.createObjectURL(currentPage.preview); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [currentPage]);

  function chooseFile(files: File[], fromClipboard = false) {
    if (busy || exporting) return;
    setFile(null); setPages([]); setComplete(false); setError(''); setActive(0);
    if (fromClipboard && input.current) input.current.value = '';
    if (files.length !== 1) { setError('Vui lòng chọn hoặc dán một file mỗi lần.'); return; }
    const selected = files[0];
    if (selected.size === 0 || selected.size > MAX_FILE_BYTES) { setError('File phải có dữ liệu và không vượt quá 20 MB.'); return; }
    if (!['application/pdf', 'image/png', 'image/jpeg'].includes(selected.type) && !/\.(pdf|png|jpe?g)$/i.test(selected.name)) {
      setError('Chỉ hỗ trợ PDF, PNG hoặc JPG.'); return;
    }
    setFile(selected); setMessage(`Đã nhận ${selected.name}. Sẵn sàng xử lý.`);
  }

  async function start() {
    if (!file || busy) return;
    setBusy(true); setPages([]); setActive(0); setError(''); setComplete(false); setPercent(0);
    const converter = new BrowserConverter((text, progress) => { if (mounted.current) { setMessage(text); setPercent(progress); } });
    engine.current = converter;
    try {
      await converter.convert(file, forceOcr, page => { if (mounted.current) setPages(previous => [...previous, page]); });
      if (mounted.current) setComplete(true);
    } catch (err) {
      if (!mounted.current) return;
      setPages([]);
      if (err instanceof DOMException && err.name === 'AbortError') setMessage('Đã hủy. Dữ liệu xử lý đã được bỏ.');
      else { setError(err instanceof Error ? err.message : 'Không thể xử lý tài liệu.'); setMessage('Xử lý chưa hoàn tất.'); }
    } finally { if (mounted.current) setBusy(false); engine.current = null; }
  }

  function save(blob: Blob, extension: string) {
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `${file?.name.replace(/\.[^.]+$/, '') || 'tai-lieu'}.${extension}`;
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
  async function word(layout: boolean) {
    setExporting(true); setError('');
    try { save(await buildWord(pages, layout), 'docx'); }
    catch { setError('Không thể xuất Word. Hãy thử xuất text hoặc giảm số trang.'); }
    finally { if (mounted.current) setExporting(false); }
  }
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  return <div className="space-y-5" onPaste={event => {
    const files = Array.from(event.clipboardData.files);
    if (!files.length) return; // Preserve ordinary text paste in the editor.
    event.preventDefault(); chooseFile(files, true);
  }} onDragOver={event => { if (event.dataTransfer.types.includes('Files')) event.preventDefault(); }} onDrop={event => {
    if (!event.dataTransfer.files.length) return;
    event.preventDefault(); chooseFile(Array.from(event.dataTransfer.files), true);
  }}>
    <div><h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800"><ScanText className="text-blue-700" />Chuyển đổi PDF / ảnh</h1><p className="mt-1 text-sm text-slate-500">Nhận dạng tiếng Việt và tiếng Anh, xuất text hoặc Word chỉnh sửa được.</p></div>
    <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><ShieldCheck className="shrink-0" /><p>File được xử lý trong trình duyệt trên máy của bạn. Chức năng này không gửi file hay nội dung nhận dạng lên Vercel, Google Sheets hoặc API bên ngoài. Bộ nhận dạng được tải từ website.</p></div>
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <label className="block text-sm font-semibold text-slate-700">Tài liệu đầu vào (PDF, PNG, JPG · tối đa 20 MB / 30 trang)
        <input ref={input} aria-label="Chọn tài liệu" type="file" accept=".pdf,.png,.jpg,.jpeg" disabled={busy || exporting} className="mt-2 block w-full rounded-lg border border-slate-300 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-800" onChange={event => { if (event.target.files?.length) chooseFile(Array.from(event.target.files)); }} />
      </label>
      <div tabIndex={0} role="region" aria-label="Dán hoặc thả tài liệu" className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-5 text-center text-sm text-slate-600 focus:border-blue-600 focus:outline-none">
        <p className="font-semibold text-blue-800">Bấm vào đây rồi nhấn Ctrl+V để dán ảnh/file, hoặc kéo thả vào trang</p>
        <p className="mt-1 text-xs">Có thể dán ảnh chụp màn hình. Nếu trình duyệt không nhận file đã copy, hãy kéo thả hoặc chọn file.</p>
        {file && <p className="mt-2 break-all font-medium text-slate-800">Đã chọn: {file.name}</p>}
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={forceOcr} disabled={busy} onChange={event => setForceOcr(event.target.checked)} /> Luôn OCR (dùng khi PDF có lớp chữ sai hoặc thiếu)</label>
      <div className="flex flex-wrap gap-2"><button className={`${button} bg-blue-700 text-white hover:bg-blue-800`} disabled={!file || busy || exporting} onClick={start}><ScanText size={17} />Nhận dạng tài liệu</button>
        {busy && <button className={`${button} bg-rose-50 text-rose-700`} onClick={() => { setMessage('Đang hủy…'); void engine.current?.cancel(); }}><X size={17} />Hủy xử lý</button>}
        {!busy && pages.length > 0 && <button className={`${button} bg-slate-100 text-slate-600`} disabled={exporting} onClick={() => { setPages([]); setComplete(false); setMessage('Đã xóa kết quả khỏi trang.'); }}>Xóa kết quả</button>}
      </div>
      <div role="status" className="text-sm text-slate-600">{message}</div>
      {busy && <progress className="h-2 w-full accent-blue-700" max={100} value={percent} aria-label="Tiến độ xử lý" />}
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    </div>
    {pages.length > 0 && <>
      <div className="flex flex-wrap items-center gap-2">
        <button className={`${button} border border-slate-200 bg-white`} disabled={!complete || busy || exporting} onClick={() => save(new Blob(['\uFEFF', pages.map(page => page.text).join('\n\n--- Trang tiếp theo ---\n\n')], { type: 'text/plain;charset=utf-8' }), 'txt')}><Download size={17} />Tải text</button>
        <button className={`${button} bg-blue-700 text-white`} disabled={!complete || busy || exporting} onClick={() => void word(true)}><FileText size={17} />{exporting ? 'Đang tạo Word…' : 'Word giữ vị trí chữ'}</button>
        <button className={`${button} border border-slate-200 bg-white`} disabled={!complete || busy || exporting} onClick={() => void word(false)}>Word theo nội dung đã sửa</button>
        <label className="ml-auto text-sm text-slate-600">Trang <select aria-label="Trang xem trước" className="rounded border p-2" value={active} onChange={event => setActive(Number(event.target.value))}>{pages.map((page, index) => <option key={index} value={index}>{index + 1} ({page.source})</option>)}</select></label>
      </div>
      <p className="text-xs text-amber-800">Word giữ vị trí chữ dùng kết quả nhận dạng ban đầu, không áp dụng phần text bạn sửa. Bản này chưa phục dựng hình ảnh, con dấu hoặc đường kẻ bảng; font và xuống dòng có thể khác bản gốc. Hãy đối chiếu trước khi sử dụng.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-auto rounded-xl border bg-slate-100 p-3"><p className="mb-2 text-sm font-semibold text-slate-600">Bản gốc — trang {active + 1}</p>{preview && <Image unoptimized src={preview} width={Math.round(currentPage.width)} height={Math.round(currentPage.height)} alt={`Bản gốc trang ${active + 1}`} className="h-auto w-full" />}</div>
        <div className="rounded-xl border bg-white p-3"><label className="mb-2 block text-sm font-semibold text-slate-600" htmlFor="recognized-text">Nội dung nhận dạng — có thể sửa</label><textarea id="recognized-text" disabled={busy || exporting} className="min-h-[600px] w-full rounded-lg border border-slate-200 p-3 text-sm leading-7 outline-blue-500" value={currentPage?.text || ''} onChange={event => setPages(previous => previous.map((page, index) => index === active ? { ...page, text: event.target.value } : page))} /></div>
      </div>
    </>}
    <p className="text-xs text-slate-500">Máy yếu có thể xử lý chậm. Đóng hoặc tải lại trang sẽ mất kết quả chưa tải xuống. PDF có mật khẩu cần được mở khóa trước khi sử dụng.</p>
  </div>;
}
