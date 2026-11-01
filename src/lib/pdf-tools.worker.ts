import { PDFDocument, degrees } from 'pdf-lib';
let sources: PDFDocument[] = [];
self.onmessage = async (event: MessageEvent) => {
  const message = event.data;
  try {
    if (message.type === 'load') {
      const bytes = message.bytes as ArrayBuffer;
      if (!new TextDecoder().decode(new Uint8Array(bytes).slice(0, 8)).startsWith('%PDF-')) throw new Error('File không phải PDF hợp lệ.');
      const document = await PDFDocument.load(bytes, { updateMetadata: false });
      if (!document.getPageCount()) throw new Error('PDF không có trang.');
      const existing = message.reset ? [] : sources;
      if (existing.length >= 20 || existing.reduce((sum, doc) => sum + doc.getPageCount(), 0) + document.getPageCount() > 300) throw new Error('Tối đa 20 file và 300 trang nguồn mỗi phiên.');
      sources = [...existing, document];
      self.postMessage({ id: message.id, source: sources.length - 1, count: document.getPageCount() });
      return;
    }
    const pages = message.pages as { source: number; index: number; rotation: number }[];
    if (!pages?.length || pages.length > 300) throw new Error('Kết quả cần có từ 1 đến 300 trang.');
    const output = await PDFDocument.create();
    for (const entry of pages) {
      const source = sources[entry.source];
      if (!source || !Number.isInteger(entry.index) || entry.index < 0 || entry.index >= source.getPageCount()) throw new Error('Trang không hợp lệ.');
      const [copy] = await output.copyPages(source, [entry.index]);
      copy.setRotation(degrees((copy.getRotation().angle + entry.rotation) % 360)); output.addPage(copy);
    }
    const bytes = await output.save();
    self.postMessage({ id: message.id, bytes: bytes.buffer, count: output.getPageCount() }, { transfer: [bytes.buffer] });
  } catch (error) {
    const text = error instanceof Error ? error.message : '';
    self.postMessage({ id: message.id, error: /encrypt/i.test(text) ? 'PDF có mật khẩu/bảo vệ. Hãy dùng bản đã mở khóa.' : text || 'Không thể xử lý PDF.' });
  }
};
